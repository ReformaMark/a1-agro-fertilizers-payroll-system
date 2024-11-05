"use client"

import { Button } from "@/components/ui/button"
import { useCompensationTypes } from "../api/compensation"

import { DataTable } from "@/components/data-table"
import { ColumnDef } from "@tanstack/react-table"
import { useState } from "react"
import { Doc } from "../../../../convex/_generated/dataModel"
import { CompensationTypeForm } from "./compensation-type-form"

type CompensationType = Doc<"compensationTypes">

const columns: ColumnDef<CompensationType>[] = [
    {
        accessorKey: "name",
        header: "Name",
    },
    {
        accessorKey: "category",
        header: "Category",
    },
    {
        accessorKey: "frequency",
        header: "Frequency",
    },
    {
        accessorKey: "computationType",
        header: "Computation",
    },
    {
        accessorKey: "defaultAmount",
        header: "Default Amount",
        cell: ({ row }) => {
            const amount = row.getValue("defaultAmount") as number
            return amount ? `₱${amount.toLocaleString()}` : "-"
        },
    },
    {
        accessorKey: "taxable",
        header: "Taxable",
        cell: ({ row }) => (row.getValue("taxable") ? "Yes" : "No"),
    },
]

export function CompensationTypes() {
    const [showForm, setShowForm] = useState(false)
    const types = useCompensationTypes()

    if (!types) return <div>Loading...</div>

    return (
        <div className="space-y-4">
            <div className="flex justify-between">
                <h2 className="text-xl font-semibold">Compensation Types</h2>
                <Button onClick={() => setShowForm(true)}>Add New Type</Button>
            </div>

            <DataTable
                columns={columns}
                data={types}
                filter="name"
                onRowClick={(row) => {
                    // Handle row click - maybe open edit form
                    console.log("Clicked row:", row)
                }}
            />

            {showForm && (
                <CompensationTypeForm onClose={() => setShowForm(false)} />
            )}
        </div>
    )
}