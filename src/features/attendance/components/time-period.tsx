"use client"
import { getCurrentTimePeriod } from "@/lib/utils";

export default function TimePeriod(selectedDate: string, setSelectedDate: (date: string) => void) {
    return (
    
        <div className="flex justify-between items-center gap-3  w-full">

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
               
            </div>
            <div className="flex items-center gap-2 text-sm font-bold">
            <p>Period of Cutoff:</p>
                <div className="flex items-center p-1 rounded-md bg-gray-100 text-black">
                    <p>{getCurrentTimePeriod(selectedDate ? new Date(selectedDate) : undefined).formattedStart}</p>
                    <span>-</span>
                    <p>{getCurrentTimePeriod(selectedDate ? new Date(selectedDate) : undefined).formattedEnd}</p>
                </div>
            </div>
        </div>
        
    );
}