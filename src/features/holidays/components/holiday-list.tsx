"use client"

import { DataTable } from "@/components/data-table"
import { Button } from "@/components/ui/button"
import { ColumnDef } from "@tanstack/react-table"
import { Doc, Id } from "../../../../convex/_generated/dataModel"
import { useState } from "react"
import { useArchiveHoliday, useHolidays, useRestoreHoliday } from "../api/holidays"
import { toast } from "sonner"
import { Plus, MoreHorizontal, Pencil, Trash, CalendarDays, Undo2 } from "lucide-react"
import { HolidayForm } from "./holiday-form"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { Switch } from "@/components/ui/switch"

interface HolidayWithUser extends Omit<Doc<"holidays">, 'createdBy'> {
    createdBy: Doc<"users"> | Id<"users"> | null;
    userId?: string;
}

export function HolidayList() {
    const [showForm, setShowForm] = useState(false)
    const [editingHoliday, setEditingHoliday] = useState<HolidayWithUser | null>(null)
    const [showArchived, setShowArchived] = useState(false)
    const currentYear = new Date().getFullYear().toString()
    const holidays = useHolidays(currentYear, undefined, undefined, showArchived)
    const archiveHoliday = useArchiveHoliday()
    const restoreHoliday = useRestoreHoliday()

    async function handleArchive(holidayId: Id<"holidays">) {
        try {
            await archiveHoliday({ holidayId })
            toast.success("Holiday archived successfully")
        } catch (error) {
            toast.error("Failed to archive holiday")
            console.error(error)
        }
    }

    async function handleRestore(holidayId: Id<"holidays">) {
        try {
            await restoreHoliday({ holidayId })
            toast.success("Holiday restored successfully")
        } catch (error) {
            toast.error("Failed to restore holiday")
            console.error(error)
        }
    }

    if (!holidays) {
        return (
            <div className="space-y-4">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-[400px] w-full" />
            </div>
        )
    }

    const filteredHolidays = holidays ?? []

    const columns: ColumnDef<HolidayWithUser>[] = [
        {
            accessorKey: "name",
            header: "Holiday Name",
        },
        {
            accessorKey: "date",
            header: "Date",
            cell: ({ row }) => format(new Date(row.getValue("date")), "MMMM d, yyyy"),
        },
        {
            accessorKey: "type",
            header: "Type",
            cell: ({ row }) => {
                const type = row.getValue<string>("type")
                return (
                    <Badge variant={
                        type === "Regular" ? "default" :
                            type === "Special" ? "secondary" :
                                "outline"
                    } className="font-medium">
                        {type}
                    </Badge>
                )
            },
        },
        {
            accessorKey: "isRecurring",
            header: "Recurring",
            cell: ({ row }) => (
                <Badge variant="outline" className={row.getValue("isRecurring") ? "bg-green-50 text-green-700 border-green-200" : "bg-gray-50 text-gray-600"}>
                    {row.getValue("isRecurring") ? "Yes" : "No"}
                </Badge>
            ),
        },
        {
            accessorKey: "location",
            header: "Location",
            cell: ({ row }) => (
                <span className="text-muted-foreground">
                    {row.getValue("location") || "National"}
                </span>
            ),
        },
        {
            accessorKey: "description",
            header: "Description",
            cell: ({ row }) => (
                <span className="text-sm text-muted-foreground line-clamp-2">
                    {row.getValue("description")}
                </span>
            ),
        },
        {
            id: "actions",
            cell: ({ row }) => {
                const holiday = row.original
                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            {!holiday.isArchived ? (
                                <>
                                    <DropdownMenuItem onClick={() => setEditingHoliday(holiday)}>
                                        <Pencil className="mr-2 h-4 w-4" />
                                        Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        className="text-destructive"
                                        onClick={() => handleArchive(holiday._id)}
                                    >
                                        <Trash className="mr-2 h-4 w-4" />
                                        Archive
                                    </DropdownMenuItem>
                                </>
                            ) : (
                                <DropdownMenuItem onClick={() => handleRestore(holiday._id)}>
                                    <Undo2 className="mr-2 h-4 w-4" />
                                    Restore
                                </DropdownMenuItem>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                )
            },
        },
    ]

    return (
        <Card>
            <CardHeader className="border-b">
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <CalendarDays className="h-5 w-5" />
                            Holiday Management
                        </CardTitle>
                        <CardDescription>
                            Manage regular, special, and local holidays
                        </CardDescription>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <Switch
                                checked={showArchived}
                                onCheckedChange={setShowArchived}
                                id="archived-view"
                            />
                            <label
                                htmlFor="archived-view"
                                className="text-sm text-muted-foreground"
                            >
                                Show Archived
                            </label>
                        </div>
                        {!showArchived && (
                            <Button onClick={() => setShowForm(true)} className="font-medium">
                                <Plus className="h-4 w-4 mr-1" />
                                Add Holiday
                            </Button>
                        )}
                    </div>
                </div>
            </CardHeader>

            <CardContent className="pt-6">
                <DataTable
                    columns={columns}
                    data={filteredHolidays}
                    filter="name"
                    filterLabel="Holiday Name"
                />

                {(showForm || editingHoliday) && (
                    <HolidayForm
                        // @ts-expect-error - TODO: fix this slight typing issue
                        holiday={editingHoliday}
                        onClose={() => {
                            setShowForm(false)
                            setEditingHoliday(null)
                        }}
                    />
                )}
            </CardContent>
        </Card>
    )
}