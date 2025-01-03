import { v } from "convex/values";
import { query } from "./_generated/server";


export const listByPayrollPeriod = query({
    args: {
        startDate: v.string(),
        endDate: v.string()
    },
    handler: async (ctx, args) => {
        // First find the payroll period matching the date range
        const payrollPeriod = args.startDate && args.endDate ? await ctx.db
            .query("payrollPeriods")
            .withIndex("by_date_range", (q) => 
                q.eq("startDate", args.startDate)
                .eq("endDate", args.endDate)
            )
            .first() : null;

        let salaryComponents;
        
        if (payrollPeriod) {
            // Get salary components for this payroll period
            salaryComponents = await ctx.db
                .query("salaryComponents")
                .withIndex("by_payroll_period", (q) => 
                    q.eq("payrollPeriodId", payrollPeriod._id)
                )
                .collect();
        } else {
            // If no matching period found, fetch all salary components
            salaryComponents = await ctx.db
                .query("salaryComponents")
                .collect();
        }

        // Get user details for each salary component
        const salaryComponentsWithUser = await Promise.all(
            salaryComponents.map(async (component) => {
                const user = await ctx.db.get(component.userId);
                return {
                    ...component,
                    employee: user,
                    payrollPeriod: payrollPeriod
                };
            })
        );

        return salaryComponentsWithUser;
    }
});


export const getSalaryComponentsByPayrollPeriod = query({
    args: {
        startDate: v.string(),
        endDate: v.string(),
        userId: v.id("users")
    },
    handler: async (ctx, args) => {

        // First, find the payroll period that matches the date range
        const payrollPeriod = await ctx.db
            .query("payrollPeriods")
            .withIndex("by_date_range", (q) => 
                q.eq("startDate", args.startDate)
                .eq("endDate", args.endDate)
            )
            .first();

        if (!payrollPeriod) {
            return null;
        }

        // Then find the salary component for this user and payroll period
        const salaryComponent = await ctx.db
            .query("salaryComponents")
            .withIndex("by_payroll_period", (q) =>
                q.eq("payrollPeriodId", payrollPeriod._id)
            )
            .filter((q) => q.eq(q.field("userId"), args.userId))
            .first();

        if (!salaryComponent) {
            return null;
        }

        // Include the employee details
        const employee = await ctx.db.get(salaryComponent.userId);

        return {
            ...salaryComponent,
            employee
        };
    }
})
