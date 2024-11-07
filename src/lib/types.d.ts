import { Doc } from "../../convex/_generated/dataModel";

export type Attendance = Doc<"attendance"> & {
    employee: Doc<"users">,
}

export interface AttendanceWithUser extends Doc<"attendance"> {
    employee: Doc<"users">
  }

  export interface SalaryComponent extends Doc<"salaryComponents"> {
    employee: Doc<"users">
    payrollPeriod: Doc<"payrollPeriods">
  }

  export interface Employee extends Doc<"users"> {
    imageUrl: string | null
  }
