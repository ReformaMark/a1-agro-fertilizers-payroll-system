import { Id } from "../../convex/_generated/dataModel"

export interface SSSRange {
    rangeStart: number
    rangeEnd: number
    regularSS: number
    wisp: number
    totalMonthlySalaryCredit: number
    regularSSER: number
    regularSSEE: number
    regularSSTotal: number
    ecER: number
    ecEE: number
    ecTotal: number
    wispER: number
    wispEE: number
    wispTotal: number
    totalER: number
    totalEE: number
    grandTotal: number
}

export interface PagibigRange {
    rangeStart: number
    rangeEnd: number
    description: string
    employeeRate: number
    employerRate: number
    maxLimit: number
}

export interface ContributionTable {
    _id: Id<"contributionTables">
    type: string
    effectiveDate: string
    ranges: SSSRange[] | PagibigRange[]
    isActive: boolean
    createdBy: Id<"users">
    modifiedBy: Id<"users">
    modifiedAt: string
}

export interface User {
    _id: Id<"users">
    firstName: string
    lastName: string
    // ... other user fields
} 