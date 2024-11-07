import { HolidayList } from "@/features/holidays/components/holiday-list"

export default function HolidaysPage() {
    return (
        <div className="container py-6">
            {/* <div className="mb-6">
                <h1 className="text-3xl font-bold">Holiday Management</h1>
                <p className="text-muted-foreground">
                    Manage regular holidays, special non-working days, and local holidays
                </p>
            </div> */}
            <HolidayList />
        </div>
    )
} 