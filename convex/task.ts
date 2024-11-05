import { query } from "./_generated/server";

//test to be removed
export const get = query({
    args: {},
    handler: async (ctx) => {
        return await ctx.db.query("task").first();
    }
})