"use client"

import { DataTable } from "@/components/data-table"
import { Button } from "@/components/ui/button"
import { ColumnDef } from "@tanstack/react-table"
import { Doc } from "../../../../convex/_generated/dataModel"
import { useEmployeeCompensations } from "../api/compensation"
import { useState } from "react"
import { AssignCompensationForm } from "./assign-compensation-form"

interface EmployeeCompensationWithType extends Doc<"employeeCompensation"> {
    compensationType: Doc<"compensationTypes"> | null
}

const columns: ColumnDef<EmployeeCompensationWithType>[] = [
    {
        accessorKey: "userId",
        header: "Employee",
        // TODO: Fetch employee name
    },
    {
        accessorKey: "compensationType.name",
        header: "Compensation Type",

    },
    {
        accessorKey: "amount",
        header: "Amount",
        cell: ({ row }) => `₱${row.getValue<number>("amount").toLocaleString()}`,
    },
    {
        accessorKey: "status",
        header: "Status",
    },
    {
        accessorKey: "startDate",
        header: "Start Date",
        cell: ({ row }) => new Date(row.getValue("startDate")).toLocaleDateString(),
    },
]

export function EmployeeCompensations() {
    const [showForm, setShowForm] = useState(false)
    const compensations = useEmployeeCompensations()

    if (!compensations) return <div>Loading...</div>

    return (
        <div className="space-y-4">
            <div className="flex justify-between">
                <h2 className="text-xl font-semibold">Employee Compensations</h2>
                <Button onClick={() => setShowForm(true)}>Assign Compensation</Button>
            </div>

            <DataTable
                columns={columns}
                data={compensations}
                filter="employeeTypeId"
                filterLabel="Employee ID"
            />

            {showForm && (
                <AssignCompensationForm onClose={() => setShowForm(false)} />
            )}
        </div>
    )
}