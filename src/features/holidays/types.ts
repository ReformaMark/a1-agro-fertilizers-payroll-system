import { Doc } from "../../../convex/_generated/dataModel"


export interface HolidayWithUser extends Doc<"holidays"> {
    name: string
    date: string
    type: string
    description?: string
    isRecurring: boolean
    location?: string
    userId: string
}