import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server"
import { formatDate, timeStringToComponents } from "@/lib/utils";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const attendanceRecords = await ctx.db
      .query("attendance")
      .order('desc')
      .collect();

    // Join with user data
    const attendanceWithUsers = await Promise.all(
      attendanceRecords.map(async (record) => {
        const user = await ctx.db
          .query("users")
          .filter((q) => q.eq(q.field("_id"), record.userId))
          .unique();

        return {
          ...record,
            employee: {...user}
        };
      })
    );

    return attendanceWithUsers;
  },
});

export const listByUser = query({
    args: {
      userId: v.id("users"),
    },
    handler: async (ctx, args) => {
      const attendanceRecords = await ctx.db.query("attendance").filter((q) => q.eq(q.field("userId"), args.userId)).collect()
      const attendanceWithUsers = await Promise.all(
        attendanceRecords.map(async (record) => {
          const user = await ctx.db
            .query("users")
            .filter((q) => q.eq(q.field("_id"), record.userId))
            .unique();
  
          return {
            ...record,
              employee: {...user}
          };
        })
      );
      return attendanceWithUsers
    },
})

export const listByUserAndDateRange = query({
    args: {
      userId: v.string(),
      startDate: v.string(),
      endDate: v.string(),
    },
    handler: async (ctx, args) => {
      return await ctx.db
        .query("attendance")
        .filter((q) => 
          q.and(
            q.eq(q.field("userId"), args.userId),
            q.gte(q.field("date"), args.startDate),
            q.lte(q.field("date"), args.endDate)
          )
        )
        .collect();
    },
  });

export const timeIn = mutation({
    args: {
      timeIn: v.string(),
      userId: v.id("users"),
      date: v.string(),
      type: v.string(),
    },
    handler: async (ctx, args) => {
      // Check for existing time-in record for the user on the same date
      const existingRecord = await ctx.db
        .query("attendance")
        .filter((q) => 
          q.and(
            q.eq(q.field("userId"), args.userId),
            q.eq(q.field("date"), args.date)
          )
        )
        .unique();

      
      if (existingRecord) {
        throw new Error("User has already timed in for this date");
      }
      
      return await ctx.db.insert("attendance", {
        timeIn: args.timeIn,
        userId: args.userId,
        date: args.date,
        type: args.type,
        status: "Present",
      });
    },
});

