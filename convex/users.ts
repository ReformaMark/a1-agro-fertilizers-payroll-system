import { getAuthUserId } from "@convex-dev/auth/server";
import { query } from "./_generated/server";
import { ConvexError, v } from "convex/values";
import { Id } from "./_generated/dataModel";

export const get = query({
    args: {},
    handler: async (ctx) => {
        // const userId = await getAuthUserId(ctx)
        // if (!userId) throw new ConvexError("User not found")

        const userId = "k172z81bm5tsg5d58ar0sd0f3n743dbm" as Id<"users">

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
