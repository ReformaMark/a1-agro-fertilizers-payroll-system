"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Download } from "lucide-react"
import { exportToExcel, formatLoanDataForExport } from "@/lib/export-utils"

interface ExportLoanDialogProps {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    loans: any[]
    type: 'company' | 'government'
}

export function ExportLoanDialog({ loans, type }: ExportLoanDialogProps) {
    const [status, setStatus] = useState<string>('all')
    const [dateRange, setDateRange] = useState<string>('all')

    function handleExport() {
        let filteredLoans = [...loans]

        // Filter by status
        if (status !== 'all') {
            filteredLoans = filteredLoans.filter(loan => loan.status === status)
        }

        // Filter by date range
        if (dateRange !== 'all') {
            const now = new Date()
            const startDate = new Date()
            
            switch (dateRange) {
                case 'week':
                    startDate.setDate(now.getDate() - 7)
                    break
                case 'month':
                    startDate.setMonth(now.getMonth() - 1)
                    break
                case 'quarter':
                    startDate.setMonth(now.getMonth() - 3)
                    break
                case 'year':
                    startDate.setFullYear(now.getFullYear() - 1)
                    break
            }

            filteredLoans = filteredLoans.filter(loan => 
                new Date(loan.createdAt) >= startDate
            )
        }

        const formattedData = formatLoanDataForExport(filteredLoans, type)
        exportToExcel(formattedData, {
            fileName: `${type}-loans-${status}-${dateRange}-${new Date().toISOString().split('T')[0]}`,
            sheetName: `${type} Loans`
        })
    }

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    Export {type === 'company' ? 'Company' : 'Government'} Loans
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Export {type === 'company' ? 'Company' : 'Government'} Loans</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label>Status</Label>
                        <Select value={status} onValueChange={setStatus}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Statuses</SelectItem>
                                <SelectItem value="Pending">Pending</SelectItem>
                                <SelectItem value="Approved">Approved</SelectItem>
                                <SelectItem value="Rejected">Rejected</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Date Range</Label>
                        <Select value={dateRange} onValueChange={setDateRange}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select date range" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Time</SelectItem>
                                <SelectItem value="week">Last Week</SelectItem>
                                <SelectItem value="month">Last Month</SelectItem>
                                <SelectItem value="quarter">Last Quarter</SelectItem>
                                <SelectItem value="year">Last Year</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <Button onClick={handleExport} className="w-full">
                        Export Data
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
} 