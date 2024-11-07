"use client"

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { format } from "date-fns"
import { Download } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import * as XLSX from 'xlsx'

interface ExportCashAdvanceDialogProps {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: any[]
}

export function ExportCashAdvanceDialog({ data }: ExportCashAdvanceDialogProps) {
    const [open, setOpen] = useState(false)

    const handleExport = () => {
        try {
            const exportData = data.map(item => ({
                "Employee Name": `${item.user?.firstName} ${item.user?.lastName}`,
                "Type": item.type,
                "Amount": item.amount,
                "Payment Term": item.paymentTerm,
                "Status": item.status,
                "Date Requested": format(new Date(item.createdAt), "PPP"),
                "Last Modified": format(new Date(item.modifiedAt), "PPP"),
                "Rejection Reason": item.rejectionReason || "N/A"
            }))

            const ws = XLSX.utils.json_to_sheet(exportData)
            const wb = XLSX.utils.book_new()
            XLSX.utils.book_append_sheet(wb, ws, "Cash Advance Requests")

            // Generate filename with current date
            const fileName = `cash_advance_requests_${format(new Date(), "yyyy-MM-dd")}.xlsx`
            XLSX.writeFile(wb, fileName)

            toast.success("Export successful")

            setOpen(false)
        } catch (error) {
            console.error("Export failed:", error)
            toast.error("Export failed")
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <Button
                variant="outline"
                className="ml-auto"
                onClick={() => setOpen(true)}
            >
                <Download className="mr-2 h-4 w-4" />
                Export
            </Button>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Export Cash Advance Requests</DialogTitle>
                    <DialogDescription>
                        This will export all cash advance requests to an Excel file.
                    </DialogDescription>
                </DialogHeader>
                <div className="flex justify-end space-x-2">
                    <Button
                        variant="outline"
                        onClick={() => setOpen(false)}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleExport}
                    >
                        Export
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
} 