export const timeOut = mutation({
    args: {
      timeOut: v.string(),
      userId: v.id("users"),
      date: v.string(),
    },  
    handler: async (ctx, args) => {
      const existingRecord = await ctx.db
        .query("attendance")
        .filter((q) => 
          q.and(
            q.eq(q.field("userId"), args.userId),
            q.eq(q.field("date"), args.date)
          )
        )
        .unique();

      if (existingRecord === null) {
        throw new ConvexError({ message: "You need to time in first before timing out" });
      }
      
      if(existingRecord.timeOut) {
        throw new ConvexError({ message: "You have already timed out for today" });
      }

      // Get the employee's rate per day
      const employee = await ctx.db.get(args.userId);
      if (!employee?.ratePerDay) {
        throw new ConvexError({ message: "Employee rate per day not set" });
      }

      const {hours, minutes} = timeStringToComponents(args.timeOut)
      // Calculate time period (1-15 or 16-end of month)
      const timeOutDate = new Date();
      const day = timeOutDate.getDate();
      const month = timeOutDate.getMonth() + 1;
      const year = timeOutDate.getFullYear();

  
      let startDate, endDate;
      if (day <= 15) {
        startDate = `${year}-${month.toString().padStart(2, '0')}-01`;
        endDate = `${year}-${month.toString().padStart(2, '0')}-15`;
      } else {
        startDate = `${year}-${month.toString().padStart(2, '0')}-16`;
        endDate = new Date(year, month, 0).toISOString().split('T')[0]; // Last day of month
      }
   
      // Adjust time counting to start from 8am
      const workStartHour = 8; // Work day starts at 8am
      
      // Check if the date is a holiday
      const isHoliday = await ctx.db
        .query("holidays")
        .filter((q) =>
          q.and(
            q.eq(q.field("date"), formatDate(args.date)),
            q.eq(q.field("isArchived"), false)
          )
        )
        .unique();
      const timeIn = timeStringToComponents(existingRecord.timeIn)
      // Adjust timeIn if before 8am to count from 8am
      let adjustedTimeInDate = timeIn.hours;

      if (adjustedTimeInDate < workStartHour) {
        adjustedTimeInDate = 8;
      }

  
      // Check for existing salary component
      const payrollPeriod = await ctx.db
        .query("payrollPeriods")
        .filter((q) =>
          q.and(
            q.eq(q.field("startDate"), startDate),
            q.eq(q.field("endDate"), endDate)
          )
        )
        .unique();

      if (!payrollPeriod) {
        throw new ConvexError({ message: "No payroll period found for these dates" });
      }

      const existingSalaryComponent = await ctx.db
        .query("salaryComponents")
        .filter((q) => 
          q.and(
            q.eq(q.field("userId"), args.userId),
            q.eq(q.field("payrollPeriodId"), payrollPeriod._id)
          )
        )
        .unique();

      // Calculate late minutes if employee timed in after 8 AM
      const lateMinutes = Math.max(0, 
        (timeIn.hours - 8) * 60 + timeIn.minutes
      );
      const employeeRatePerDay = isHoliday?.type === "Regular" ? employee.ratePerDay * 2 : isHoliday?.type === "Special" ? employee.ratePerDay * 1.5 : employee.ratePerDay
      // Calculate deduction for being late (rate per minute * late minutes)
      const ratePerMinute = employeeRatePerDay / (8 * 60); // 8 hours work day
      console.log("ratePerMinute", ratePerMinute)
      const lateDeduction = lateMinutes * ratePerMinute;
      console.log("lateDeduction", lateDeduction)

      // Calculate overtime hours (only count hours after 5 PM)
      const timeOutHours = hours + (minutes / 60);
      console.log("timeOutHours", timeOutHours)
      const timeInHours = adjustedTimeInDate + (minutes / 60);
   
      const totalHours = (timeOutHours <= 13 ? timeOutHours : timeOutHours - 1) - timeInHours;
      const overtimeHours = Math.floor(Math.max(0, timeOutHours - 17)); // Only count hours after 5 PM (17:00)

      const ratePerHour = employeeRatePerDay / 8
     
      const grossPay = (totalHours - overtimeHours) * ratePerHour
      const overtimeRate = (employeeRatePerDay / 8) * 1.25
      // Calculate overtime pay (1.25x hourly rate)
      const overtimePay = overtimeHours > 0 ? {
        hours: overtimeHours,
        rate: overtimeRate, // 25% premium on hourly rate
        amount: overtimeHours * overtimeRate
      } : undefined;
      
      
      if (existingSalaryComponent) {
      
       const netpay = (existingSalaryComponent.basicPay + (overtimePay?.amount || 0)) - ((existingSalaryComponent.deductions.reduce((acc, curr) => acc + curr.amount, 0) || 0))
        await ctx.db.patch(existingSalaryComponent._id, {
          basicPay: existingSalaryComponent.basicPay + grossPay,
          hoursWorked: (existingSalaryComponent.hoursWorked || 0) + totalHours,
          deductions: [
            ...existingSalaryComponent.deductions,
            ...(lateDeduction > 0 ? [{
              type: "Late",
              amount: lateDeduction
            }] : [])
          ],
          governmentContributions: {
            sss: existingSalaryComponent.governmentContributions.sss,
            philHealth: existingSalaryComponent.governmentContributions.philHealth,
            pagIbig: existingSalaryComponent.governmentContributions.pagIbig,
            tax: existingSalaryComponent.governmentContributions.tax
          },
          overtime: overtimePay ? {
            hours: (existingSalaryComponent.overtime?.hours || 0) + overtimePay.hours,
            rate: overtimePay.rate, // Keep the same rate
            amount: (existingSalaryComponent.overtime?.amount || 0) + overtimePay.amount
          } : existingSalaryComponent.overtime,
          netPay: netpay
        });
      } else {
        const isFirstHalf = (date: Date) => date.getDate() <= 15;

        const currentUser = await ctx.db.get(args.userId);
        if (!currentUser) {
          throw new Error("User not found");
        }

        const convexDate = new Date();
        const isSalaryFirstHalf = isFirstHalf(convexDate);

        const contributionSchedules = {
          pagIbig: currentUser?.pagIbigSchedule,
          tax: currentUser?.incomeTaxSchedule,
          sss: currentUser?.sssSchedule,
          philHealth: currentUser?.philHealthSchedule,
        };

        const contributions = {
          pagIbig: currentUser?.pagIbigContribution || 0,
          tax:currentUser?.incomeTax || 0,
          sss: currentUser?.sssContribution || 0,
          philHealth: currentUser?.philHealthContribution || 0,
        };

        const governmentContributions = Object.fromEntries(
          Object.entries(contributionSchedules).map(([key, schedule]) => {
            const isFirstHalfSchedule = schedule === '1st half';
            const isSecondHalfSchedule = schedule === '2nd half';
            const contribution = contributions[key as keyof typeof contributions];
            return [
              key,
              (isSalaryFirstHalf && isFirstHalfSchedule) || (!isSalaryFirstHalf && isSecondHalfSchedule)
                ? contribution
                : 0,
            ];
          })
        );

        const { pagIbig, tax, sss, philHealth } = governmentContributions;

        await ctx.db.insert("salaryComponents", {
          userId: args.userId,
          payrollPeriodId: payrollPeriod._id,
          basicPay: grossPay,
          hoursWorked: totalHours,
          allowances: [],
          deductions: lateDeduction > 0 ? [{ type: "Late", amount: lateDeduction }] : [],
          governmentContributions: {
            sss: sss,
            philHealth: philHealth,
            pagIbig: pagIbig,
            tax: tax,
          },
          overtime: overtimePay,
          netPay: grossPay + (overtimePay?.amount || 0),
          additionalCompensation: [],
        });
      }

      return await ctx.db.patch(existingRecord._id, {
        timeOut: args.timeOut,
      });
    },
})

