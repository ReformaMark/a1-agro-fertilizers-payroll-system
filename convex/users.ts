import { ConvexError, v } from "convex/values";

import { mutation, query } from "./_generated/server";

import { getAuthUserId } from "@convex-dev/auth/server";

import { createAccount } from "@convex-dev/auth/server";

import { Id } from "./_generated/dataModel";

export const get = query({
  args: {},

  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);

    if (!userId) throw new ConvexError("User not found");

    const user = await ctx.db.get(userId);

    if (!user) throw new ConvexError("User not found");

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

      image: user.image,

      imageUrl: user.image ? await ctx.storage.getUrl(user.image) : null,

      ratePerDay: user.ratePerDay,

      // employeeTypeId: user.employeeTypeId,
    };
  },
});

export const getEmployee = query({
  args: {
    userId: v.id("users"),
  },

  handler: async (ctx, args) => {
    console.log("getEmployee query called with userId:", args.userId);

    const userId = await getAuthUserId(ctx);

    if (!userId) throw new ConvexError("User not found");

    // find the employee by role and ID

    const employee = await ctx.db

      .query("users")

      .filter((q) =>
        q.and(
          q.eq(q.field("_id"), args.userId),

          q.eq(q.field("role"), "employee")
        )
      )

      .unique();

    console.log("Employee found:", {
      requestedId: args.userId,

      foundEmployee: employee
        ? {
          id: employee._id,

          name: `${employee.firstName} ${employee.lastName}`,
        }
        : null,
    });

    if (!employee) throw new ConvexError("Employee not found");

    // Get the image URL if image exists

    const imageUrl = employee.image
      ? await ctx.storage.getUrl(employee.image)
      : null;

    const response = {
      data: {
        ...employee,

        imageUrl,
      },
    };

    return response;
  },
});

export const checkRole = query({
  args: {},

  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);

    if (!userId) throw new ConvexError("User not found");

    const user = await ctx.db.get(userId);

    return user?.role;
  },
});

export const getEmployees = query({
  args: {
    department: v.optional(v.string()),

    status: v.optional(v.string()),
  },

  handler: async (ctx, args) => {
    let query = ctx.db
      .query("users")

      .filter((q) => q.eq(q.field("isArchived"), false));

    if (args.department) {
      query = query.filter((q) => q.eq(q.field("department"), args.department));
    }

    const employees = await query.collect();

    return await Promise.all(
      employees.map(async (emp) => ({
        ...emp,

        imageUrl: emp.image ? await ctx.storage.getUrl(emp.image) : null,

        status: getEmployeeStatus(emp),
      }))
    );
  },
});

