"use client"

import { DataTable } from "@/components/data-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DeclineRegistrationDialog } from "@/features/auth/components/decline-registration-dialog"
import { ColumnDef } from "@tanstack/react-table"
import { PencilIcon } from "lucide-react"
import { useMemo, useState } from "react"
import { Doc } from "../../../../convex/_generated/dataModel"
import { useEmployees } from "../api/employees"
import { AuditLogDialog } from "./audit-log-dialog"
import { CompleteProfileDialog } from "./complete-profile-dialog"
import { ConfirmMakeAdminDialog } from "./confirm-make-admin-dialog"
import { EditEmployeeDialog } from "./edit-employee-dialog"
import { EmployeeFormDialog } from "./employee-form-dialog"

type Employee = Doc<"users"> & { imageUrl?: string | null }

const registrationStatus = (employee: Employee) => {
    if (!employee.department || !employee.position || !employee.hiredDate) {
        return "incomplete"
    }
    return "complete"
}

const statusColors = {
    "complete": "bg-green-100 text-green-800",
    "incomplete": "bg-yellow-100 text-yellow-800",
    "declined": "bg-red-100 text-red-800",
} as const

export function EmployeeList() {
    const employees = useEmployees()
    const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null)
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

    const handleEditClick = (employee: Employee) => {
        setEditingEmployee(employee)
        setIsEditDialogOpen(true)
    }

    const handleEditDialogClose = () => {
        setIsEditDialogOpen(false)
        setEditingEmployee(null)
    }

    const columns = useMemo<ColumnDef<Employee>[]>(() => [
        {
            accessorKey: "name",
            header: "Name",
            cell: ({ row }) => {
                const employee = row.original
                return (
                    <div className="flex items-center gap-3">
                        {employee.imageUrl && (
                            <div className="relative h-8 w-8 rounded-full overflow-hidden">
                                <img
                                    src={employee.imageUrl}
                                    alt={`${employee.firstName} ${employee.lastName}`}
                                    className="object-cover h-full w-full"
                                />
                            </div>
                        )}
                        <div>
                            <div className="font-medium">
                                {employee.firstName} {employee.lastName}
                            </div>
                            <div className="text-sm text-muted-foreground">
                                {employee.email}
                            </div>
                        </div>
                    </div>
                )
            }
        },
        {
            accessorKey: "department",
            header: "Department",
            cell: ({ row }) => row.original.department || "Not set"
        },
        {
            accessorKey: "position",
            header: "Position",
            cell: ({ row }) => row.original.position || "Not set"
        },
        {
            accessorKey: "registrationStatus",
            header: "Registration Status",
            cell: ({ row }) => {
                const isDeclined = row.original.isDeclinedByAdmin
                const status = isDeclined ? "declined" : registrationStatus(row.original)
                return (
                    <Badge className={`${statusColors[status]} border-none`}>
                        {status}
                    </Badge>
                )
            }
        },
        {
            id: "actions",
            cell: ({ row }) => {
                const isComplete = registrationStatus(row.original) === "complete"

                return (
                    <div className="flex gap-2">
                        {isComplete
                            && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        handleEditClick(row.original)
                                    }}
                                    title="Edit Employee"
                                >
                                    <PencilIcon className="h-4 w-4" />
                                </Button>
                            )
                        }
                        <ConfirmMakeAdminDialog
                            userId={row.original._id}
                            userName={`${row.original.firstName} ${row.original.lastName}`}
                        />
                    </div>
                )
            }
        }
    ], [])

    if (!employees) {
        return (
            <div className="flex items-center justify-center h-48 text-muted-foreground">
                Loading...
            </div>
        )
    }

    const activeEmployees = employees.filter(emp => !emp.isDeclinedByAdmin)

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-semibold tracking-tight">Registered Employees</h2>
                <div className="flex gap-2">
                    <AuditLogDialog />
                    <EmployeeFormDialog />
                </div>
            </div>

            <div className="rounded-lg border p-5 bg-card">
                <DataTable
                    columns={columns}
                    data={activeEmployees}
                    filter="name"
                    filterLabel="Search active employees"
                />
            </div>

            {editingEmployee && (
                <EditEmployeeDialog
                    key={`edit-dialog-${editingEmployee._id}`}
                    employee={editingEmployee}
                    open={isEditDialogOpen}
                    onOpenChange={(open) => {
                        handleEditDialogClose();
                    }}
                />
            )}
        </div>
    )
}