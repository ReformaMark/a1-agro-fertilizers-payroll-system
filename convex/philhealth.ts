import { query } from "./_generated/server";
import { v } from "convex/values";

export const getPhilhealthReport = query({
    args: {
        schedule: v.union(v.literal("1st half"), v.literal("2nd half")),
        startDate: v.optional(v.string()),
        endDate: v.optional(v.string())
    },
    handler: async (ctx, args) => {
        // Get all employees with their contributions
        const employees = await ctx.db
            .query("users")
            .filter(q =>
                q.and(
                    q.eq(q.field("role"), "employee"),
                    q.eq(q.field("philHealthSchedule"), args.schedule)
                )
            )
            .collect();

        // Get current PhilHealth table
        const philhealthTable = await ctx.db
            .query("contributionTables")
            .filter(q => q.eq(q.field("type"), "philhealth"))
            .first();

        // Calculate contributions for each employee
        return employees.map(employee => {
            const monthlyBasicSalary = employee.ratePerDay ? employee.ratePerDay * 22 : 0;
            let monthlyPremium = 0;

            if (philhealthTable?.ranges) {
                const range = philhealthTable.ranges.find(r =>
                    monthlyBasicSalary >= r.basicSalary.from &&
                    (!r.basicSalary.to || monthlyBasicSalary <= r.basicSalary.to)
                );

                if (range) {
                    if (monthlyBasicSalary <= 10000) {
                        monthlyPremium = 500;
                    } else if (monthlyBasicSalary <= 99999.99) {
                        monthlyPremium = monthlyBasicSalary * (range.premiumRate / 100);
                    } else {
                        monthlyPremium = 5000;
                    }
                }
            }

            const share = monthlyPremium / 2;

            return {
                employeeId: employee._id,
                name: `${employee.lastName}, ${employee.firstName}`,
                philHealthNumber: employee.philHealthNumber || "N/A",
                employeeShare: Number(share.toFixed(2)),
                employerShare: Number(share.toFixed(2)),
                monthlyBasicSalary,
                schedule: args.schedule
            };
        });
    },
});