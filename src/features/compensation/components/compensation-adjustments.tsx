"use client"

import { DataTable } from "@/components/data-table"
import { Button } from "@/components/ui/button"
import { ColumnDef } from "@tanstack/react-table"
import { Doc } from "../../../../convex/_generated/dataModel"
import { useState } from "react"
import { api } from "../../../../convex/_generated/api"
import { CompensationAdjustmentForm } from "./compensation-adjustment-form"
import { useQuery } from "convex/react"
import { Badge } from "@/components/ui/badge"

interface CompensationAdjustment extends Doc<"compensationAdjustments"> {
    employeeCompensation: (Doc<"employeeCompensation"> & {
        compensationType: Doc<"compensationTypes"> | null
    }) | null
}

const columns: ColumnDef<CompensationAdjustment>[] = [
    {
        accessorKey: "employeeCompensation.user.firstName",
        header: "Employee",
        cell: ({ row }) => {
            const user = row.original.employeeCompensation?.user
            return user ? `${user.firstName} ${user.lastName}` : "N/A"
        },
    },
    {
        accessorKey: "employeeCompensation.compensationType.name",
        header: "Compensation Type",
    },
    {
        accessorKey: "adjustmentType",
        header: "Type",
        cell: ({ row }) => {
            const type = row.getValue<string>("adjustmentType")
            return (
                <Badge variant={
                    type === "Increase" ? "success" :
                    type === "Decrease" ? "destructive" :
                    "secondary"
                }>
                    {type}
                </Badge>
            )
        },
    },
    {
        accessorKey: "previousAmount",
        header: "Previous Amount",
        cell: ({ row }) => `₱${row.getValue<number>("previousAmount").toLocaleString()}`,
    },
    {
        accessorKey: "newAmount",
        header: "New Amount",
        cell: ({ row }) => `₱${row.getValue<number>("newAmount").toLocaleString()}`,
    },
    {
        accessorKey: "effectiveDate",
        header: "Effective Date",
        cell: ({ row }) => new Date(row.getValue("effectiveDate")).toLocaleDateString(),
    },
    {
        accessorKey: "reason",
        header: "Reason",
    },
]

export function CompensationAdjustments() {
    const [showForm, setShowForm] = useState(false)
    const adjustments = useQuery(api.compensation.getAdjustments, {})

    if (!adjustments) return <div>Loading...</div>

    return (
        <div className="space-y-4">
            <div className="flex justify-between">
                <h2 className="text-xl font-semibold">Compensation Adjustments</h2>
                <Button onClick={() => setShowForm(true)}>New Adjustment</Button>
            </div>

            <DataTable
                columns={columns}
                data={adjustments}
                filter="employeeCompensation.user.firstName"
                filterLabel="Employee Name"
            />

            {showForm && (
                <CompensationAdjustmentForm onClose={() => setShowForm(false)} />
            )}
        </div>
    )
}