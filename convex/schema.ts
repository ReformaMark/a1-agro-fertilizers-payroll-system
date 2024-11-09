import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    ...authTables,
    users: defineTable({
        // Auth & Role fields
        email: v.string(),
        role: v.union(v.literal("admin"), v.literal("employee")),
        emailVerificationTime: v.optional(v.number()),
        phone: v.optional(v.string()),
        phoneVerificationTime: v.optional(v.number()),
        isAnonymous: v.optional(v.boolean()),
        // Personal Information
        firstName: v.string(),
        middleName: v.optional(v.string()),
        lastName: v.string(),
        image: v.optional(v.string()),
        dateOfBirth: v.string(),
        gender: v.union(v.literal("male"), v.literal("female")),
        maritalStatus: v.union(v.literal("single"), v.literal("married"), v.literal("widowed"), v.literal("divorced"), v.literal("separated")),
        contactType: v.union(v.literal("mobile"), v.literal("landline")),
        contactNumber: v.string(),
        // Employment Information
        employeeTypeId: v.optional(v.string()),
        department: v.optional(v.string()),
        position: v.optional(v.string()),
        hiredDate: v.optional(v.string()),
        // Address Information
        region: v.optional(v.string()),
        province: v.optional(v.string()),
        city: v.optional(v.string()),
        barangay: v.optional(v.string()),
        postalCode: v.optional(v.string()),
        street: v.optional(v.string()),
        houseNumber: v.optional(v.string()),
        // Payroll Information
        // government ids
        ratePerDay: v.optional(v.number()),
        philHealthNumber: v.optional(v.string()),
        pagIbigNumber: v.optional(v.string()),
        sssNumber: v.optional(v.string()),
        birTin: v.optional(v.string()),
        // contributions
        philHealthContribution: v.optional(v.number()),
        pagIbigContribution: v.optional(v.number()),
        sssContribution: v.optional(v.number()),
        incomeTax: v.optional(v.number()),
        // Payment Schedules
        philHealthSchedule: v.optional(v.union(v.literal("1st half"), v.literal("2nd half"))),
        pagIbigSchedule: v.optional(v.union(v.literal("1st half"), v.literal("2nd half"))),
        sssSchedule: v.optional(v.union(v.literal("1st half"), v.literal("2nd half"))),
        incomeTaxSchedule: v.optional(v.union(v.literal("1st half"), v.literal("2nd half"))),
        // Meta
        isArchived: v.optional(v.boolean()),
        filledUpByAdmin: v.optional(v.boolean()),
        modifiedBy: v.optional(v.id("users")),
        modifiedAt: v.optional(v.string()),
        isDeclinedByAdmin: v.optional(v.boolean()),
        declinedReason: v.optional(v.string()),
        declinedAt: v.optional(v.string()),
        annualLeaveBalance: v.optional(v.number()),
    })
        .index("by_email", ["email"]) // For user lookups
        .index("by_role", ["role"]) // For filtering admins/employees
        .index("by_department", ["department"]) // For department-based queries
        .index("by_archived", ["isArchived"]), // For filtering active/inactive users
    attendance: defineTable({
        userId: v.id("users"),
        timeIn: v.number(),
        timeOut: v.optional(v.number()),
        type: v.string(), // Regular, Overtime, etc.
        status: v.string(), // Present, Late, Absent
        remarks: v.optional(v.string()),
        date: v.string(), // Added for daily records

    })
        .index("by_user", ["userId"]) // For user's attendance history
        .index("by_date", ["date"]) // For daily reports
        .index("by_user_and_date", ["userId", "date"]), // For specific user's attendance on a date
    leaves: defineTable({
        userId: v.id("users"),
        type: v.string(), // Vacation, Sick, Maternity, etc.
        startDate: v.string(),
        endDate: v.string(),
        status: v.string(), // Pending, Approved, Rejected
        approvedBy: v.optional(v.id("users")),
        reason: v.string(),
    })
        .index("by_user", ["userId"]) // For user's leave history
        .index("by_status", ["status"]) // For pending approvals
        .index("by_date_range", ["startDate", "endDate"]), // For date range queries
    payrollPeriods: defineTable({
        startDate: v.string(), // YYYY-MM-DD format
        endDate: v.string(), // YYYY-MM-DD format
        status: v.optional(v.string()), // Draft, Processing, Completed
        processedBy: v.optional(v.id("users")),
    })
        .index("by_status", ["status"]) // For filtering by processing status
        .index("by_date_range", ["startDate", "endDate"]), // For period lookups
    salaryComponents: defineTable({
        userId: v.id("users"),
        payrollPeriodId: v.id("payrollPeriods"),
        basicPay: v.number(),
        allowances: v.array(v.object({
            type: v.string(),
            amount: v.number(),
        })), 
        deductions: v.array(v.object({
            type: v.string(),
            amount: v.number(),
        })),
        governmentContributions: v.object({
            sss: v.number(),
            philHealth: v.number(),
            pagIbig: v.number(),
            tax: v.number(),
        }),
        netPay: v.number(),
        overtime: v.optional(v.object({
            hours: v.number(),
            rate: v.number(),
            amount: v.number(),
        })),
        holidayPay: v.optional(v.object({
            type: v.string(),
            amount: v.number(),
        })),
        additionalCompensation: v.array(v.object({
            compensationTypeId: v.id("compensationTypes"),
            amount: v.number(),
            remarks: v.optional(v.string()),
        })),
    })
        .index("by_user", ["userId"]) // For user's salary history
        .index("by_payroll_period", ["payrollPeriodId"]), // For payroll processing
    requests: defineTable({
        userId: v.id("users"),
        type: v.string(), // Loan, Cash Advance, etc.
        amount: v.optional(v.number()),
        status: v.string(), // Pending, Approved, Rejected
        description: v.string(),
        approvedBy: v.optional(v.id("users")),
        dateRequested: v.string(),
        dateProcessed: v.optional(v.string()),
    })
        .index("by_user", ["userId"]) // For user's requests
        .index("by_status", ["status"]) // For pending approvals
        .index("by_type", ["type"]), // For filtering request types
    contributionTables: defineTable({
        type: v.string(), // "SSS", "PAGIBIG", "PHILHEALTH", "TAX"
        effectiveDate: v.string(),
        // Make the ranges union type to handle different contribution table structures
        ranges: v.union(
            // SSS contribution table structure
            v.array(v.object({
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
            // Updated Pag-IBIG contribution table structure
            v.array(v.object({
                rangeStart: v.number(),
                rangeEnd: v.number(),
                description: v.string(),
                employeeRate: v.number(),
                employerRate: v.number(),
                maxLimit: v.number(),
            })),
            // PhilHealth contribution table structure
            v.array(v.object({
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
            }))
        ),
        isActive: v.boolean(),
        createdBy: v.id("users"),
        modifiedBy: v.id("users"),
        modifiedAt: v.string(),
    })
        .index("by_type", ["type"])
        .index("by_type_and_date", ["type", "effectiveDate"])
        .index("by_active", ["isActive"]),
    biometricData: defineTable({
        userId: v.id("users"),
        fingerprintHash: v.string(), // Store hashed fingerprint data
        deviceId: v.string(), // To track which biometric device captured the data
        isActive: v.boolean(),
        registeredAt: v.string(),
        lastUpdated: v.string(),
    })
        .index("by_user", ["userId"])
        .index("by_fingerprint", ["fingerprintHash"]), // For quick fingerprint matching
    holidays: defineTable({
        name: v.string(),
        date: v.string(), // ISO string
        type: v.string(), // "Regular" | "Special" only
        description: v.optional(v.string()),
        isRecurring: v.boolean(), // true for annual holidays
        location: v.optional(v.string()), // for local holidays
        createdBy: v.id("users"),
        modifiedAt: v.string(),
        isArchived: v.boolean(),
    })
        .index("by_date", ["date"])
        .index("by_type", ["type"])
        .index("by_location", ["location"]),
    reportTemplates: defineTable({
        name: v.string(),
        type: v.string(), // "BIR", "SSS", "Payroll", etc.
        template: v.string(), // JSON string of template configuration
        createdBy: v.id("users"),
        lastModified: v.string(),
    }),
    compensationTypes: defineTable({
        name: v.string(), // "Transportation Allowance", "Performance Bonus", etc.
        description: v.string(),
        category: v.string(), // "Allowance", "Bonus", "Benefit"
        taxable: v.boolean(),
        frequency: v.string(), // "Monthly", "Quarterly", "Annual", "One-time"
        computationType: v.string(), // "Fixed", "Percentage", "Formula"
        defaultAmount: v.optional(v.number()),
        formula: v.optional(v.string()), // For dynamic calculations
        isArchived: v.boolean(),
        createdBy: v.id("users"),
        modifiedAt: v.string(),
        modifiedBy: v.optional(v.id("users")),
    })
        .index("by_category", ["category"])
        .index("by_archived", ["isArchived"]),
    employeeCompensation: defineTable({
        userId: v.id("users"),
        compensationTypeId: v.id("compensationTypes"),
        startDate: v.string(),
        endDate: v.optional(v.string()),
        amount: v.number(),
        status: v.string(), // "Active", "Inactive", "Pending"
        approvedBy: v.optional(v.id("users")),
        approvalDate: v.optional(v.string()),
        remarks: v.optional(v.string()),
        payrollPeriodId: v.optional(v.id("payrollPeriods")), // Link to specific payroll period if one-time
        isArchived: v.boolean(),
        modifiedBy: v.id("users"),
        modifiedAt: v.string(),
    })
        .index("by_user", ["userId"])
        .index("by_status", ["status"])
        .index("by_date_range", ["startDate", "endDate"])
        .index("by_payroll_period", ["payrollPeriodId"]),
    compensationAdjustments: defineTable({
        employeeCompensationId: v.id("employeeCompensation"),
        adjustmentType: v.string(), // "Increase", "Decrease", "Suspension"
        reason: v.string(),
        previousAmount: v.number(),
        newAmount: v.number(),
        effectiveDate: v.string(),
        status: v.string(), // "Pending", "Approved", "Rejected"
        approvedBy: v.optional(v.id("users")),
        approvalDate: v.optional(v.string()),
        remarks: v.optional(v.string()),
        modifiedBy: v.id("users"),
        modifiedAt: v.string(),
    })
        .index("by_status", ["status"])
        .index("by_effective_date", ["effectiveDate"]),
    leaveRequests: defineTable({
        userId: v.id("users"),
        type: v.string(), // "Annual", "Sick", "Maternity", "Paternity", "Emergency", "Other"
        startDate: v.string(),
        endDate: v.string(),
        reason: v.string(),
        status: v.string(), // "Pending", "Approved", "Rejected"
        approvedBy: v.optional(v.id("users")),
        approvedAt: v.optional(v.string()),
        rejectionReason: v.optional(v.string()),
        attachments: v.optional(v.array(v.string())), // URLs to uploaded documents
        createdAt: v.string(),
        modifiedAt: v.string(),
    })
        .index("by_user", ["userId"])
        .index("by_status", ["status"])
        .index("by_date", ["startDate"]),
    benefitRequests: defineTable({
        userId: v.id("users"),
        type: v.string(), // "Health", "Insurance", "Allowance", "Other"
        description: v.string(),
        amount: v.optional(v.number()),
        status: v.string(), // "Pending", "Approved", "Rejected"
        approvedBy: v.optional(v.id("users")),
        approvedAt: v.optional(v.string()),
        rejectionReason: v.optional(v.string()),
        attachments: v.optional(v.array(v.string())), // URLs to uploaded documents
        createdAt: v.string(),
        modifiedAt: v.string(),
    })
        .index("by_user", ["userId"])
        .index("by_status", ["status"]),
    companyLoans: defineTable({
        userId: v.id("users"),
        type: v.string(), // "VALE" or "Partial A/R"
        amount: v.number(),
        status: v.string(), // "Pending", "Approved", "Rejected"
        approvedBy: v.optional(v.id("users")),
        approvedAt: v.optional(v.string()),
        rejectionReason: v.optional(v.string()),
        createdAt: v.string(),
        modifiedAt: v.string(),
        amortization: v.number(),
        totalAmount: v.number(),
        remarks: v.optional(v.string()),
        totalPaid: v.optional(v.number()),
        remainingBalance: v.optional(v.number()),
    }).index("by_user", ["userId"]),
    governmentLoans: defineTable({
        userId: v.id("users"),
        applicationType: v.string(), // "SSS Salary", "SSS Calamity", "Pagibig Multi-purpose", "Pagibig Calamity"
        applicationNo: v.string(),
        amount: v.number(),
        startDate: v.string(),
        endDate: v.string(),
        monthlySchedule: v.string(), // "1st Half", "2nd Half"
        status: v.string(),
        approvedBy: v.optional(v.id("users")),
        approvedAt: v.optional(v.string()),
        rejectionReason: v.optional(v.string()),
        createdAt: v.string(),
        modifiedAt: v.string(),
        amortization: v.number(),
        totalAmount: v.number(),
        additionalInfo: v.optional(v.string()),
    })
        .index("by_user", ["userId"])
        .index("by_date_range", ["startDate", "endDate"]),
    cashAdvanceRequests: defineTable({
        userId: v.id("users"),
        type: v.string(),
        amount: v.number(),
        paymentTerm: v.string(),
        reason: v.string(),
        status: v.string(),
        rejectionReason: v.optional(v.string()),
        createdAt: v.string(),
        modifiedAt: v.string(),
    })
        .index("by_user", ["userId"])
        .index("by_status", ["status"])
        .index("by_user_and_status", ["userId", "status"]),
    auditLogs: defineTable({
        action: v.string(),
        entityType: v.string(),
        entityId: v.id("users"),
        performedBy: v.string(),
        performedAt: v.string(),
        details: v.optional(v.string()),
    })
        .index("by_entity", ["entityType", "entityId"])
        .index("by_date", ["performedAt"]),
});
