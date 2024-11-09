import { ConvexError, v } from "convex/values"
import { mutation, query } from "./_generated/server"
import { getAuthUserId } from "@convex-dev/auth/server"
import { Id } from "./_generated/dataModel"

export const getCompanyLoans = query({
    args: {
        userId: v.optional(v.id("users")),
        status: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        let query = ctx.db.query("companyLoans")
            .withIndex("by_user")

        if (args.userId) {
            query = query.filter(q => q.eq(q.field("userId"), args.userId))
        }

        if (args.status) {
            query = query.filter(q => q.eq(q.field("status"), args.status))
        }

        const loans = await query.collect()

        // Fetch user details for each loan
        const users = await Promise.all(
            loans.map(loan => ctx.db.get(loan.userId))
        )

        return loans.map((loan, index) => ({
            ...loan,
            user: users[index]
        }))
    },
})

export const getGovernmentLoans = query({
    args: {
        userId: v.optional(v.id("users")),
        status: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        let query = ctx.db.query("governmentLoans")
            .withIndex("by_user")

        if (args.userId) {
            query = query.filter(q => q.eq(q.field("userId"), args.userId))
        }

        if (args.status) {
            query = query.filter(q => q.eq(q.field("status"), args.status))
        }

        const loans = await query.collect()

        // Fetch user details for each loan
        const users = await Promise.all(
            loans.map(loan => ctx.db.get(loan.userId))
        )

        return loans.map((loan, index) => ({
            ...loan,
            user: users[index]
        }))
    },
})

export const createCompanyLoan = mutation({
    args: {
        type: v.string(),
        amount: v.number(),
        amortization: v.number(),
        totalAmount: v.number(),
        remarks: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx)
        if (!userId) throw new ConvexError("Unauthorized")

        // Verify user has completed profile
        const user = await ctx.db.get(userId)
        if (!user?.filledUpByAdmin) {
            throw new ConvexError("Profile must be completed by admin before requesting loans")
        }

        return await ctx.db.insert("companyLoans", {
            ...args,
            userId,
            status: "Pending",
            createdAt: new Date().toISOString(),
            modifiedAt: new Date().toISOString(),
        })
    },
})

export const createGovernmentLoan = mutation({
    args: {
        applicationType: v.string(),
        applicationNo: v.string(),
        amount: v.number(),
        startDate: v.string(),
        endDate: v.string(),
        monthlySchedule: v.string(),
        amortization: v.number(),
        totalAmount: v.number(),
        additionalInfo: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx)
        if (!userId) throw new ConvexError("Unauthorized")

        // Verify user has completed profile
        const user = await ctx.db.get(userId)
        if (!user?.filledUpByAdmin) {
            throw new ConvexError("Profile must be completed by admin before requesting loans")
        }

        return await ctx.db.insert("governmentLoans", {
            ...args,
            userId,
            status: "Pending",
            createdAt: new Date().toISOString(),
            modifiedAt: new Date().toISOString(),
        })
    },
})

export const updateLoanStatus = mutation({
    args: {
        loanId: v.union(v.id("companyLoans"), v.id("governmentLoans")),
        loanType: v.union(v.literal("company"), v.literal("government")),
        status: v.union(v.literal("Approved"), v.literal("Rejected")),
        rejectionReason: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx)
        if (!userId) throw new ConvexError("Unauthorized")

        // Verify admin role
        const user = await ctx.db.get(userId)
        if (!user || user.role !== "admin") {
            throw new ConvexError("Unauthorized: Only admins can approve/reject loans")
        }

        // Determine which table to use based on loan type
        const tableName = args.loanType === "company" ? "companyLoans" : "governmentLoans"

        // Get the loan from the correct table
        const loan = await ctx.db.get(args.loanId)
        if (!loan) throw new ConvexError("Loan not found")

        // Update the loan in the correct table
        return await ctx.db.patch(args.loanId, {
            status: args.status,
            approvedBy: userId,
            approvedAt: new Date().toISOString(),
            rejectionReason: args.rejectionReason,
            modifiedAt: new Date().toISOString(),
        })
    },
})

export const addCompanyLoanPayment = mutation({
    args: {
        loanId: v.id("companyLoans"),
        amount: v.number(),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new ConvexError("Unauthorized");

        // Verify admin role
        const user = await ctx.db.get(userId);
        if (!user || user.role !== "admin") {
            throw new ConvexError("Unauthorized: Only admins can add payments");
        }

        // Get the company loan
        const loan = await ctx.db.get(args.loanId);
        if (!loan) throw new ConvexError("Loan not found");
        if (loan.status !== "Approved") {
            throw new ConvexError("Can only add payments to approved loans");
        }

        // Calculate new total paid
        const currentTotalPaid = loan.totalPaid || 0;
        const newTotalPaid = currentTotalPaid + args.amount;

        if (newTotalPaid > loan.totalAmount) {
            throw new ConvexError("Payment amount exceeds remaining balance");
        }

        // Update the loan with new payment
        return await ctx.db.patch(args.loanId, {
            totalPaid: newTotalPaid,
            remainingBalance: loan.totalAmount - newTotalPaid,
            modifiedAt: new Date().toISOString(),
        });
    },
});

export const issueGovernmentLoan = mutation({
    args: {
        userId: v.id("users"),
        applicationType: v.union(
            v.literal("SSS Salary Loan"),
            v.literal("SSS Calamity Loan"),
            v.literal("Pagibig Multi-purpose Loan"),
            v.literal("Pagibig Calamity Loan"),
            v.literal("GSIS Salary Loan"),
            v.literal("GSIS Emergency Loan")
        ),
        applicationNo: v.string(),
        amount: v.number(),
        amortization: v.number(),
        totalAmount: v.number(),
        startDate: v.string(),
        endDate: v.string(),
        monthlySchedule: v.union(
            v.literal("1st Half"),
            v.literal("2nd Half")
        ),
        additionalInfo: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const adminId = await getAuthUserId(ctx)
        if (!adminId) throw new ConvexError("Unauthorized")

        // Verify admin role
        const admin = await ctx.db.get(adminId)
        if (!admin || admin.role !== "admin") {
            throw new ConvexError("Only admins can issue government loans")
        }

        // Verify target user exists and has completed profile
        const user = await ctx.db.get(args.userId)
        if (!user?.filledUpByAdmin) {
            throw new ConvexError("Employee profile must be completed before issuing loans")
        }

        return await ctx.db.insert("governmentLoans", {
            ...args,
            userId: args.userId,
            status: "Approved",
            approvedBy: adminId,
            approvedAt: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            modifiedAt: new Date().toISOString(),
        })
    },
})