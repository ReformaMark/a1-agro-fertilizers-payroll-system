import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation, query } from "./_generated/server"
import { v } from "convex/values"

export const create = mutation({
    args: {
        action: v.string(),
        entityType: v.string(),
        entityId: v.id("users"),
        details: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const performedBy = await getAuthUserId(ctx);
        if (!performedBy) throw new Error("Not authenticated");

        return await ctx.db.insert("auditLogs", {
            ...args,
            performedBy,
            performedAt: new Date().toISOString(),
        });
    },
});

export const list = query({
    args: {},
    handler: async (ctx) => {
        const logs = await ctx.db
            .query("auditLogs")
            .order("desc")
            .take(100);

        // Join with user data to get performer names
        const logsWithUsers = await Promise.all(
            logs.map(async (log) => {
                const performer = await ctx.db
                    .query("users")
                    .filter(q => q.eq(q.field("_id"), log.performedBy))
                    .unique();
                return {
                    ...log,
                    performedByUser: performer,
                };
            })
        );

        return logsWithUsers;
    },
});