export const getAttendanceRecords = query({
  args: {
    userId: v.optional(v.id("users")),
    startDate: v.optional(v.string()),
    endDate: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let attendanceQuery = ctx.db.query("attendance");

    // If userId is provided, filter by user
    if (args.userId) {
      attendanceQuery = attendanceQuery.filter((q) => 
        q.eq(q.field("userId"), args.userId)
      );
    }

    // If date range is provided, filter by date range
    if (args.startDate && args.endDate) {
      attendanceQuery = attendanceQuery.filter((q) => 
        q.and(
          q.gte(q.field("date"), args.startDate!),
          q.lte(q.field("date"), args.endDate!)
        )
      );
    }

    const attendanceRecords = await attendanceQuery
      .order("desc")
      .collect();

    // Join with user data
    const attendanceWithUsers = await Promise.all(
      attendanceRecords.map(async (record) => {
        const user = await ctx.db
          .query("users")
          .filter((q) => q.eq(q.field("_id"), record.userId))
          .unique();

        // Calculate status based on timeIn
        let status = record.status;
        if (record.timeIn) {
          const timeInHour = new Date(record.timeIn).getHours();
          const timeInMinute = new Date(record.timeIn).getMinutes();
          
          // Assuming work starts at 9:00 AM
          if (timeInHour > 9 || (timeInHour === 9 && timeInMinute > 0)) {
            status = "Late";
          }
        }

        return {
          ...record,
          status,
          employee: user ? { ...user } : null,
        };
      })
    );

    return attendanceWithUsers;
  },
});


export const getAttendanceByDateRange = query({
  args: {
    startDate: v.string(),
    endDate: v.string(),
    userId: v.id("users")
  },
  handler: async (ctx, args) => {
    const attendanceRecords = await ctx.db
      .query("attendance")
      .filter((q) => 
        q.and(
          q.eq(q.field("userId"), args.userId),
          q.gte(q.field("date"), args.startDate),
          q.lte(q.field("date"), args.endDate)
        )
      )
      .collect();

    // Join with user data and calculate status
    const attendanceWithUsers = await Promise.all(
      attendanceRecords.map(async (record) => {
      
        let hoursWorked = 0;
        if (record.timeIn && record.timeOut) {
          const timeOutHour = new Date(record.timeOut).getHours();
          hoursWorked = timeOutHour > 13 ? timeOutHour - 1 : timeOutHour;
        }

        return {
       
          hoursWorked,
      
        };
      })
    );

    return attendanceWithUsers;
  }
});
