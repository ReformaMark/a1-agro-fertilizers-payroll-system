import { ConvexError, v } from "convex/values"
import { mutation, query } from "./_generated/server"
import { getAuthUserId } from "@convex-dev/auth/server"

export const getTypes = query({
    args: {
        isArchived: v.boolean(),
    },
    handler: async (ctx, args) => {
        const types = await ctx.db
            .query("compensationTypes")
            .filter((q) =>
                args.isArchived !== undefined
                    ? q.eq(q.field("isArchived"), args.isArchived)
                    : q.not(q.field("isArchived"))
            )
            .collect()

        return types
    },
})

export const createType = mutation({
    args: {
        name: v.string(),
        description: v.string(),
        category: v.string(),
        taxable: v.boolean(),
        frequency: v.string(),
        computationType: v.string(),
        defaultAmount: v.optional(v.number()),
        formula: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx)
        if (!userId) throw new ConvexError("Unauthorized")

        return await ctx.db.insert("compensationTypes", {
            ...args,
            isArchived: false,
            createdBy: userId,
            modifiedAt: new Date().toISOString(),
        })
    },
})

export const getEmployeeCompensations = query({
    args: {
        userId: v.optional(v.id("users")),
        status: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        let query = ctx.db.query("employeeCompensation")
            .withIndex("by_user")

        if (args.userId) {
            query = query.filter(q => q.eq(q.field("userId"), args.userId))
        }

        if (args.status) {
            query = query.filter(q => q.eq(q.field("status"), args.status))
        }

        const compensations = await query.collect()

        // Fetch related compensation types
        const compensationTypes = await Promise.all(
            compensations.map(comp =>
                ctx.db.get(comp.compensationTypeId)
            )
        )

        return compensations.map((comp, i) => ({
            ...comp,
            compensationType: compensationTypes[i],
        }))
    },
})

export const updateType = mutation({
    args: {
        id: v.id("compensationTypes"),
        name: v.optional(v.string()),
        description: v.optional(v.string()),
        category: v.optional(v.string()),
        taxable: v.optional(v.boolean()),
        frequency: v.optional(v.string()),
        computationType: v.optional(v.string()),
        defaultAmount: v.optional(v.number()),
        formula: v.optional(v.string()),
        isArchived: v.optional(v.boolean()),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx)
        if (!userId) throw new ConvexError("Unauthorized")

        const { id, ...updates } = args

        return await ctx.db.patch(id, {
            ...updates,
            modifiedAt: new Date().toISOString(),
            modifiedBy: userId,
        })
    },
})
