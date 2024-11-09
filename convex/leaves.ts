import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getLeaveRequests = query({
    args: {
        userId: v.optional(v.id("users")),
        status: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        let query = ctx.db
            .query("leaveRequests")

            .withIndex("by_user")

            .order("desc");

        if (args.userId) {
            query = query.filter((q) => q.eq(q.field("userId"), args.userId));
        }

        if (args.status) {
            query = query.filter((q) => q.eq(q.field("status"), args.status));
        }

        const requests = await query.collect();

        // Fetch user details for each request

        const requestsWithUsers = await Promise.all(
            requests.map(async (request) => {
                const user = await ctx.db.get(request.userId);

                return {
                    ...request,

                    user,
                };
            })
        );

        return requestsWithUsers;
    },
});

export const createLeaveRequest = mutation({
    args: {
        type: v.string(),
        startDate: v.string(),
        endDate: v.string(),
        reason: v.string(),
        targetUserId: v.optional(v.id("users")),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new ConvexError("Unauthorized");

        const currentUser = await ctx.db.get(userId);
        if (!currentUser) throw new ConvexError("User not found");

        // Calculate leave duration
        const startDate = new Date(args.startDate);
        const endDate = new Date(args.endDate);
        const leaveDuration = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

        // Determine target user
        const targetUserId = args.targetUserId || userId;
        const targetUser = await ctx.db.get(targetUserId);
        if (!targetUser) throw new ConvexError("Target user not found");

        // Check for overlapping leaves
        const existingLeaves = await ctx.db
            .query("leaveRequests")
            .withIndex("by_user", (q) => q.eq("userId", targetUserId))
            .filter((q) =>
                q.or(
                    q.eq(q.field("status"), "Approved"),
                    q.eq(q.field("status"), "Pending")
                )
            )
            .collect();

        const hasOverlap = existingLeaves.some(leave => {
            const leaveStart = new Date(leave.startDate);
            const leaveEnd = new Date(leave.endDate);
            return (
                (startDate >= leaveStart && startDate <= leaveEnd) ||
                (endDate >= leaveStart && endDate <= leaveEnd) ||
                (startDate <= leaveStart && endDate >= leaveEnd)
            );
        });

        if (hasOverlap) {
            throw new ConvexError("You already have a leave request for this time period. Please choose different dates.");
        }

        // Check annual leave balance if applicable
        if (args.type === "Annual Leave") {
            const balance = targetUser.annualLeaveBalance ?? 15;
            if (leaveDuration > balance) {
                throw new ConvexError(`Insufficient annual leave balance. Available: ${balance} days, Requested: ${leaveDuration} days`);
            }
        }

        // Create leave request
        const leaveRequest = {
            userId: targetUserId,
            type: args.type,
            startDate: args.startDate,
            endDate: args.endDate,
            reason: args.reason,
            createdAt: new Date().toISOString(),
            modifiedAt: new Date().toISOString(),
        };

        // If admin is creating, auto-approve
        if (currentUser.role === "admin" && args.targetUserId) {
            return await ctx.db.insert("leaveRequests", {
                ...leaveRequest,
                status: "Approved",
                approvedBy: userId,
                approvedAt: new Date().toISOString(),
            });
        }

        // Regular employee request
        return await ctx.db.insert("leaveRequests", {
            ...leaveRequest,
            status: "Pending",
        });
    },
});


export const updateLeaveRequestStatus = mutation({
    args: {
        requestId: v.id("leaveRequests"),
        status: v.string(),
        rejectionReason: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new ConvexError("Unauthorized");

        const admin = await ctx.db.get(userId);
        if (!admin || admin.role !== "admin") {
            throw new ConvexError("Unauthorized: Only admins can update request status");
        }

        const request = await ctx.db.get(args.requestId);
        if (!request) throw new ConvexError("Request not found");

        const employee = await ctx.db.get(request.userId);
        if (!employee) throw new ConvexError("Employee not found");

        // If approving annual leave, check and update balance
        if (args.status === "Approved" && request.type === "Annual Leave") {
            const balance = employee.annualLeaveBalance ?? 15;
            const startDate = new Date(request.startDate);
            const endDate = new Date(request.endDate);
            const leaveDuration = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

            if (leaveDuration > balance) {
                throw new ConvexError(`Insufficient annual leave balance. Available: ${balance} days, Requested: ${leaveDuration} days`);
            }

            // Update employee's leave balance
            await ctx.db.patch(request.userId, {
                annualLeaveBalance: Math.max(0, balance - leaveDuration),
            });
        }

        // Update request status
        return await ctx.db.patch(args.requestId, {
            status: args.status,
            approvedBy: userId,
            approvedAt: new Date().toISOString(),
            rejectionReason: args.rejectionReason,
            modifiedAt: new Date().toISOString(),
        });
    },
});

// Add new query for leave request statistics

export const getLeaveRequestStats = query({
    args: {
        userId: v.optional(v.id("users")),
    },

    handler: async (ctx, args) => {
        let query = ctx.db
            .query("leaveRequests")

            .withIndex("by_user");

        if (args.userId) {
            query = query.filter((q) => q.eq(q.field("userId"), args.userId));
        }

        const requests = await query.collect();

        // Fetch user details for each request

        const users = await Promise.all(
            requests.map((request) => ctx.db.get(request.userId))
        );

        const requestsWithUsers = requests.map((request, index) => ({
            ...request,

            user: users[index],
        }));

        return {
            total: requests.length,

            pending: requests.filter((r) => r.status === "Pending").length,

            approved: requests.filter((r) => r.status === "Approved").length,

            rejected: requests.filter((r) => r.status === "Rejected").length,

            byType: requests.reduce(
                (acc, req) => {
                    acc[req.type] = (acc[req.type] || 0) + 1;

                    return acc;
                },
                {} as Record<string, number>
            ),

            requests: requestsWithUsers,
        };
    },
});

// Add new query to get leave balance

export const getLeaveBalance = query({
    args: {
        userId: v.optional(v.id("users")),
    },

    handler: async (ctx, args) => {
        const userId = args.userId ?? (await getAuthUserId(ctx));

        if (!userId) throw new ConvexError("Unauthorized");

        const user = await ctx.db.get(userId);

        if (!user) throw new ConvexError("User not found");

        return user.annualLeaveBalance ?? 15; // Default to 15 if not set
    },
});
