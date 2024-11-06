import { ConvexError, v } from "convex/values"
import { mutation, query } from "./_generated/server"
import { getAuthUserId } from "@convex-dev/auth/server"

export const getLeaveRequests = query({
    args: {
        userId: v.optional(v.id("users")),
        status: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        let query = ctx.db.query("leaveRequests")
            .withIndex("by_user")

        if (args.userId) {
            query = query.filter(q => q.eq(q.field("userId"), args.userId))
        }

        if (args.status) {
            query = query.filter(q => q.eq(q.field("status"), args.status))
        }

        return await query.collect()
    },
})

export const createLeaveRequest = mutation({
    args: {
        type: v.string(),
        startDate: v.string(),
        endDate: v.string(),
        reason: v.string(),
        attachments: v.optional(v.array(v.string())),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx)
        if (!userId) throw new ConvexError("Unauthorized")

        // Validate dates
        const start = new Date(args.startDate)
        const end = new Date(args.endDate)
        if (end < start) {
            throw new ConvexError("End date must be after start date")
        }

        return await ctx.db.insert("leaveRequests", {
            ...args,
            userId,
            status: "Pending",
            createdAt: new Date().toISOString(),
            modifiedAt: new Date().toISOString(),
        })
    },
})

export const updateLeaveRequestStatus = mutation({
    args: {
        requestId: v.id("leaveRequests"),
        status: v.string(),
        rejectionReason: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx)
        if (!userId) throw new ConvexError("Unauthorized")

        const user = await ctx.db.get(userId)
        if (!user || user.role !== "admin") {
            throw new ConvexError("Unauthorized: Only admins can approve/reject requests")
        }

        const request = await ctx.db.get(args.requestId)
        if (!request) throw new ConvexError("Request not found")

        return await ctx.db.patch(args.requestId, {
            status: args.status,
            approvedBy: userId,
            approvedAt: new Date().toISOString(),
            rejectionReason: args.rejectionReason,
            modifiedAt: new Date().toISOString(),
        })
    },
}) 