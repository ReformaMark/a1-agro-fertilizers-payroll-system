"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ContributionTable, PagibigRange } from "@/lib/types"
import { useMutation, useQuery } from "convex/react"
import { Edit2, Save, X } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { api } from "../../../../convex/_generated/api"

const DEFAULT_RANGES: PagibigRange[] = [
    {
        rangeStart: 0,
        rangeEnd: 1500,
        description: "₱1,500 and below",
        employeeRate: 0.01, // 1%
        employerRate: 0.02,  // 2%
        maxLimit: 0 // No max limit for this range
    },
    {
        rangeStart: 1500,
        rangeEnd: Number.MAX_SAFE_INTEGER,
        description: "Over ₱1,500",
        employeeRate: 0.02, // 2%
        employerRate: 0.02,  // 2%
        maxLimit: 5000 // Maximum contribution base
    }
]

function isPagibigTable(table: ContributionTable): table is ContributionTable & { ranges: PagibigRange[] } {
    return table.type === "PAGIBIG" && table.ranges.length > 0
}

export function PagibigContributionTable() {
    const [isEditing, setIsEditing] = useState(false)
    const [editedRanges, setEditedRanges] = useState<PagibigRange[]>(DEFAULT_RANGES)

    const currentTable = useQuery(api.contributionTables.getCurrentPagibig)
    const updateTable = useMutation(api.contributionTables.updatePagibig)
    const createTable = useMutation(api.contributionTables.createPagibig)

    const lastModifiedBy = useQuery(api.users.get)

    const formatDateTime = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        })
    }

    const handleEdit = () => {
        if (currentTable && isPagibigTable(currentTable)) {
            setEditedRanges(currentTable.ranges)
        }
        setIsEditing(true)
    }

    const handleSave = async () => {
        try {
            if (currentTable) {
                await updateTable({
                    id: currentTable._id,
                    effectiveDate: currentTable.effectiveDate,
                    ranges: editedRanges,
                    isActive: true
                })
            } else {
                await createTable({
                    effectiveDate: new Date().toISOString(),
                    ranges: editedRanges,
                    isActive: true
                })
            }
            setIsEditing(false)
            toast.success("Pag-IBIG contribution table updated successfully")
        } catch (error) {
            console.error('Update error:', error)
            toast.error("Failed to update table")
        }
    }

    const handleCancel = () => {
        if (currentTable && isPagibigTable(currentTable)) {
            setEditedRanges(currentTable.ranges)
        } else {
            setEditedRanges(DEFAULT_RANGES)
        }
        setIsEditing(false)
    }

    const handleChange = (index: number, field: keyof PagibigRange, value: string) => {
        const newRanges = [...editedRanges]
        if (field === 'employeeRate' || field === 'employerRate') {
            // Convert percentage input to decimal (e.g., 2% -> 0.02)
            newRanges[index][field] = parseFloat(value) / 100
        } else if (field === 'maxLimit' || field === 'rangeEnd' || field === 'rangeStart') {
            // Handle numeric fields
            const numValue = parseFloat(value)
            newRanges[index][field] = numValue

            // Update descriptions and linked values
            if (index === 0) {
                newRanges[index].description = `₱${numValue.toLocaleString()} and below`
                newRanges[1].rangeStart = numValue
                newRanges[1].description = `Over ₱${numValue.toLocaleString()}`
            } else if (index === 1) {
                newRanges[index].description = `Over ₱${numValue.toLocaleString()}`
                newRanges[0].rangeEnd = numValue
                newRanges[0].description = `₱${numValue.toLocaleString()} and below`
            }
        } else {
            newRanges[index][field] = value
        }
        setEditedRanges(newRanges)
    }

    const ranges = isEditing ? editedRanges :
        (currentTable && isPagibigTable(currentTable) ? currentTable.ranges : DEFAULT_RANGES)

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex justify-between items-center">
                    <span>Pag-IBIG Contribution Table</span>
                    <div className="flex items-center gap-4">
                        <div className="text-sm font-normal text-muted-foreground text-right">
                            <div>
                                Last Updated: {currentTable?.modifiedAt
                                    ? formatDateTime(currentTable.modifiedAt)
                                    : 'Never'}
                            </div>
                            {lastModifiedBy && (
                                <div className="text-xs">
                                    by {lastModifiedBy.firstName} {lastModifiedBy.lastName}
                                </div>
                            )}
                        </div>
                        {isEditing ? (
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleCancel}
                                    className="gap-2"
                                >
                                    <X className="h-4 w-4" />
                                    Cancel
                                </Button>
                                <Button
                                    variant="default"
                                    size="sm"
                                    onClick={handleSave}
                                    className="gap-2"
                                >
                                    <Save className="h-4 w-4" />
                                    Save
                                </Button>
                            </div>
                        ) : (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleEdit}
                                className="gap-2"
                            >
                                <Edit2 className="h-4 w-4" />
                                Edit Table
                            </Button>
                        )}
                    </div>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm border-collapse">
                        <thead>
                            <tr>
                                <th rowSpan={2} className="border bg-blue-900 text-white p-2 text-center">
                                    MONTHLY COMPENSATION
                                </th>
                                <th colSpan={2} className="border bg-blue-900 text-white p-2 text-center">
                                    CONTRIBUTION RATE
                                </th>
                                <th rowSpan={2} className="border bg-blue-900 text-white p-2 text-center">
                                    MAX CONTRIBUTION BASE
                                </th>
                            </tr>
                            <tr className="border bg-blue-900 text-white text-center">
                                <th className="border p-2">Employee</th>
                                <th className="border p-2">Employer (If any)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {ranges.map((range, index) => (
                                <tr key={index} className="border hover:bg-gray-50">
                                    <td className="border p-2">
                                        {isEditing ? (
                                            <div className="flex items-center gap-2">
                                                {index === 0 ? (
                                                    <>
                                                        <span>Below ₱</span>
                                                        <Input
                                                            type="number"
                                                            value={range.rangeEnd}
                                                            onChange={(e) => handleChange(index, 'rangeEnd', e.target.value)}
                                                            className="w-32"
                                                        />
                                                    </>
                                                ) : (
                                                    <>
                                                        <span>Over ₱</span>
                                                        <Input
                                                            type="number"
                                                            value={range.rangeStart}
                                                            onChange={(e) => handleChange(index, 'rangeStart', e.target.value)}
                                                            className="w-32"
                                                        />
                                                    </>
                                                )}
                                            </div>
                                        ) : (
                                            range.description
                                        )}
                                    </td>
                                    <td className="border p-2 text-right">
                                        {isEditing ? (
                                            <Input
                                                type="number"
                                                step="0.1"
                                                value={(range.employeeRate * 100).toFixed(1)}
                                                onChange={(e) => handleChange(index, 'employeeRate', e.target.value)}
                                                className="w-full text-right"
                                            />
                                        ) : (
                                            `${(range.employeeRate * 100).toFixed(1)}%`
                                        )}
                                    </td>
                                    <td className="border p-2 text-right">
                                        {isEditing ? (
                                            <Input
                                                type="number"
                                                step="0.1"
                                                value={(range.employerRate * 100).toFixed(1)}
                                                onChange={(e) => handleChange(index, 'employerRate', e.target.value)}
                                                className="w-full text-right"
                                            />
                                        ) : (
                                            `${(range.employerRate * 100).toFixed(1)}%`
                                        )}
                                    </td>
                                    <td className="border p-2 text-right">
                                        {index === 1 ? ( // Only show max limit for "Over" row
                                            isEditing ? (
                                                <Input
                                                    type="number"
                                                    value={range.maxLimit}
                                                    onChange={(e) => handleChange(index, 'maxLimit', e.target.value)}
                                                    className="w-full text-right"
                                                />
                                            ) : (
                                                `₱${range.maxLimit.toLocaleString()}`
                                            )
                                        ) : (
                                            "-"
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Update note about maximum contribution */}
                <div className="text-sm text-muted-foreground">
                    <p>Note: For monthly compensation over ₱1,500, the maximum monthly compensation used for computing contributions
                        is capped at the Max Contribution Base amount. For salaries exceeding this amount, the contribution will be
                        based on the maximum limit.</p>
                </div>
            </CardContent>
        </Card>
    )
} 