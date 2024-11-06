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

        const [compensationTypes, users] = await Promise.all([
            Promise.all(compensations.map(comp =>
                ctx.db.get(comp.compensationTypeId)
            )),
            Promise.all(compensations.map(comp =>
                ctx.db.get(comp.userId)
            ))
        ])

        return compensations.map((comp, i) => ({
            ...comp,
            compensationType: compensationTypes[i],
            user: users[i]
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

export const getAdjustments = query({
    args: {
        userId: v.optional(v.id("users")),
        status: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        let query = ctx.db.query("compensationAdjustments")
            .withIndex("by_status")

        if (args.status) {
            query = query.filter(q => q.eq(q.field("status"), args.status))
        }

        const adjustments = await query.collect()

        // Fetch related employee compensations and types
        const employeeCompensations = await Promise.all(
            adjustments.map(adj =>
                ctx.db.get(adj.employeeCompensationId)
            )
        )

        const compensationTypes = await Promise.all(
            employeeCompensations.map(comp =>
                comp ? ctx.db.get(comp.compensationTypeId) : null
            )
        )

        // Fetch employee names
        // Fetch employee names
        const userIds = Array.from(new Set(employeeCompensations.map(comp => comp?.userId)))
        const users = await Promise.all(
            userIds.map(id => id ? ctx.db.get(id) : null)
        )

        const userMap = new Map(
            users.filter((user): user is NonNullable<typeof user> => user !== null)
                .map(user => [user._id, user])
        )

        return adjustments.map((adj, i) => ({
            ...adj,
            employeeCompensation: employeeCompensations[i] ? {
                ...employeeCompensations[i],
                compensationType: compensationTypes[i],
                user: userMap.get(employeeCompensations[i].userId),
            } : null,
        }))
    },
})

export const createAdjustment = mutation({
    args: {
        employeeCompensationId: v.id("employeeCompensation"),
        adjustmentType: v.string(),
        reason: v.string(),
        previousAmount: v.number(),
        newAmount: v.number(),
        effectiveDate: v.string(),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx)
        if (!userId) throw new ConvexError("Unauthorized")

        return await ctx.db.insert("compensationAdjustments", {
            ...args,
            status: "Pending",
            modifiedAt: new Date().toISOString(),
            modifiedBy: userId,
        })
    },
})

export const validateAdjustment = mutation({
    args: {
        previousAmount: v.number(),
        newAmount: v.number(),
        adjustmentType: v.string(),
    },
    handler: async (ctx, args) => {
        const { previousAmount, newAmount, adjustmentType } = args

        // Basic validation rules
        if (adjustmentType === "Increase" && newAmount <= previousAmount) {
            throw new ConvexError("New amount must be greater for an increase")
        }

        if (adjustmentType === "Decrease" && newAmount >= previousAmount) {
            throw new ConvexError("New amount must be lower for a decrease")
        }

        if (adjustmentType === "Suspension" && newAmount !== 0) {
            throw new ConvexError("Amount must be zero for suspension")
        }

        // Validate percentage change isn't too extreme (e.g., more than 50%)
        const percentageChange = Math.abs((newAmount - previousAmount) / previousAmount * 100)
        if (percentageChange > 50) {
            throw new ConvexError("Change exceeds maximum allowed percentage (50%)")
        }

        return true
    },
})