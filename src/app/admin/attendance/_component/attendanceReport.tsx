"use client"

import { DataTable } from "@/components/data-table"

import { useQuery } from "convex/react"
import { api } from "../../../../../convex/_generated/api"
import { columns } from "./columns"
import { weeklyColumns } from "./weeklyColumns"
import { useState } from "react"
import { monthlyColumns } from "./monthlyColumns"
import { AttendanceWithUser } from "@/lib/types"

export default function AttendanceReport() {
    const attendance = useQuery(api.attendance.list)
    const [reportType, setReportType] = useState<"daily" | "weekly" | "monthly">("daily")
    const data = (attendance ?? []) as AttendanceWithUser[]
    return (
        <div className="space-y-4">
            <div className="flex items-center gap-x-4">
                <select
                    className="w-[200px] h-8 rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background"
                    defaultValue="daily"
                    onChange={(e) => setReportType(e.target.value as "daily" | "weekly" | "monthly")}
                >
                    <option value="daily">Daily Report</option>
                    <option value="weekly">Weekly Report</option>
                    <option value="monthly">Monthly Report</option>
                </select>
            </div>

            {reportType === "daily" && (
                <DataTable

                    columns={columns}
                    data={data}
                    filter="userId"
                    filterLabel="Employee Id"
                />
            )}

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
            )}


        </div>
    )
}