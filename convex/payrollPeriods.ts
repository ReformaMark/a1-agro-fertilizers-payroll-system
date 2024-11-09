
import { query } from "./_generated/server";

import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
    handler: async (ctx) => {
        const periods = await ctx.db
            .query("payrollPeriods")
            .order("desc")
            .collect();

        // Get processor details for each period
        const periodsWithProcessor = await Promise.all(
            periods.map(async (period) => {
                if (period.processedBy) {  
                const processor = await ctx.db.get(period.processedBy);
                return {
                    ...period,
                    processor
                    };
                } else {
                    return period;
                }
            })
        );

        return periodsWithProcessor;
    }
});


export const create = mutation({
  args: {
    startDate: v.string(),
    endDate: v.string(),
    processedBy: v.optional(v.id("users"))
  },
  handler: async (ctx, args) => {
    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(args.startDate) || !dateRegex.test(args.endDate)) {
      throw new Error("Dates must be in YYYY-MM-DD format");
    }

    // Validate start date is before end date
    const start = new Date(args.startDate);
    const end = new Date(args.endDate);
    if (start > end) {
      throw new Error("Start date must be before end date");
    }

    // Check for overlapping periods
    const existingPeriod = await ctx.db
      .query("payrollPeriods")
      .filter((q) =>
        q.or(
          q.and(
            q.lte(q.field("startDate"), args.startDate),
            q.gte(q.field("endDate"), args.startDate)
          ),
          q.and(
            q.lte(q.field("startDate"), args.endDate),
            q.gte(q.field("endDate"), args.endDate)
          )
        )
      )
      .first();

    if (existingPeriod) {
        return;
    }

    return await ctx.db.insert("payrollPeriods", {
      startDate: args.startDate,
      endDate: args.endDate,
      status: "Draft",
      processedBy: args.processedBy
    });
  }
});

