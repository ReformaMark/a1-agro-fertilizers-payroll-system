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
            .order("desc")

        if (args.userId) {
            query = query.filter(q => q.eq(q.field("userId"), args.userId))
        }

        if (args.status) {
            query = query.filter(q => q.eq(q.field("status"), args.status))
        }

        const requests = await query.collect()

        // Fetch user details for each request
        const requestsWithUsers = await Promise.all(
            requests.map(async (request) => {
                const user = await ctx.db.get(request.userId)
                return {
                    ...request,
                    user
                }
            })
        )

        return requestsWithUsers
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

        // Check leave balance for Annual Leave type
        if (args.type === "Annual Leave") {
            const user = await ctx.db.get(userId)
            if (!user) throw new ConvexError("User not found")

            const balance = user.annualLeaveBalance ?? 15
            if (balance <= 0) {
                throw new ConvexError("Insufficient leave balance")
            }
        }

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

        // If approving an annual leave request, deduct from balance
        if (args.status === "Approved" && request.type === "Annual Leave") {
            const employee = await ctx.db.get(request.userId)
            if (!employee) throw new ConvexError("Employee not found")

            const balance = employee.annualLeaveBalance ?? 15
            if (balance <= 0) {
                throw new ConvexError("Employee has insufficient leave balance")
            }

            // Calculate days
            const start = new Date(request.startDate)
            const end = new Date(request.endDate)
            const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1

            // Update employee's leave balance
            await ctx.db.patch(request.userId, {
                annualLeaveBalance: Math.max(0, balance - days)
            })
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

// Add new query for leave request statistics
export const getLeaveRequestStats = query({
    args: {
        userId: v.optional(v.id("users")),
    },
    handler: async (ctx, args) => {
        let query = ctx.db.query("leaveRequests")
            .withIndex("by_user")

        if (args.userId) {
            query = query.filter(q => q.eq(q.field("userId"), args.userId))
        }

        const requests = await query.collect()

        // Fetch user details for each request
        const users = await Promise.all(
            requests.map(request => ctx.db.get(request.userId))
        )

        const requestsWithUsers = requests.map((request, index) => ({
            ...request,
            user: users[index]
        }))

        return {
            total: requests.length,
            pending: requests.filter(r => r.status === "Pending").length,
            approved: requests.filter(r => r.status === "Approved").length,
            rejected: requests.filter(r => r.status === "Rejected").length,
            byType: requests.reduce((acc, req) => {
                acc[req.type] = (acc[req.type] || 0) + 1
                return acc
            }, {} as Record<string, number>),
            requests: requestsWithUsers
        }
    },
})

// Add new query to get leave balance
export const getLeaveBalance = query({
    args: {
        userId: v.optional(v.id("users")),
    },
    handler: async (ctx, args) => {
        const userId = args.userId ?? (await getAuthUserId(ctx))
        if (!userId) throw new ConvexError("Unauthorized")

        const user = await ctx.db.get(userId)
        if (!user) throw new ConvexError("User not found")

        return user.annualLeaveBalance ?? 15 // Default to 15 if not set
    },
}) 