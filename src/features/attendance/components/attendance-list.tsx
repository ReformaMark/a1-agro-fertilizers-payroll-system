"use client"

import { DataTable } from "@/components/data-table"

import { useQuery } from "convex/react"
import { columns } from "./columns"
// import { weeklyColumns } from "./weeklyColumns"
// import { useState } from "react"
// import { monthlyColumns } from "./monthlyColumns"
import { AttendanceWithUser } from "@/lib/types"
import { api } from "../../../../convex/_generated/api"
import TimePeriod from "./time-period"
import { useMemo, useState } from "react"
import { getCurrentTimePeriod } from "@/lib/utils"

export default function AttendanceReport() {
    const attendance = useQuery(api.attendance.list)
    const getCurrentDate = () => {
        const date = new Date()
        return date.toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        })
    }  
    const [selectedDate, setSelectedDate] = useState<string>(getCurrentDate())

    // Filter attendance based on selected date range
    const filteredData = useMemo(() => {
        if (!attendance) return []
        
        const { start, end } = getCurrentTimePeriod(new Date(selectedDate))
        
        return attendance.filter((record) => {
            const recordDate = new Date(record.date)
            return recordDate >= start && recordDate <= end
        }) as AttendanceWithUser[]
    }, [attendance, selectedDate])
   


    return (
        <div className="space-y-4 bg-white p-5">
          

                {TimePeriod(selectedDate, setSelectedDate)}
                <DataTable

                    columns={columns}
                    data={filteredData}
                    filter="date"
                    filterLabel="date"
                />
            {/* )}

            {reportType === "weekly" && (
                <DataTable

                    columns={weeklyColumns}
                    data={data}
                    filter="userId"
                    filterLabel="Employee Id"
                />
            )}
            {reportType === "monthly" && (
                <DataTable

                    columns={monthlyColumns}
                    data={data}
                    filter="userId"
                    filterLabel="Employee Id"
                />
            )} */}


        </div>
    )
}