import { ConvexError, v } from "convex/values"
import { mutation, query } from "./_generated/server"
import { getAuthUserId } from "@convex-dev/auth/server"

export const getBenefitRequests = query({
    args: {
        userId: v.optional(v.id("users")),
        status: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        let query = ctx.db.query("benefitRequests")
            .withIndex("by_user")

        if (args.userId) {
            query = query.filter(q => q.eq(q.field("userId"), args.userId))
        }

        if (args.status) {
            query = query.filter(q => q.eq(q.field("status"), args.status))
        }

        const requests = await query.collect()

        // Fetch user details for each request
        const users = await Promise.all(
            requests.map(request => ctx.db.get(request.userId))
        )

        return requests.map((request, index) => ({
            ...request,
            user: users[index]
        }))
    },
})

export const createBenefitRequest = mutation({
    args: {
        type: v.string(),
        description: v.string(),
        amount: v.optional(v.number()),
        attachments: v.optional(v.array(v.string())),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx)
        if (!userId) throw new ConvexError("Unauthorized")

        // Validate amount if provided
        if (args.amount !== undefined && args.amount <= 0) {
            throw new ConvexError("Amount must be greater than 0")
        }

        return await ctx.db.insert("benefitRequests", {
            ...args,
            userId,
            status: "Pending",
            createdAt: new Date().toISOString(),
            modifiedAt: new Date().toISOString(),
        })
    },
})

export const updateBenefitRequestStatus = mutation({
    args: {
        requestId: v.id("benefitRequests"),
        status: v.string(),
        rejectionReason: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx)
        if (!userId) throw new ConvexError("Unauthorized")

        // Verify admin role
        const user = await ctx.db.get(userId)
        if (!user || user.role !== "admin") {
            throw new ConvexError("Unauthorized: Only admins can approve/reject requests")
        }

        const request = await ctx.db.get(args.requestId)
        if (!request) throw new ConvexError("Request not found")

        // Validate status
        if (!["Approved", "Rejected"].includes(args.status)) {
            throw new ConvexError("Invalid status")
        }

        // Require rejection reason if status is Rejected
        if (args.status === "Rejected" && !args.rejectionReason) {
            throw new ConvexError("Rejection reason is required")
        }

        return await ctx.db.patch(args.requestId, {
            status: args.status,
            approvedBy: userId,
            approvedAt: new Date().toISOString(),
            rejectionReason: args.rejectionReason,
            modifiedAt: new Date().toISOString(),
        })
    },
})

// Optional: Add a query to get benefit request statistics
export const getBenefitRequestStats = query({
    args: {
        userId: v.optional(v.id("users")),
    },
    handler: async (ctx, args) => {
        let query = ctx.db.query("benefitRequests")
            .withIndex("by_user")

        if (args.userId) {
            query = query.filter(q => q.eq(q.field("userId"), args.userId))
        }

        const requests = await query.collect()

        return {
            total: requests.length,
            pending: requests.filter(r => r.status === "Pending").length,
            approved: requests.filter(r => r.status === "Approved").length,
            rejected: requests.filter(r => r.status === "Rejected").length,
            byType: requests.reduce((acc, req) => {
                acc[req.type] = (acc[req.type] || 0) + 1
                return acc
            }, {} as Record<string, number>),
        }
    },
})

// Optional: Add a query to get active benefits for a user
export const getActiveBenefits = query({
    args: {
        userId: v.optional(v.id("users")),
    },
    handler: async (ctx, args) => {
        const userId = args.userId || await getAuthUserId(ctx)
        if (!userId) throw new ConvexError("Unauthorized")

        const requests = await ctx.db
            .query("benefitRequests")
            .withIndex("by_user")
            .filter(q => q.eq(q.field("userId"), userId))
            .filter(q => q.eq(q.field("status"), "Approved"))
            .collect()

        return requests.reduce((acc, req) => {
            if (!acc[req.type]) {
                acc[req.type] = []
            }
            acc[req.type].push(req)
            return acc
        }, {} as Record<string, typeof requests>)
    },
}) 