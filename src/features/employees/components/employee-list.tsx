"use client"

import { DataTable } from "@/components/data-table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ColumnDef } from "@tanstack/react-table"
import { PencilIcon } from "lucide-react"
import { useMemo, useState } from "react"
import { Doc } from "../../../../convex/_generated/dataModel"
import { useEmployees } from "../api/employees"
import { AuditLogDialog } from "./audit-log-dialog"
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
                const initials = `${employee.firstName[0]}${employee.lastName[0]}`

                return (
                    <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                            <AvatarImage
                                src={employee.imageUrl ?? undefined}
                                alt={`${employee.firstName} ${employee.lastName}`}
                            />
                            <AvatarFallback className="bg-green-600 text-white font-semibold">
                                {initials}
                            </AvatarFallback>
                        </Avatar>
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
            accessorKey: "employeeTypeId",
            header: "Employee ID",
            cell: ({ row }) => {
                const id = row.original.employeeTypeId
                return id ? (
                    <span className="font-mono">
                        {`${id.slice(0, 4)} ${id.slice(4, 7)} ${id.slice(7)}`}
                    </span>
                ) : "N/A"
            }
        },
        {
            id: "actions",
            cell: ({ row }) => {
                const isComplete = registrationStatus(row.original) === "complete"

                return (
                    <div className="flex gap-2">
                        {isComplete && (
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

    const adminColumns = useMemo<ColumnDef<Employee>[]>(() => columns.filter(col => col.id !== "actions"), [columns])

    if (!employees) {
        return (
            <div className="flex items-center justify-center h-48 text-muted-foreground">
                <div className="animate-pulse">Loading...</div>
            </div>
        )
    }

    const activeEmployees = employees.filter(emp =>
        !emp.isDeclinedByAdmin &&
        emp.role === "employee"
    )
    const admins = employees.filter(emp => emp.role === "admin")

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-semibold tracking-tight">Registered Users</h2>
                <div className="flex gap-2">
                    <AuditLogDialog />
                    <EmployeeFormDialog key="employee-form" />
                </div>
            </div>

            <Tabs defaultValue="employees" className="w-full">
                <TabsList className="grid w-[400px] grid-cols-2">
                    <TabsTrigger value="employees">Employees</TabsTrigger>
                    <TabsTrigger value="admins">Administrators</TabsTrigger>
                </TabsList>

                <TabsContent value="employees" className="mt-4">
                    <div className="rounded-lg border p-5 bg-card">
                        <DataTable
                            columns={columns}
                            data={activeEmployees}
                            filter="name"
                            filterLabel="Search active employees"
                        />
                    </div>
                </TabsContent>

                <TabsContent value="admins" className="mt-4">
                    <div className="rounded-lg border p-5 bg-card">
                        <DataTable
                            columns={adminColumns}
                            data={admins}
                            filter="name"
                            filterLabel="Search administrators"
                        />
                    </div>
                </TabsContent>
            </Tabs>

            {editingEmployee && (
                <EditEmployeeDialog
                    key={`edit-dialog-${editingEmployee._id}`}
                    employee={editingEmployee}
                    open={isEditDialogOpen}
                    onOpenChange={handleEditDialogClose}
                />
            )}
        </div>
    )
}