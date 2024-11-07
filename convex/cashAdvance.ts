import { mutation, query } from "./_generated/server"
import { v } from "convex/values"
import { getAuthUserId } from "@convex-dev/auth/server"

export const list = query({
    args: {
        userId: v.optional(v.id("users")),
        status: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        let query = ctx.db.query("cashAdvanceRequests")

        if (args.userId) {
            query = query.filter(q => q.eq(q.field("userId"), args.userId))
        }

        if (args.status) {
            query = query.filter(q => q.eq(q.field("status"), args.status))
        }

        const requests = await query
            .order("desc")
            .collect()

        // Fetch user details for each request
        const requestsWithUsers = await Promise.all(
            requests.map(async (request) => {
                const user = await ctx.db.get(request.userId)
                return { ...request, user }
            })
        )

        return requestsWithUsers
    },
})

export const create = mutation({
    args: {
        type: v.string(),
        amount: v.number(),
        paymentTerm: v.string(),
        reason: v.string(),
    },
    handler: async (ctx, args) => {
        const identity = await getAuthUserId(ctx)
        if (!identity) {
            throw new Error("Unauthorized")
        }

        const user = await ctx.db
            .query("users")
            .filter(q => q.eq(q.field("_id"), identity))
            .first()

        if (!user) {
            throw new Error("User not found")
        }

        const request = await ctx.db.insert("cashAdvanceRequests", {
            userId: user._id,
            type: args.type,
            amount: args.amount,
            paymentTerm: args.paymentTerm,
            reason: args.reason,
            status: "Pending",
            createdAt: new Date().toISOString(),
            modifiedAt: new Date().toISOString(),
        })

        return request
    },
})

export const updateStatus = mutation({
    args: {
        requestId: v.id("cashAdvanceRequests"),
        status: v.string(),
        rejectionReason: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const identity = await getAuthUserId(ctx)
        if (!identity) {
            throw new Error("Unauthorized")
        }

        const user = await ctx.db
            .query("users")
            .filter(q => q.eq(q.field("_id"), identity))
            .first()

        if (!user || user.role !== "admin") {
            throw new Error("Unauthorized")
        }

        const update: any = {
            status: args.status,
            modifiedAt: new Date().toISOString(),
        }

        if (args.rejectionReason) {
            update.rejectionReason = args.rejectionReason
        }

        const request = await ctx.db.patch(args.requestId, update)

        return request
    },
})

export const getStats = query({
    args: {
        userId: v.optional(v.id("users")),
    },
    handler: async (ctx, args) => {
        let query = ctx.db.query("cashAdvanceRequests")

        if (args.userId) {
            query = query.filter(q => q.eq(q.field("userId"), args.userId))
        }

        const requests = await query.collect()

        return {
            total: requests.length,
            pending: requests.filter(request => request.status === "Pending").length,
            approved: requests.filter(request => request.status === "Approved").length,
            rejected: requests.filter(request => request.status === "Rejected").length,
        }
    },
})