export const getAllEmployees = query({
  handler: async (ctx) => {
    const query = ctx.db
      .query("users")

      .filter((q) => q.eq(q.field("role"), "employee"))

      .filter((q) => q.eq(q.field("isArchived"), false));

    const employees = await query.collect();

    return await Promise.all(
      employees.map(async (employee) => ({
        ...employee,

        imageUrl: employee.image
          ? await ctx.storage.getUrl(employee.image)
          : null,
      }))
    );
  },
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any

function getEmployeeStatus(employee: any) {
  if (employee.isArchived) return "inactive";

  return "active";
}

export const makeAdmin = mutation({
  args: { userId: v.id("users") },

  handler: async (ctx, args) => {
    const adminId = await getAuthUserId(ctx);

    if (!adminId) throw new ConvexError("Not authenticated");

    // Check if current user is admin

    const admin = await ctx.db.get(adminId);

    if (admin?.role !== "admin") {
      throw new ConvexError("Not authorized");
    }

    // Update user to admin

    await ctx.db.patch(args.userId, {
      role: "admin",
    });

    // Create audit log entry

    await ctx.db.insert("auditLogs", {
      action: "Made Admin",

      entityType: "employee",

      entityId: args.userId,

      performedBy: adminId,

      performedAt: new Date().toISOString(),

      details: `Granted admin privileges to user`,
    });

    return true;
  },
});

export const demoteAdmin = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const adminId = await getAuthUserId(ctx);
    if (!adminId) throw new ConvexError("Not authenticated");

    // Check if current user is admin
    const admin = await ctx.db.get(adminId);
    if (admin?.role !== "admin") {
      throw new ConvexError("Not authorized");
    }

    // Prevent self-demotion
    if (args.userId === adminId) {
      throw new ConvexError("Cannot demote yourself");
    }

    // Update admin to employee
    await ctx.db.patch(args.userId, {
      role: "employee",
      modifiedBy: adminId,
      modifiedAt: new Date().toISOString(),
    });

    // Create audit log entry
    await ctx.db.insert("auditLogs", {
      action: "Demoted Admin",
      entityType: "employee",
      entityId: args.userId,
      performedBy: adminId,
      performedAt: new Date().toISOString(),
      details: `Removed admin privileges from user`,
    });

    return true;
  },
});

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
    const adminId = await getAuthUserId(ctx);

    if (!adminId) throw new ConvexError("Not authenticated");

    // Check if current user is admin

    const admin = await ctx.db.get(adminId);

    if (admin?.role !== "admin") {
      throw new ConvexError("Not authorized");
    }

    const { userId, ...updateData } = args;

    // Get the employee being updated

    const employee = await ctx.db.get(userId);

    if (!employee) throw new ConvexError("Employee not found");

    // Update the employee

    await ctx.db.patch(userId, {
      ...updateData,

      modifiedBy: adminId,

      modifiedAt: new Date().toISOString(),
    });

    // Create audit log entry

    await ctx.db.insert("auditLogs", {
      action: "Updated Employee",

      entityType: "employee",

      entityId: userId,

      performedBy: adminId,

      performedAt: new Date().toISOString(),

      details: `Updated profile for ${employee.firstName} ${employee.lastName}`,
    });

    return true;
  },
});

export const listEmployeesWithContributions = query({
  args: {
    schedule: v.union(v.literal("1st half"), v.literal("2nd half")),
  },

  handler: async (ctx, args) => {
    const employees = await ctx.db
      .query("users")
      .filter((q) =>
        q.and(
          q.eq(q.field("role"), "employee"),
          q.eq(q.field("filledUpByAdmin"), true),
          q.eq(q.field("philHealthSchedule"), args.schedule)
        )
      )
      .collect();

    return employees;
  },
});

export const declineRegistration = mutation({
  args: {
    userId: v.id("users"),

    reason: v.string(),
  },

  handler: async (ctx, args) => {
    const adminId = await getAuthUserId(ctx);

    if (!adminId) throw new ConvexError("Unauthorized");

    const admin = await ctx.db.get(adminId);

    if (!admin || admin.role !== "admin") {
      throw new ConvexError(
        "Unauthorized: Only admins can decline registrations"
      );
    }

    return await ctx.db.patch(args.userId, {
      isDeclinedByAdmin: true,

      declinedReason: args.reason,

      declinedAt: new Date().toISOString(),

      modifiedBy: adminId,

      modifiedAt: new Date().toISOString(),
    });
  },
});

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
    maritalStatus: v.union(
      v.literal("single"),
      v.literal("married"),
      v.literal("widowed"),
      v.literal("divorced"),
      v.literal("separated")
    ),
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
    employeeTypeId: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      // Authenticate admin
      const adminId = await getAuthUserId(ctx);
      if (!adminId) throw new ConvexError("Not authenticated");

      const admin = await ctx.db.get(adminId);
      if (admin?.role !== "admin") {
        throw new ConvexError("Not authorized");
      }

      // Check if email already exists
      const existingUser = await ctx.db
        .query("users")
        .filter((q) => q.eq(q.field("email"), args.email))
        .first();

      if (existingUser) {
        throw new ConvexError("Email already exists");
      }

      // Check if employee ID already exists
      const existingEmployee = await ctx.db
        .query("users")
        .filter((q) => q.eq(q.field("employeeTypeId"), args.employeeTypeId))
        .first();

      if (existingEmployee) {
        throw new ConvexError("Employee ID already exists");
      }

      const { email, password, ...userData } = args;

      // Create the account using createAccount
      // @ts-expect-error convex does not support password provider types yet
      const accountResponse = await createAccount(ctx, {
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

      if (!accountResponse?.user?._id) {
        throw new ConvexError("Failed to create user account");
      }

      // Create the user record with all fields
      await ctx.db.patch(accountResponse.user._id as Id<"users">, {
        ...userData,
        email,
        role: "employee",
        isArchived: false,
        filledUpByAdmin: true,
        modifiedBy: adminId,
        modifiedAt: new Date().toISOString(),
      });

      // Get the updated user data
      const newUser = await ctx.db.get(accountResponse.user._id as Id<"users">);
      if (!newUser) {
        throw new ConvexError("Failed to retrieve created user");
      }

      // Create audit log entry
      await ctx.db.insert("auditLogs", {
        action: "Created Employee",
        entityType: "employee",
        entityId: accountResponse.user._id as Id<"users">,
        performedBy: adminId,
        performedAt: new Date().toISOString(),
        details: `Created employee account for ${args.firstName} ${args.lastName} with ID ${args.employeeTypeId}`,
      });

      return newUser;
    } catch (error) {
      console.error("Error in createEmployee:", error);
      throw error;
    }
  },
});

