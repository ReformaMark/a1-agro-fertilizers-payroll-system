import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const list = query({
    handler: async (ctx) => {
        return await ctx.db
            .query("contributionTables")
            .order("desc")
            .collect();
    },
});

export const get = query({
    args: { id: v.id("contributionTables") },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.id);
    },
});

export const create = mutation({
    args: {
        type: v.string(),
        effectiveDate: v.string(),
        ranges: v.array(v.object({
            rangeStart: v.number(),
            rangeEnd: v.number(),
            regularSS: v.number(),
            wisp: v.number(),
            totalMonthlySalaryCredit: v.number(),
            regularSSER: v.number(),
            regularSSEE: v.number(),
            regularSSTotal: v.number(),
            ecER: v.number(),
            ecEE: v.number(),
            ecTotal: v.number(),
            wispER: v.number(),
            wispEE: v.number(),
            wispTotal: v.number(),
            totalER: v.number(),
            totalEE: v.number(),
            grandTotal: v.number(),
        })),
        isActive: v.boolean(),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Not authenticated");

        // If this is marked as active, deactivate other tables of the same type
        if (args.isActive) {
            const activeTables = await ctx.db
                .query("contributionTables")
                .withIndex("by_type", q => q.eq("type", args.type))
                .filter(q => q.eq(q.field("isActive"), true))
                .collect();

            for (const table of activeTables) {
                await ctx.db.patch(table._id, { isActive: false });
            }
        }

        return await ctx.db.insert("contributionTables", {
            ...args,
            createdBy: userId,
            modifiedBy: userId,
            modifiedAt: new Date().toISOString(),
        });
    },
});

export const update = mutation({
    args: {
        id: v.id("contributionTables"),
        type: v.string(),
        effectiveDate: v.string(),
        ranges: v.array(v.object({
            rangeStart: v.number(),
            rangeEnd: v.number(),
            regularSS: v.number(),
            wisp: v.number(),
            totalMonthlySalaryCredit: v.number(),
            regularSSER: v.number(),
            regularSSEE: v.number(),
            regularSSTotal: v.number(),
            ecER: v.number(),
            ecEE: v.number(),
            ecTotal: v.number(),
            wispER: v.number(),
            wispEE: v.number(),
            wispTotal: v.number(),
            totalER: v.number(),
            totalEE: v.number(),
            grandTotal: v.number(),
        })),
        isActive: v.boolean(),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Not authenticated");

        const { id, ...updates } = args;

        // If this is marked as active, deactivate other tables of the same type
        if (updates.isActive) {
            const activeTables = await ctx.db
                .query("contributionTables")
                .withIndex("by_type", q => q.eq("type", updates.type))
                .filter(q => q.eq(q.field("isActive"), true))
                .collect();

            for (const table of activeTables) {
                if (table._id !== id) {
                    await ctx.db.patch(table._id, { isActive: false });
                }
            }
        }

        return await ctx.db.patch(id, {
            ...updates,
            modifiedBy: userId,
            modifiedAt: new Date().toISOString(),
        });
    },
});

export const getCurrentSSS = query({
    handler: async (ctx) => {
        const tables = await ctx.db
            .query("contributionTables")
            .withIndex("by_type", q => q.eq("type", "SSS"))
            .filter(q => q.eq(q.field("isActive"), true))
            .order("desc")
            .take(1);

        return tables[0];
    },
});

export const createPagibig = mutation({
    args: {
        effectiveDate: v.string(),
        ranges: v.array(v.object({
            rangeStart: v.number(),
            rangeEnd: v.number(),
            description: v.string(),
            employeeRate: v.number(),
            employerRate: v.number(),
            maxLimit: v.number(),
        })),
        isActive: v.boolean(),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Not authenticated");

        // If this is marked as active, deactivate other tables
        if (args.isActive) {
            const activeTables = await ctx.db
                .query("contributionTables")
                .withIndex("by_type", q => q.eq("type", "PAGIBIG"))
                .filter(q => q.eq(q.field("isActive"), true))
                .collect();

            for (const table of activeTables) {
                await ctx.db.patch(table._id, { isActive: false });
            }
        }

        return await ctx.db.insert("contributionTables", {
            type: "PAGIBIG",
            effectiveDate: args.effectiveDate,
            ranges: args.ranges,
            isActive: args.isActive,
            createdBy: userId,
            modifiedBy: userId,
            modifiedAt: new Date().toISOString(),
        });
    },
});

