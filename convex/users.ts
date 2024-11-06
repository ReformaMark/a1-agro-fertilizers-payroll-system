import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation, query } from "./_generated/server";
import { ConvexError, v } from "convex/values";
import { Id } from "./_generated/dataModel";

export const get = query({
    args: {},
    handler: async (ctx) => {
        // const userId = await getAuthUserId(ctx)
        // if (!userId) throw new ConvexError("User not found")

        const userId = "kn7ar73k80x8yjq5wgd75s8ht5742943" as Id<"users">

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
            employeeTypeId: user.employeeTypeId,
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


// export const createAdmin = mutation({
//     args: {},
//     handler: async (ctx) => {
//         const userId = await ctx.db.insert("users", {
//             firstName: "Admin",
//             lastName: "Admin",
//             email: "admin@admin.com",
//             role: "admin",
//             department: "Human Resources",
//             position: "HR Administrator",
//             employeeTypeId: "ADMIN-001",
//             dateOfBirth: "1990-01-01",
//             gender: false,
//             hiredDate: "2024-01-01",
//             ratePerDay: 1000,
//             isArchived: false,
//             tokenIdentifier: "admin-user",
//             modifiedAt: new Date().toISOString()
//         })

//         return userId
//     }
// })

export const createEmployee = mutation({
    args: {
        // Auth & Role
        email: v.string(),
        password: v.string(),
        role: v.union(v.literal("admin"), v.literal("employee")),

        // Personal Info
        firstName: v.string(),
        middleName: v.optional(v.string()),
        lastName: v.string(),
        image: v.optional(v.string()),
        dateOfBirth: v.string(),
        gender: v.union(v.literal("male"), v.literal("female")),
        maritalStatus: v.union(
            v.literal("single"),
            v.literal("married"),
            v.literal("widowed"),
            v.literal("divorced"),
            v.literal("separated")
        ),
        contactType: v.union(v.literal("mobile"), v.literal("landline")),
        contactNumber: v.string(),

        // Employment Info
        employeeTypeId: v.string(),
        department: v.string(),
        position: v.string(),
        hiredDate: v.string(),

        // Address Info
        region: v.string(),
        province: v.string(),
        city: v.string(),
        barangay: v.string(),
        postalCode: v.string(),
        street: v.string(),
        houseNumber: v.string(),

        // Payroll Info
        ratePerDay: v.number(),
        philHealthNumber: v.optional(v.string()),
        pagIbigNumber: v.optional(v.string()),
        sssNumber: v.optional(v.string()),
        birTin: v.optional(v.string()),
        philHealthContribution: v.optional(v.number()),
        pagIbigContribution: v.optional(v.number()),
        sssContribution: v.optional(v.number()),
        incomeTax: v.optional(v.number()),

        // Payment Schedules
        philHealthSchedule: v.union(v.literal("1st"), v.literal("2nd")),
        pagIbigSchedule: v.union(v.literal("1st"), v.literal("2nd")),
        sssSchedule: v.union(v.literal("1st"), v.literal("2nd")),
        incomeTaxSchedule: v.union(v.literal("1st"), v.literal("2nd")),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx)
        if (!userId) throw new ConvexError("User not found")

        // Check if email already exists
        const existingUser = await ctx.db
            .query("users")
            .filter(q => q.eq(q.field("email"), args.email))
            .first();

        if (existingUser) throw new Error("Email already exists");

        // Create the employee
        const userCreatedId = await ctx.db.insert("users", {
            ...args,
            tokenIdentifier: `local:${args.email}`,
            isArchived: false,
            modifiedBy: userId,
            modifiedAt: new Date().toISOString(),
        });

        return userCreatedId;
    },
});
