"use client"

import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/data-table"
import { useState } from "react"
import { useQuery } from "convex/react"
import { api } from "../../../../convex/_generated/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PlusCircle } from "lucide-react"
import { EditContributionTableDialog } from "./edit-contribution-table-dialog"
import { Id } from "../../../../convex/_generated/dataModel"

export function ContributionTables() {
    const [editingTable, setEditingTable] = useState<Id<"contributionTables"> | "new" | null>(null)
    const tables = useQuery(api.contributionTables.list)

    const columns = [
        {
            accessorKey: "type",
            header: "Type",
        },
        {
            accessorKey: "effectiveDate",
            header: "Effective Date",
            // @ts-expect-error - no need to put a type here
            cell: ({ row }) => new Date(row.getValue("effectiveDate")).toLocaleDateString(),
        },
        {
            accessorKey: "isActive",
            header: "Status",
            // @ts-expect-error - no need to put a type here
            cell: ({ row }) => row.getValue("isActive") ? "Active" : "Inactive",
        },
    ]

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle>Contribution Tables</CardTitle>
                            <CardDescription>
                                Manage SSS, PhilHealth, and Pag-IBIG contribution tables
                            </CardDescription>
                        </div>
                        <Button onClick={() => setEditingTable("new")} className="gap-2">
                            <PlusCircle className="h-4 w-4" />
                            Add New Table
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <DataTable
                        columns={columns}
                        data={tables || []}
                        onRowClick={(table) => setEditingTable(table._id)}
                    />
                </CardContent>
            </Card>

            <EditContributionTableDialog
                open={!!editingTable}
                tableId={editingTable === "new" ? null : editingTable}
                onClose={() => setEditingTable(null)}
            />
        </div>
    )
}