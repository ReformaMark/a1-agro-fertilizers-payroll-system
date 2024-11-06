import { Doc } from "../../convex/_generated/dataModel";

export type Attendance = Doc<"attendance"> & {
    employee: Doc<"users">,
}

export interface AttendanceWithUser extends Doc<"attendance"> {
    employee: Doc<"users">
  }