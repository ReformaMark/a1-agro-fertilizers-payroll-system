"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ContributionTable, PhilHealthRange } from "@/lib/types"
import { useMutation, useQuery } from "convex/react"
import { Edit2, Save, X } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { api } from "../../../../convex/_generated/api"

const DEFAULT_RANGE: PhilHealthRange = {
    yearStart: 2024,
    yearEnd: 2025,
    basicSalary: {
        from: 0,
        to: null // No upper limit
    },
    premiumRate: 5.0, // Current 5% rate
    monthlyPremium: 0, // Will be calculated based on salary
    employeeShare: 0, // Will be calculated
    employerShare: 0 // Will be calculated
}

function isPhilHealthTable(table: ContributionTable): table is ContributionTable & { ranges: PhilHealthRange[] } {
    return table.type === "PHILHEALTH" && table.ranges.length > 0
}

export function PhilHealthContributionTable() {
    const [isEditing, setIsEditing] = useState(false)
    const [editedRange, setEditedRange] = useState<PhilHealthRange>(DEFAULT_RANGE)

    const currentTable = useQuery(api.contributionTables.getCurrentPhilhealth)
    const updateTable = useMutation(api.contributionTables.updatePhilHealth)
    const createTable = useMutation(api.contributionTables.createPhilHealth)

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
        if (currentTable && isPhilHealthTable(currentTable)) {
            setEditedRange(currentTable.ranges[0])
        }
        setIsEditing(true)
    }

    const handleSave = async () => {
        try {
            if (currentTable) {
                await updateTable({
                    id: currentTable._id,
                    effectiveDate: currentTable.effectiveDate,
                    ranges: [editedRange],
                    isActive: true
                })
            } else {
                await createTable({
                    effectiveDate: new Date().toISOString(),
                    ranges: [editedRange],
                    isActive: true
                })
            }
            setIsEditing(false)
            toast.success("PhilHealth contribution table updated successfully")
        } catch (error) {
            console.error('Update error:', error)
            toast.error("Failed to update table")
        }
    }

    const handleCancel = () => {
        if (currentTable && isPhilHealthTable(currentTable)) {
            setEditedRange(currentTable.ranges[0])
        } else {
            setEditedRange(DEFAULT_RANGE)
        }
        setIsEditing(false)
    }

    const handlePremiumRateChange = (value: string) => {
        const newRate = parseFloat(value)
        setEditedRange(prev => ({
            ...prev,
            premiumRate: newRate
        }))
    }

    const range = currentTable && isPhilHealthTable(currentTable) ?
        currentTable.ranges[0] : DEFAULT_RANGE

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex justify-between items-center">
                    <span>PhilHealth Contribution Table ({range.yearStart}-{range.yearEnd})</span>
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
                                <th className="border bg-blue-900 text-white p-2 text-center">
                                    Premium Rate (%)
                                </th>
                                <th className="border bg-blue-900 text-white p-2 text-center">
                                    Employee Share
                                </th>
                                <th className="border bg-blue-900 text-white p-2 text-center">
                                    Employer Share
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="border hover:bg-gray-50">
                                <td className="border p-2 text-center">
                                    {isEditing ? (
                                        <Input
                                            type="number"
                                            step="0.1"
                                            value={editedRange.premiumRate}
                                            onChange={(e) => handlePremiumRateChange(e.target.value)}
                                            className="w-32 mx-auto text-center"
                                        />
                                    ) : (
                                        `${range.premiumRate}%`
                                    )}
                                </td>
                                <td className="border p-2 text-center">50%</td>
                                <td className="border p-2 text-center">50%</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div className="text-sm text-muted-foreground">
                    <p>Note: The monthly premium is computed as {range.premiumRate}% of the employee&apos;s basic monthly salary.
                        The premium is shared equally (50-50) between the employee and the employer.
                        For example, if an employee&apos;s monthly salary is ₱20,000, the total monthly premium would be ₱1,000
                        (₱500 each for employee and employer share).</p>
                </div>
            </CardContent>
        </Card>
    )
} 