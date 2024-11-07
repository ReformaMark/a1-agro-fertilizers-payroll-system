/* eslint-disable @typescript-eslint/ban-ts-comment */
"use client"

import { DataTable } from "@/components/data-table"
import { ColumnDef } from "@tanstack/react-table"
import { Doc } from "../../../../convex/_generated/dataModel"
import { useEmployees } from "../api/employees"
import { Badge } from "@/components/ui/badge"
import { EmployeeFormDialog } from "./employee-form-dialog"

type Employee = Doc<"users">

const statusColors = {
    "active": "bg-green-100 text-green-800",
    "inactive": "bg-gray-100 text-gray-800",
    "on-leave": "bg-yellow-100 text-yellow-800",
    "terminated": "bg-red-100 text-red-800"
} as const

const columns: ColumnDef<Employee>[] = [
    {
        accessorKey: "employeeTypeId",
        header: "Employee ID",
    },
    {
        accessorKey: "name",
        header: "Name",
        cell: ({ row }) => (
            <div>
                <div className="font-medium">
                    {row.original.firstName} {row.original.lastName}
                </div>
                <div className="text-sm text-muted-foreground">
                    {row.original.email}
                </div>
            </div>
        )
    },
    {
        accessorKey: "department",
        header: "Department",
    },
    {
        accessorKey: "position",
        header: "Position",
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const status = row.getValue("status") as keyof typeof statusColors
            return (
                <Badge className={`${statusColors[status]} border-none`}>
                    {status}
                </Badge>
            )
        }
    },
    {
        accessorKey: "hiredDate",
        header: "Date Hired",
        cell: ({ row }) => new Date(row.getValue("hiredDate")).toLocaleDateString()
    }
]

export function EmployeeList() {
    const employees = useEmployees()

    if (!employees) {
        return (
            <div className="flex items-center justify-center h-48 text-muted-foreground">
                Loading...
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-semibold tracking-tight">Employees</h2>
                <EmployeeFormDialog />
            </div>

            <div className="rounded-lg border bg-card">
                <DataTable
                    columns={columns}
                    // @ts-expect-error
                    data={employees}
                    filter="name"
                    filterLabel="Search employees"
                />
            </div>
        </div>
    )
} 