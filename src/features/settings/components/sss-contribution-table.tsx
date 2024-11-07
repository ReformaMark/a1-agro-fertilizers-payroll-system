"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { useState } from "react"
import { useMutation, useQuery as useConvexQuery, useQuery } from "convex/react"
import { api } from "../../../../convex/_generated/api"
import { toast } from "sonner"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Edit2 } from "lucide-react"
import { SSSRange, ContributionTable } from "@/lib/types"

function isSSSRange(range: any): range is SSSRange {
    return 'regularSS' in range
}

function isSSSTable(table: ContributionTable): table is ContributionTable & { ranges: SSSRange[] } {
    return table.type === "SSS" && table.ranges.length > 0 && isSSSRange(table.ranges[0])
}

export function SSSContributionTable() {
    const [bulkData, setBulkData] = useState("")
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const currentTable = useQuery(api.contributionTables.getCurrentSSS)
    const updateTable = useMutation(api.contributionTables.update)
    const createTable = useMutation(api.contributionTables.create)

    // Add query to get user info
    const lastModifiedBy = useConvexQuery(
        api.users.get, 
        currentTable?.modifiedBy ? {} : "skip"
    )

    const parseTableData = (data: string) => {
        try {
            // Split into lines and filter out empty lines
            const rows = data.trim().split('\n').filter(line => line.trim() !== '')
            
            return rows.map(row => {
                // Replace multiple spaces with a single space and split
                const cleanedRow = row.replace(/\s+/g, ' ').trim()
                const parts = cleanedRow.split(' ')
                
                // Parse range
                let rangeStart: number
                let rangeEnd: number
                let dataStartIndex: number

                if (parts[0].toLowerCase() === 'below') {
                    // Handle "Below X" case
                    rangeStart = 0
                    rangeEnd = parseFloat(parts[1].replace(/,/g, ''))
                    dataStartIndex = 2
                } else if (parts.includes('Over')) {
                    // Handle "X - Over" case
                    rangeStart = parseFloat(parts[0].replace(/,/g, ''))
                    rangeEnd = Number.MAX_SAFE_INTEGER // Use max number to represent "Over"
                    dataStartIndex = 3 // Skip "Over" part
                } else {
                    // Handle normal range "X - Y" case
                    const rangeEndIndex = parts.findIndex(p => p.includes('.99'))
                    if (rangeEndIndex === -1) {
                        throw new Error('Invalid range format')
                    }
                    rangeStart = parseFloat(parts[0].replace(/,/g, ''))
                    rangeEnd = parseFloat(parts[rangeEndIndex].replace(/,/g, ''))
                    dataStartIndex = rangeEndIndex + 1
                }

                // Helper function to parse values
                const parseValue = (value: string): number => {
                    if (!value || value === '-') return 0
                    return parseFloat(value.replace(/,/g, ''))
                }

                // Get the values after the range
                const values = parts.slice(dataStartIndex)

                // Map the values to their respective fields
                return {
                    rangeStart,
                    rangeEnd,
                    regularSS: parseValue(values[0]),
                    wisp: parseValue(values[1]),
                    totalMonthlySalaryCredit: parseValue(values[2]),
                    regularSSER: parseValue(values[3]),
                    regularSSEE: parseValue(values[4]),
                    regularSSTotal: parseValue(values[5]),
                    ecER: parseValue(values[6]),
                    ecEE: parseValue(values[7]),
                    ecTotal: parseValue(values[8]),
                    wispER: parseValue(values[9]),
                    wispEE: parseValue(values[10]),
                    wispTotal: parseValue(values[11]),
                    totalER: parseValue(values[12]),
                    totalEE: parseValue(values[13]),
                    grandTotal: parseValue(values[14])
                }
            })
        } catch (error) {
            console.error('Error parsing table data:', error)
            throw new Error('Invalid table format. Please ensure you are copying the data correctly from the SSS table.')
        }
    }

    // Helper function to format numbers
    const formatValue = (value: number) => {
        if (value === 0) return '-'
        return value.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })
    }

    // Helper function to format range
    const formatRange = (range: { rangeStart: number, rangeEnd: number }) => {
        if (range.rangeStart === 0) {
            return `Below ${range.rangeEnd.toLocaleString()}`
        }
        if (range.rangeEnd === Number.MAX_SAFE_INTEGER) {
            return `${range.rangeStart.toLocaleString()} - Over`
        }
        return `${range.rangeStart.toLocaleString()} - ${range.rangeEnd.toLocaleString()}`
    }

    const handleUpdateTable = async () => {
        try {
            console.log('Input data:', bulkData) // Debug log
            const ranges = parseTableData(bulkData)
            console.log('Parsed ranges:', ranges) // Debug log

            const tableData = {
                type: "SSS",
                effectiveDate: new Date().toISOString(),
                ranges,
                isActive: true
            }

            if (currentTable) {
                await updateTable({
                    id: currentTable._id,
                    ...tableData
                })
            } else {
                await createTable(tableData)
            }

            toast.success("SSS contribution table updated successfully")
        } catch (error) {
            console.error('Update error:', error) // Debug log
            toast.error(error instanceof Error ? error.message : "Failed to update table")
        }
    }

    // Helper function to format date and time
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

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex justify-between items-center">
                    <span>SSS Contribution Table</span>
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
                        <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => setIsEditModalOpen(true)}
                            className="gap-2"
                        >
                            <Edit2 className="h-4 w-4" />
                            Edit Table
                        </Button>
                    </div>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm border-collapse">
                        <thead>
                            <tr>
                                <th rowSpan={3} className="border bg-blue-900 text-white p-2 text-center">
                                    RANGE OF COMPENSATION
                                </th>
                                <th colSpan={3} className="border bg-blue-900 text-white p-2 text-center">
                                    MONTHLY SALARY CREDIT
                                </th>
                                <th colSpan={12} className="border bg-blue-900 text-white p-2 text-center">
                                    AMOUNT OF CONTRIBUTIONS
                                </th>
                            </tr>
                            <tr className="border bg-blue-900 text-white text-center">
                                {/* Monthly Salary Credit columns */}
                                <th className="border p-2">
                                    REGULAR SS
                                </th>
                                <th rowSpan={2} className="border p-2">WISP</th>
                                <th rowSpan={2} className="border p-2">TOTAL</th>
                                
                                {/* Regular SS */}
                                <th colSpan={3} className="border p-2">
                                    REGULAR SS
                                </th>
                                
                                {/* EC */}
                                <th colSpan={3} className="border p-2">
                                    EC
                                </th>
                                
                                {/* WISP */}
                                <th colSpan={3} className="border p-2">
                                    WISP
                                </th>
                                
                                {/* Total */}
                                <th colSpan={3} className="border p-2">
                                    TOTAL
                                </th>
                            </tr>
                            <tr className="border bg-blue-900 text-white text-center">
                                {/* Under REGULAR SS in Monthly Salary Credit */}
                                <th className="border p-2">EC</th>

                                {/* Under REGULAR SS in Amount of Contributions */}
                                <th className="border p-2">ER</th>
                                <th className="border p-2">EE</th>
                                <th className="border p-2">TOTAL</th>

                                {/* Under EC */}
                                <th className="border p-2">ER</th>
                                <th className="border p-2">EE</th>
                                <th className="border p-2">TOTAL</th>

                                {/* Under WISP */}
                                <th className="border p-2">ER</th>
                                <th className="border p-2">EE</th>
                                <th className="border p-2">TOTAL</th>

                                {/* Under Total */}
                                <th className="border p-2">ER</th>
                                <th className="border p-2">EE</th>
                                <th className="border p-2">TOTAL</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentTable && isSSSTable(currentTable) && currentTable.ranges.map((range, i) => (
                                <tr key={i} className="border hover:bg-gray-50">
                                    <td className="border p-2">
                                        {formatRange(range)}
                                    </td>
                                    <td className="border p-2 text-right">{formatValue(range.regularSS)}</td>
                                    <td className="border p-2 text-right">{formatValue(range.wisp)}</td>
                                    <td className="border p-2 text-right">{formatValue(range.totalMonthlySalaryCredit)}</td>
                                    <td className="border p-2 text-right">{formatValue(range.regularSSER)}</td>
                                    <td className="border p-2 text-right">{formatValue(range.regularSSEE)}</td>
                                    <td className="border p-2 text-right">{formatValue(range.regularSSTotal)}</td>
                                    <td className="border p-2 text-right">{formatValue(range.ecER)}</td>
                                    <td className="border p-2 text-right">{formatValue(range.ecEE)}</td>
                                    <td className="border p-2 text-right">{formatValue(range.ecTotal)}</td>
                                    <td className="border p-2 text-right">{formatValue(range.wispER)}</td>
                                    <td className="border p-2 text-right">{formatValue(range.wispEE)}</td>
                                    <td className="border p-2 text-right">{formatValue(range.wispTotal)}</td>
                                    <td className="border p-2 text-right">{formatValue(range.totalER)}</td>
                                    <td className="border p-2 text-right">{formatValue(range.totalEE)}</td>
                                    <td className="border p-2 text-right">{formatValue(range.grandTotal)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Edit Modal */}
                <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                    <DialogContent className="max-w-4xl">
                        <DialogHeader>
                            <DialogTitle>Edit SSS Contribution Table</DialogTitle>
                        </DialogHeader>
                        
                        <div className="space-y-4">
                            <div className="text-sm text-muted-foreground mb-2">
                                <p>Instructions:</p>
                                <ul className="list-disc list-inside">
                                    <li>Copy the data directly from the SSS contribution table PDF</li>
                                    <li>Include only the data rows (exclude headers)</li>
                                    <li>Each row should contain the range and all corresponding values</li>
                                    <li>Maintain the original format with dashes (-) for zero values</li>
                                </ul>
                            </div>

                            <Textarea
                                placeholder="Paste your SSS contribution table data here..."
                                value={bulkData}
                                onChange={(e) => setBulkData(e.target.value)}
                                rows={15}
                                className="font-mono"
                            />

                            <div className="flex justify-end gap-2">
                                <Button 
                                    variant="outline" 
                                    onClick={() => {
                                        setBulkData("")
                                        setIsEditModalOpen(false)
                                    }}
                                >
                                    Cancel
                                </Button>
                                <Button 
                                    onClick={async () => {
                                        await handleUpdateTable()
                                        setIsEditModalOpen(false)
                                        setBulkData("")
                                    }}
                                >
                                    Update Table
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </CardContent>
        </Card>
    )
}
