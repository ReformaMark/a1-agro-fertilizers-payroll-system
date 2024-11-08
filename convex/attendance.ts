import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server"

export const list = query({
  args: {},
  handler: async (ctx) => {
    const attendanceRecords = await ctx.db
      .query("attendance")
      .order("desc")
      .collect();

    // Join with user data
    const attendanceWithUsers = await Promise.all(
      attendanceRecords.map(async (record) => {
        const user = await ctx.db
          .query("users")
          .filter((q) => q.eq(q.field("_id"), record.userId))
          .unique();

        return {
          ...record,
            employee: {...user}
        };
      })
    );

    return attendanceWithUsers;
  },
});

export const listByUserAndDateRange = query({
    args: {
      userId: v.string(),
      startDate: v.string(),
      endDate: v.string(),
    },
    handler: async (ctx, args) => {
      return await ctx.db
        .query("attendance")
        .filter((q) => 
          q.and(
            q.eq(q.field("userId"), args.userId),
            q.gte(q.field("date"), args.startDate),
            q.lte(q.field("date"), args.endDate)
          )
        )
        .collect();
    },
  });

export const timeIn = mutation({
    args: {
      timeIn: v.number(),
      userId: v.id("users"),
      date: v.string(),
      type: v.string(),
    },
    handler: async (ctx, args) => {
      // Check for existing time-in record for the user on the same date
      const existingRecord = await ctx.db
        .query("attendance")
        .filter((q) => 
          q.and(
            q.eq(q.field("userId"), args.userId),
            q.eq(q.field("date"), args.date)
          )
        )
        .unique();

      if (existingRecord) {
        throw new Error("User has already timed in for this date");
      }
      
      return await ctx.db.insert("attendance", {
        timeIn: args.timeIn,
        userId: args.userId,
        date: args.date,
        type: args.type,
        status: "Present",
      });
    },
});

export const timeOut = mutation({
    args: {
      timeOut: v.number(),
      userId: v.id("users"),
      date: v.string(),
    },  
    handler: async (ctx, args) => {
      const existingRecord = await ctx.db
        .query("attendance")
        .filter((q) => 
          q.and(
            q.eq(q.field("userId"), args.userId),
            q.eq(q.field("date"), args.date)
          )
        )
        .unique();
      console.log(args.date)
      console.log(args.userId)
      if (existingRecord === null) {
        throw new ConvexError({ message: "You need to time in first before timing out" });
      }
      
      if(existingRecord.timeOut) {
        throw new ConvexError({ message: "You have already timed out for today" });
      }

      return await ctx.db.patch(existingRecord._id, {
        timeOut: args.timeOut,
      });
    },
})

