import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation, query } from "./_generated/server";
import { ConvexError, v } from "convex/values";
import { Id } from "./_generated/dataModel";

export const get = query({
    args: {},
    handler: async (ctx) => {
        const userId = await getAuthUserId(ctx)
        if (!userId) throw new ConvexError("User not found")

        const user = await ctx.db.get(userId)
        if (!user) throw new ConvexError("User not found")

        return {
            _id: user._id,
            _creationTime: user._creationTime,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role,
            department: user.department,
            // employeeTypeId: user.employeeTypeId,
        }
    }
})

export const getEmployee = query({
    args: {
        userId: v.id("users")
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx)
        if (!userId) throw new ConvexError("User not found")

        // find the employee by role
        const employee = await ctx.db
            .query("users")
            .filter(q => q.eq(q.field("_id"), args.userId) && q.eq(q.field("role"), "employee"))
            .first()

        if (!employee) throw new ConvexError("Employee not found")

        return employee
    }
})

export const checkRole = query({
    args: {},
    handler: async (ctx) => {
        const userId = await getAuthUserId(ctx)
        if (!userId) throw new ConvexError("User not found")

        const user = await ctx.db.get(userId)

        return user?.role
    }
})

export const getEmployees = query({
    args: {
        department: v.optional(v.string()),
        status: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        let query = ctx.db.query("users")
            .filter(q => q.eq(q.field("role"), "employee"))
            .filter(q => q.eq(q.field("isArchived"), false))

        if (args.department) {
            query = query.filter(q => q.eq(q.field("department"), args.department))
        }

        const employees = await query.collect()

        return employees.map((emp) => ({
            ...emp,
            status: getEmployeeStatus(emp),
        }))
    }
})

function getEmployeeStatus(employee: any) {
    if (employee.isArchived) return "inactive"

    return "active"
}


export const makeAdmin = mutation({
    args: { userId: v.id("users") },
    handler: async (ctx, args) => {
        const adminId = await getAuthUserId(ctx)
        if (!adminId) throw new ConvexError("Not authenticated")

        // Check if current user is admin
        const admin = await ctx.db.get(adminId)
        if (admin?.role !== "admin") {
            throw new ConvexError("Not authorized")
        }

        // Update user to admin
        await ctx.db.patch(args.userId, {
            role: "admin"
        })

        return true
    }
})

export const updateEmployee = mutation({
    args: {
        userId: v.id("users"),
        department: v.string(),
        position: v.string(),
        hiredDate: v.string(),
        region: v.string(),
        province: v.string(),
        city: v.string(),
        barangay: v.string(),
        postalCode: v.string(),
        street: v.string(),
        houseNumber: v.string(),
        ratePerDay: v.number(),
        // Government IDs
        philHealthNumber: v.string(),
        pagIbigNumber: v.string(),
        sssNumber: v.string(),
        birTin: v.string(),
        // Contributions
        philHealthContribution: v.number(),
        pagIbigContribution: v.number(),
        sssContribution: v.number(),
        incomeTax: v.number(),
        // Schedules
        philHealthSchedule: v.union(v.literal("1st half"), v.literal("2nd half")),
        pagIbigSchedule: v.union(v.literal("1st half"), v.literal("2nd half")),
        sssSchedule: v.union(v.literal("1st half"), v.literal("2nd half")),
        incomeTaxSchedule: v.union(v.literal("1st half"), v.literal("2nd half")),
    },
    handler: async (ctx, args) => {
        const adminId = await getAuthUserId(ctx)
        if (!adminId) throw new ConvexError("Not authenticated")

        // Check if current user is admin
        const admin = await ctx.db.get(adminId)
        if (admin?.role !== "admin") {
            throw new ConvexError("Not authorized")
        }

        const { userId, ...updateData } = args

        await ctx.db.patch(userId, {
            ...updateData,
            filledUpByAdmin: true,
            modifiedBy: adminId,
            modifiedAt: new Date().toISOString(),
        })

        return true
    }
})