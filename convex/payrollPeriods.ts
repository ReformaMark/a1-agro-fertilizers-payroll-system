
import { query } from "./_generated/server";

export const list = query({
    handler: async (ctx) => {
        const periods = await ctx.db
            .query("payrollPeriods")
            .order("desc")
            .collect();

        // Get processor details for each period
        const periodsWithProcessor = await Promise.all(
            periods.map(async (period) => {
                const processor = await ctx.db.get(period.processedBy);
                return {
                    ...period,
                    processor
                };
            })
        );

        return periodsWithProcessor;
    }
});
