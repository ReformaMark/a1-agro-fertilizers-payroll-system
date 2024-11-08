import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { createAccount } from "@convex-dev/auth/server";

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
            filledUpByAdmin: user.filledUpByAdmin,
            isDeclinedByAdmin: user.isDeclinedByAdmin,
            declinedReason: user.declinedReason,
            declinedAt: user.declinedAt,
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

        return await Promise.all(employees.map(async (emp) => ({
            ...emp,
            imageUrl: emp.image ? await ctx.storage.getUrl(emp.image) : null,
            status: getEmployeeStatus(emp),
        })))
    }
})

export const getAllEmployees = query({
    handler: async (ctx) => {
        const query = ctx.db.query("users")
            .filter(q => q.eq(q.field("role"), "employee"))
            .filter(q => q.eq(q.field("isArchived"), false))

        const employees = await query.collect()

        return await Promise.all(
            employees.map(async (employee) => ({
                ...employee,
                imageUrl: employee.image ? await ctx.storage.getUrl(employee.image) : null
            }))
        )
    }
})

// eslint-disable-next-line @typescript-eslint/no-explicit-any
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

export const listEmployeesWithContributions = query({
    args: {
        schedule: v.union(v.literal("1st half"), v.literal("2nd half"))
    },
    handler: async (ctx, args) => {
        const employees = await ctx.db
            .query("users")
            .filter(q =>
                q.and(
                    q.eq(q.field("role"), "employee"),
                    q.eq(q.field("filledUpByAdmin"), true),
                    q.eq(q.field("philHealthSchedule"), args.schedule)
                )
            )
            .collect();

        // Debug log to check the data
        console.log('Employees found:', employees.length);
        console.log('Sample employee:', employees[0]);

        return employees;
    }
});

export const declineRegistration = mutation({
    args: {
        userId: v.id("users"),
        reason: v.string(),
    },
    handler: async (ctx, args) => {
        const adminId = await getAuthUserId(ctx)
        if (!adminId) throw new ConvexError("Unauthorized")

        const admin = await ctx.db.get(adminId)
        if (!admin || admin.role !== "admin") {
            throw new ConvexError("Unauthorized: Only admins can decline registrations")
        }

        return await ctx.db.patch(args.userId, {
            isDeclinedByAdmin: true,
            declinedReason: args.reason,
            declinedAt: new Date().toISOString(),
            modifiedBy: adminId,
            modifiedAt: new Date().toISOString(),
        })
    },
})

// export const reverseDeclineRegistration = mutation({
//     args: {
//         userId: v.id("users"),
//     },
//     handler: async (ctx, args) => {
//         const adminId = await getAuthUserId(ctx)
//         if (!adminId) throw new ConvexError("Unauthorized")

//         const admin = await ctx.db.get(adminId)
//         if (!admin || admin.role !== "admin") {
//             throw new ConvexError("Unauthorized: Only admins can reverse declined registrations")
//         }

//         const user = await ctx.db.get(args.userId)
//         if (!user) throw new ConvexError("User not found")

//         return await ctx.db.patch(args.userId, {
//             isDeclinedByAdmin: false,
//             declinedReason: undefined,
//             declinedAt: undefined,
//             modifiedBy: adminId,
//             modifiedAt: new Date().toISOString(),
//         })
//     },
// })

export const createEmployee = mutation({
    args: {
        email: v.string(),
        password: v.string(),
        firstName: v.string(),
        middleName: v.optional(v.string()),
        lastName: v.string(),
        dateOfBirth: v.string(),
        gender: v.union(v.literal("male"), v.literal("female")),
        maritalStatus: v.union(v.literal("single"), v.literal("married"), v.literal("widowed"), v.literal("divorced"), v.literal("separated")),
        contactType: v.union(v.literal("mobile"), v.literal("landline")),
        contactNumber: v.string(),
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
        philHealthNumber: v.string(),
        pagIbigNumber: v.string(),
        sssNumber: v.string(),
        birTin: v.string(),
        philHealthContribution: v.number(),
        pagIbigContribution: v.number(),
        sssContribution: v.number(),
        incomeTax: v.number(),
        philHealthSchedule: v.union(v.literal("1st half"), v.literal("2nd half")),
        pagIbigSchedule: v.union(v.literal("1st half"), v.literal("2nd half")),
        sssSchedule: v.union(v.literal("1st half"), v.literal("2nd half")),
        incomeTaxSchedule: v.union(v.literal("1st half"), v.literal("2nd half")),
    },
    handler: async (ctx, args) => {
        try {
            console.log("Starting employee creation with args:", args)
            const adminId = await getAuthUserId(ctx)
            if (!adminId) throw new ConvexError("Not authenticated")

            console.log("Admin ID:", adminId)

            // Check if current user is admin
            const admin = await ctx.db.get(adminId)
            console.log("Admin user:", admin)

            if (admin?.role !== "admin") {
                throw new ConvexError("Not authorized")
            }

            // Check if email already exists
            const existingUser = await ctx.db
                .query("users")
                .filter(q => q.eq(q.field("email"), args.email))
                .first()

            if (existingUser) {
                throw new ConvexError("Email already exists")
            }

            const { email, password, ...userData } = args

            // Create the account using createAccount
            // @ts-expect-error convex does not support password provider types yet
            const { user } = await createAccount(ctx, {
                provider: "password",
                account: {
                    id: email,
                    secret: password,
                },
                profile: {
                    email,
                    firstName: userData.firstName,
                    middleName: userData.middleName,
                    lastName: userData.lastName,
                    dateOfBirth: userData.dateOfBirth,
                    gender: userData.gender,
                    maritalStatus: userData.maritalStatus,
                    contactType: userData.contactType,
                    contactNumber: userData.contactNumber,
                    role: "employee",
                },
            });

            // Create the user record with all fields
            const newUser = await ctx.db.patch(user._id, {
                ...userData,
                email,
                role: "employee",
                isArchived: false,
                filledUpByAdmin: true,
                modifiedBy: adminId,
                modifiedAt: new Date().toISOString(),
            })

            console.log("Successfully created employee")
            return newUser
        } catch (error) {
            console.error("Error in createEmployee:", error)
            throw error
        }
    }
})
