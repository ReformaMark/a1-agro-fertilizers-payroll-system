"use client"

import { DataTable } from "@/components/data-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ColumnDef } from "@tanstack/react-table"
import { PencilIcon } from "lucide-react"
import { useMemo, useState } from "react"
import { Doc } from "../../../../convex/_generated/dataModel"
import { useEmployees } from "../api/employees"
import { CompleteProfileDialog } from "./complete-profile-dialog"
import { ConfirmMakeAdminDialog } from "./confirm-make-admin-dialog"
import { EditEmployeeDialog } from "./edit-employee-dialog"
import { DeclineRegistrationDialog } from "@/features/auth/components/decline-registration-dialog"
import { EmployeeFormDialog } from "./employee-form-dialog"

type Employee = Doc<"users">

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

    const columns = useMemo<ColumnDef<Employee>[]>(() => [
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
                const isDeclined = row.original.isDeclinedByAdmin

                if (isDeclined) {
                    return null
                }

                return (
                    <div className="flex gap-2">
                        {isComplete ? (
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setEditingEmployee(row.original)}
                                title="Edit Employee"
                            >
                                <PencilIcon className="h-4 w-4" />
                            </Button>
                        ) : (
                            <>
                                <CompleteProfileDialog employee={row.original} />
                                <DeclineRegistrationDialog employee={row.original} />
                            </>
                        )}
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
    const declinedEmployees = employees.filter(emp => emp.isDeclinedByAdmin)

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-semibold tracking-tight">Registered Employees</h2>
                <EmployeeFormDialog />
            </div>

            <Tabs defaultValue="active" className="space-y-6">
                <TabsList>
                    <TabsTrigger value="active">
                        Active Employees
                        <Badge variant="secondary" className="ml-2">
                            {activeEmployees.length}
                        </Badge>
                    </TabsTrigger>
                    <TabsTrigger value="declined">
                        Declined Registrations
                        <Badge variant="secondary" className="ml-2">
                            {declinedEmployees.length}
                        </Badge>
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="active" className="space-y-4">
                    <div className="rounded-lg border bg-card">
                        <DataTable
                            columns={columns}
                            data={activeEmployees}
                            filter="name"
                            filterLabel="Search active employees"
                        />
                    </div>
                </TabsContent>

                <TabsContent value="declined" className="space-y-4">
                    <div className="rounded-lg border bg-card">
                        <DataTable
                            columns={columns}
                            data={declinedEmployees}
                            filter="name"
                            filterLabel="Search declined registrations"
                        />
                    </div>
                </TabsContent>
            </Tabs>

            {editingEmployee && (
                <EditEmployeeDialog
                    employee={editingEmployee}
                    open={!!editingEmployee}
                    onOpenChange={(open) => !open && setEditingEmployee(null)}
                />
            )}
        </div>
    )
}