export const generateUploadUrl = mutation({
  args: {},

  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

export const updateProfileImage = mutation({
  args: {
    userId: v.id("users"),

    storageId: v.id("_storage"),
  },

  handler: async (ctx, args) => {
    const { userId, storageId } = args;

    // Update the user's image field with the storage ID

    await ctx.db.patch(userId, {
      image: storageId,

      modifiedAt: new Date().toISOString(),
    });

    // Create audit log

    await ctx.db.insert("auditLogs", {
      action: "Updated Profile Image",

      entityType: "employee",

      entityId: userId,

      performedBy: userId,

      performedAt: new Date().toISOString(),

      details: "Updated employee profile image",
    });

    // Return the updated user data

    const updatedUser = await ctx.db.get(userId);

    const imageUrl = updatedUser?.image
      ? await ctx.storage.getUrl(updatedUser.image)
      : null;

    return {
      ...updatedUser,

      imageUrl,
    };
  },
});

export const checkEmployeeIdExists = query({
  args: { employeeTypeId: v.string() },

  handler: async (ctx, args) => {
    const employee = await ctx.db

      .query("users")

      .filter((q) => q.eq(q.field("employeeTypeId"), args.employeeTypeId))

      .first();

    return !!employee;
  },
});

export const updatePersonalInfo = mutation({
  args: {
    userId: v.id("users"),
    firstName: v.string(),
    middleName: v.optional(v.string()),
    lastName: v.string(),
    maritalStatus: v.union(
      v.literal("single"),
      v.literal("married"),
      v.literal("widowed"),
      v.literal("divorced"),
      v.literal("separated")
    ),
    image: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    const adminId = await getAuthUserId(ctx);
    if (!adminId) throw new ConvexError("Not authenticated");

    const admin = await ctx.db.get(adminId);
    if (admin?.role !== "admin") {
      throw new ConvexError("Not authorized");
    }

    const { userId, ...updateData } = args;
    const employee = await ctx.db.get(userId);
    if (!employee) throw new ConvexError("Employee not found");

    await ctx.db.patch(userId, {
      ...updateData,
      modifiedBy: adminId,
      modifiedAt: new Date().toISOString(),
    });

    await ctx.db.insert("auditLogs", {
      action: "Updated Personal Information",
      entityType: "employee",
      entityId: userId,
      performedBy: adminId,
      performedAt: new Date().toISOString(),
      details: `Updated personal information for ${employee.firstName} ${employee.lastName}`,
    });

    return true;
  },
});

export const list = query({
  handler: async (ctx) => {
    return await ctx.db.query("users").collect();
  },
});

export const getDashboardStats = query({
  handler: async (ctx) => {
    // Get total employees
    const employees = await ctx.db
      .query("users")
      .filter((q) =>
        q.and(
          q.eq(q.field("role"), "employee"),
          q.eq(q.field("isArchived"), false)
        )
      )
      .collect();

    // Get employees present today
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const todayMonth = today.getMonth() + 1; // Adding 1 because months are 0-based
    const todayDay = today.getDate();

    const presentToday = await ctx.db
      .query("attendance")
      .filter((q) =>
        q.eq(
          q.field("date"),
          todayStr
        )
      )
      .collect();

    const birthdaysToday = employees
      .filter(employee => {
        if (!employee.dateOfBirth) return false;
        const [, birthMonth, birthDay] = employee.dateOfBirth.split('-').map(Number);
        return birthMonth === todayMonth && birthDay === todayDay;
      })
      .map(emp => ({
        id: emp._id,
        name: `${emp.firstName} ${emp.lastName}`,
        dateOfBirth: emp.dateOfBirth
      }));

    const upcomingBirthdays = employees
      .filter(employee => {
        if (!employee.dateOfBirth) return false;

        const [, birthMonth, birthDay] = employee.dateOfBirth.split('-').map(Number);
        const thisYearBirthday = new Date(
          today.getFullYear(),
          birthMonth - 1,
          birthDay
        );

        // If birthday has passed this year, check next year's birthday
        if (thisYearBirthday < today) {
          thisYearBirthday.setFullYear(today.getFullYear() + 1);
        }

        // Calculate days until birthday
        const diffTime = thisYearBirthday.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        // Only include future birthdays within next 30 days
        return diffDays > 0 && diffDays <= 30;
      })
      .map(emp => {
        const [, birthMonth, birthDay] = emp.dateOfBirth.split('-').map(Number);
        const thisYearBirthday = new Date(
          today.getFullYear(),
          birthMonth - 1,
          birthDay
        );

        if (thisYearBirthday < today) {
          thisYearBirthday.setFullYear(today.getFullYear() + 1);
        }

        const diffTime = thisYearBirthday.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        return {
          id: emp._id,
          name: `${emp.firstName} ${emp.lastName}`,
          dateOfBirth: emp.dateOfBirth,
          daysUntil: diffDays
        };
      })
      .sort((a, b) => a.daysUntil - b.daysUntil);

    return {
      totalEmployees: employees.length,
      presentToday: presentToday.length,
      birthdaysToday,
      upcomingBirthdays,
    };
  },
});

export const getUserProfile = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new ConvexError("Not authenticated");

    const user = await ctx.db.get(userId);
    if (!user) throw new ConvexError("User not found");

    return {
      ...user,
      imageUrl: user.image ? await ctx.storage.getUrl(user.image) : null,
    };
  },
});

export const updateUserProfile = mutation({
  args: {
    firstName: v.string(),
    lastName: v.string(),
    middleName: v.optional(v.string()),
    email: v.string(),
    contactNumber: v.optional(v.string()),
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
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new ConvexError("Not authenticated");

    const user = await ctx.db.get(userId);
    if (!user) throw new ConvexError("User not found");

    await ctx.db.patch(userId, {
      ...args,
      modifiedAt: new Date().toISOString(),
    });

    // await ctx.db.insert("auditLogs", {
    //   action: "Updated Profile",
    //   entityType: "user",
    //   entityId: userId,
    //   performedBy: userId,
    //   performedAt: new Date().toISOString(),
    //   details: "Updated user profile information",
    // });

    return true;
  },
});

export const getById = query({
  args: {
    userId: v.id("users")
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId)
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
      image: user.image,
      imageUrl: user.image ? await ctx.storage.getUrl(user.image) : null,
      ratePerDay: user.ratePerDay,
      annualLeaveBalance: user.annualLeaveBalance,
    }
  }
})