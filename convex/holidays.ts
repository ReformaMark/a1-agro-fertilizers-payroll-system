import { ConvexError, v } from "convex/values"
import { mutation, query } from "./_generated/server"
import { getAuthUserId } from "@convex-dev/auth/server"

// Regular holidays in the Philippines (2024)
const REGULAR_HOLIDAYS_2024 = [
    { name: "New Year's Day", date: "2024-01-01" },
    { name: "Maundy Thursday", date: "2024-03-28" },
    { name: "Good Friday", date: "2024-03-29" },
    { name: "Araw ng Kagitingan", date: "2024-04-09" },
    { name: "Labor Day", date: "2024-05-01" },
    { name: "Independence Day", date: "2024-06-12" },
    { name: "National Heroes Day", date: "2024-08-26" },
    { name: "Bonifacio Day", date: "2024-11-30" },
    { name: "Christmas Day", date: "2024-12-25" },
    { name: "Rizal Day", date: "2024-12-30" },
]

// Special Non-Working holidays (2024)
const SPECIAL_HOLIDAYS_2024 = [
    { name: "Chinese New Year", date: "2024-02-10" },
    { name: "EDSA People Power Revolution Anniversary", date: "2024-02-25" },
    { name: "Black Saturday", date: "2024-03-30" },
    { name: "Eid al-Fitr", date: "2024-04-10" }, // Approximate
    { name: "Eid al-Adha", date: "2024-06-17" }, // Approximate
    { name: "All Saints' Day", date: "2024-11-01" },
    { name: "All Souls' Day", date: "2024-11-02" },
    { name: "Christmas Eve", date: "2024-12-24" },
    { name: "Last Day of the Year", date: "2024-12-31" },
]

export const getHolidays = query({
    args: {
        year: v.optional(v.string()),
        type: v.optional(v.string()),
        location: v.optional(v.string()),
        isArchived: v.optional(v.boolean()),
    },
    handler: async (ctx, args) => {
        let query = ctx.db.query("holidays")
            .withIndex("by_date")

        if (args.isArchived !== undefined) {
            query = query.filter(q => q.eq(q.field("isArchived"), args.isArchived))
        }

        if (args.type) {
            query = query.withIndex("by_type").filter(q => q.eq(q.field("type"), args.type))
        }

        if (args.location) {
            query = query.withIndex("by_location").filter(q => q.eq(q.field("location"), args.location))
        }

        if (args.year) {
            query = query.filter(q => q.gte(q.field("date"), `${args.year}-01-01`))
                .filter(q => q.lt(q.field("date"), `${parseInt(args.year) + 1}-01-01`))
        }

        return await query.collect()
    },
})

export const createHoliday = mutation({
    args: {
        name: v.string(),
        date: v.string(),
        type: v.string(),
        description: v.optional(v.string()),
        isRecurring: v.boolean(),
        location: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx)
        if (!userId) throw new ConvexError("Unauthorized")

        return await ctx.db.insert("holidays", {
            ...args,
            createdBy: userId,
            modifiedAt: new Date().toISOString(),
            isArchived: false,
        })
    },
})

export const initializeHolidays = mutation({
    args: {
        year: v.string(),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx)
        if (!userId) throw new ConvexError("Unauthorized")

        // Initialize regular holidays
        for (const holiday of REGULAR_HOLIDAYS_2024) {
            await ctx.db.insert("holidays", {
                name: holiday.name,
                date: holiday.date,
                type: "Regular",
                isRecurring: true,
                createdBy: userId,
                modifiedAt: new Date().toISOString(),
                isArchived: false,
            })
        }

        // Initialize special holidays
        for (const holiday of SPECIAL_HOLIDAYS_2024) {
            await ctx.db.insert("holidays", {
                name: holiday.name,
                date: holiday.date,
                type: "Special",
                isRecurring: true,
                createdBy: userId,
                modifiedAt: new Date().toISOString(),
                isArchived: false,
            })
        }

        return true
    },
})

export const archiveHoliday = mutation({
    args: {
        holidayId: v.id("holidays"),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx)
        if (!userId) throw new ConvexError("Unauthorized")

        const holiday = await ctx.db.get(args.holidayId)
        if (!holiday) throw new ConvexError("Holiday not found")

        return await ctx.db.patch(args.holidayId, {
            isArchived: true,
            modifiedAt: new Date().toISOString(),
        })
    },
})

export const updateHoliday = mutation({
    args: {
        id: v.id("holidays"),
        name: v.string(),
        date: v.string(),
        type: v.string(),
        description: v.optional(v.string()),
        isRecurring: v.boolean(),
        location: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx)
        if (!userId) throw new ConvexError("Unauthorized")

        const { id, ...updates } = args
        const holiday = await ctx.db.get(id)
        if (!holiday) throw new ConvexError("Holiday not found")

        return await ctx.db.patch(id, {
            ...updates,
            modifiedAt: new Date().toISOString(),
        })
    },
})

export const restoreHoliday = mutation({
    args: {
        holidayId: v.id("holidays"),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx)
        if (!userId) throw new ConvexError("Unauthorized")

        const holiday = await ctx.db.get(args.holidayId)
        if (!holiday) throw new ConvexError("Holiday not found")

        return await ctx.db.patch(args.holidayId, {
            isArchived: false,
            modifiedAt: new Date().toISOString(),
        })
    },
}) 