export const updatePagibig = mutation({
    args: {
        id: v.id("contributionTables"),
        effectiveDate: v.string(),
        ranges: v.array(v.object({
            rangeStart: v.number(),
            rangeEnd: v.number(),
            description: v.string(),
            employeeRate: v.number(),
            employerRate: v.number(),
            maxLimit: v.number(),
        })),
        isActive: v.boolean(),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Not authenticated");

        const { id, ...updates } = args;

        // If this is marked as active, deactivate other tables
        if (updates.isActive) {
            const activeTables = await ctx.db
                .query("contributionTables")
                .withIndex("by_type", q => q.eq("type", "PAGIBIG"))
                .filter(q => q.eq(q.field("isActive"), true))
                .collect();

            for (const table of activeTables) {
                if (table._id !== id) {
                    await ctx.db.patch(table._id, { isActive: false });
                }
            }
        }

        return await ctx.db.patch(id, {
            effectiveDate: updates.effectiveDate,
            ranges: updates.ranges,
            isActive: updates.isActive,
            modifiedBy: userId,
            modifiedAt: new Date().toISOString(),
        });
    },
});

export const getCurrentPagibig = query({
    handler: async (ctx) => {
        const tables = await ctx.db
            .query("contributionTables")
            .withIndex("by_type", q => q.eq("type", "PAGIBIG"))
            .filter(q => q.eq(q.field("isActive"), true))
            .order("desc")
            .take(1);

        return tables[0];
    },
});

export const createPhilHealth = mutation({
    args: {
        effectiveDate: v.string(),
        ranges: v.array(v.object({
            yearStart: v.number(),
            yearEnd: v.number(),
            basicSalary: v.object({
                from: v.number(),
                to: v.union(v.number(), v.null()),
            }),
            premiumRate: v.number(),
            monthlyPremium: v.number(),
            employeeShare: v.number(),
            employerShare: v.number(),
        })),
        isActive: v.boolean(),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Not authenticated");

        // If this is marked as active, deactivate other tables
        if (args.isActive) {
            const activeTables = await ctx.db
                .query("contributionTables")
                .withIndex("by_type", q => q.eq("type", "PHILHEALTH"))
                .filter(q => q.eq(q.field("isActive"), true))
                .collect();

            for (const table of activeTables) {
                await ctx.db.patch(table._id, { isActive: false });
            }
        }

        return await ctx.db.insert("contributionTables", {
            type: "PHILHEALTH",
            effectiveDate: args.effectiveDate,
            ranges: args.ranges,
            isActive: args.isActive,
            createdBy: userId,
            modifiedBy: userId,
            modifiedAt: new Date().toISOString(),
        });
    },
});

export const updatePhilHealth = mutation({
    args: {
        id: v.id("contributionTables"),
        effectiveDate: v.string(),
        ranges: v.array(v.object({
            yearStart: v.number(),
            yearEnd: v.number(),
            basicSalary: v.object({
                from: v.number(),
                to: v.union(v.number(), v.null()),
            }),
            premiumRate: v.number(),
            monthlyPremium: v.number(),
            employeeShare: v.number(),
            employerShare: v.number(),
        })),
        isActive: v.boolean(),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Not authenticated");

        const { id, ...updates } = args;

        // If this is marked as active, deactivate other tables
        if (updates.isActive) {
            const activeTables = await ctx.db
                .query("contributionTables")
                .withIndex("by_type", q => q.eq("type", "PHILHEALTH"))
                .filter(q => q.eq(q.field("isActive"), true))
                .collect();

            for (const table of activeTables) {
                if (table._id !== id) {
                    await ctx.db.patch(table._id, { isActive: false });
                }
            }
        }

        return await ctx.db.patch(id, {
            effectiveDate: updates.effectiveDate,
            ranges: updates.ranges,
            isActive: updates.isActive,
            modifiedBy: userId,
            modifiedAt: new Date().toISOString(),
        });
    },
});

export const getCurrentPhilhealth = query({
    handler: async (ctx) => {
        const tables = await ctx.db
            .query("contributionTables")
            .withIndex("by_type", q => q.eq("type", "PHILHEALTH"))
            .filter(q => q.eq(q.field("isActive"), true))
            .order("desc")
            .take(1);

        return tables[0];
    },
});