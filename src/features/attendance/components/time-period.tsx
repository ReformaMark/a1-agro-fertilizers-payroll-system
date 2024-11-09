"use client"
import { getCurrentTimePeriod } from "@/lib/utils";
import { Calendar } from "lucide-react";

export default function TimePeriod(selectedDate: string, setSelectedDate: (date: string) => void) {
    return (
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-4">
            <p className="text-sm font-medium mb-2">Time Period</p>
            <div className="flex flex-col gap-3">
                <div className="relative">
                    <input 
                        type="date"
                        className="w-[200px] h-9 rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background pr-10 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                        onChange={(e) => {
                            const selectedDate = new Date(e.target.value);
                            getCurrentTimePeriod(selectedDate);
                            setSelectedDate(e.target.value);
                        }}
                        value={selectedDate}
                    />
                    <Calendar className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <p>{getCurrentTimePeriod(selectedDate ? new Date(selectedDate) : undefined).formattedStart}</p>
                    <span>-</span>
                    <p>{getCurrentTimePeriod(selectedDate ? new Date(selectedDate) : undefined).formattedEnd}</p>
                </div>
            </div>
        </div>
    );
}