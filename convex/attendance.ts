import { query } from "./_generated/server"

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
})