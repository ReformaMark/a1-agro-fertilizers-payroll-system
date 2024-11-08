
import { v } from "convex/values";
import { query } from "./_generated/server";

export const listByPayrollPeriod = query({
    args: {
        payrollPeriodId: v.optional(v.id("payrollPeriods"))
    },
    handler: async (ctx, args) => {
        let salaryComponents;
        
        if (args.payrollPeriodId) {
            salaryComponents = await ctx.db
                .query("salaryComponents")
                .withIndex("by_payroll_period", (q) => 
                    q.eq("payrollPeriodId", args.payrollPeriodId!)
                )
                .collect();
        } else {
            // If no payrollPeriodId is provided, fetch all salary components
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
                    employee: user
                };
            })
        );

        return salaryComponentsWithUser;
    }
});
