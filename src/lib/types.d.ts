import { Doc } from "../../convex/_generated/dataModel"
import { Id } from "../../convex/_generated/dataModel"


export type Attendance = Doc<"attendance"> & {
    employee: Doc<"users">,
}

export interface AttendanceWithUser extends Doc<"attendance"> {
   
    employee: Doc<"users"> 
}


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

export interface PhilHealthRange {
    yearStart: number
    yearEnd: number
    basicSalary: {
        from: number
        to: number | null // null for "and up" ranges
    }
    premiumRate: number
    monthlyPremium: number
    employeeShare: number
    employerShare: number
}

export interface ContributionTable {
    _id: Id<"contributionTables">
    type: string
    effectiveDate: string
    ranges: SSSRange[] | PagibigRange[] | PhilHealthRange[]
    isActive: boolean
    createdBy: Id<"users">
    modifiedBy: Id<"users">
    modifiedAt: string
}

export interface User {
    _id: Id<"users">
    firstName: string
    lastName: string
} 

  export interface SalaryComponent extends Doc<"salaryComponents"> {
    employee: Doc<"users">
    payrollPeriod: Doc<"payrollPeriods">
  }

  export interface Employee extends Doc<"users"> {
    imageUrl: string | null
  }

  export interface User {
    _id: Id<"users">
    _creationTime: number
    firstName: string
    lastName: string
    email: string
    role: string
    department: string
    filledUpByAdmin: boolean
    isDeclinedByAdmin: boolean
    declinedReason: string | null
    declinedAt: string | null
    image: string | null
    imageUrl: string | null
    ratePerDay: number
  }