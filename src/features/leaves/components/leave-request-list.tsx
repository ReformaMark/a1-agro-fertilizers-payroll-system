"use client"

import { DataTable } from "@/components/data-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import { useCurrentUser } from "@/hooks/use-current-user"
import { ColumnDef } from "@tanstack/react-table"
import { format } from "date-fns"
import { AlertCircle, Check, Download, MoreHorizontal, Plus, X } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { Doc, Id } from "../../../../convex/_generated/dataModel"
import { useLeaveRequests, useUpdateLeaveRequestStatus } from "../api/leaves"
import { LeaveRequestForm } from "./leave-request-form"
import { downloadCSV } from "@/lib/export-utils"

interface LeaveRequestWithUser extends Doc<"leaveRequests"> {
    user: Doc<"users"> | null
}

interface LeaveRequestListProps {
    filterStatus?: 'Pending' | 'Approved' | 'Rejected'
}

export function LeaveRequestList({ filterStatus }: LeaveRequestListProps) {
    const { data: currentUser } = useCurrentUser()
    const [showForm, setShowForm] = useState(false)
    const [showRejectDialog, setShowRejectDialog] = useState(false)
    const [selectedRequest, setSelectedRequest] = useState<LeaveRequestWithUser | null>(null)
    const [rejectionReason, setRejectionReason] = useState("")
    const [showRejectionReasonDialog, setShowRejectionReasonDialog] = useState(false);
    const isAdmin = currentUser?.role === "admin"

    const leaveRequests = useLeaveRequests(
        isAdmin ? undefined : currentUser?._id,
        filterStatus
    )
    const updateStatus = useUpdateLeaveRequestStatus()

    async function handleUpdateStatus(requestId: Id<"leaveRequests">, status: string, reason?: string) {
        try {
            await updateStatus({
                requestId,
                status,
                rejectionReason: reason,
            })
            toast.success(`Leave request ${status.toLowerCase()} successfully`)
            setShowRejectDialog(false)
            setRejectionReason("")
            setSelectedRequest(null)
        } catch (error) {
            toast.error(`Failed to ${status.toLowerCase()} leave request`)
            console.error(error)
        }
    }

    const columns: ColumnDef<LeaveRequestWithUser>[] = [
        {
            accessorKey: "user",
            header: "Employee",
            cell: ({ row }) => {
                const user = row.original.user
                return user ? `${user.firstName} ${user.lastName}` : "N/A"
            },
        },
        {
            accessorKey: "type",
            header: "Leave Type",
            cell: ({ row }) => (
                <Badge variant="outline">
                    {row.getValue("type")}
                </Badge>
            ),
        },
        {
            accessorKey: "startDate",
            header: "Start Date",
            cell: ({ row }) => format(new Date(row.getValue("startDate")), "PPP"),
        },
        {
            accessorKey: "endDate",
            header: "End Date",
            cell: ({ row }) => format(new Date(row.getValue("endDate")), "PPP"),
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => {
                const status = row.getValue<string>("status")
                return (
                    <Badge variant={
                        status === "Approved" ? "default" :
                            status === "Rejected" ? "destructive" :
                                "secondary"
                    }>
                        {status}
                    </Badge>
                )
            },
        },
        {
            id: "actions",
            cell: ({ row }) => {
                const request = row.original
                const isPending = request.status === "Pending"
                const isRejected = request.status === "Rejected"

                // If there are no actions to show, return null
                if (!isAdmin && !isRejected && !isPending) return null

                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            {/* Admin-only actions */}
                            {isAdmin && isPending && (
                                <>
                                    <DropdownMenuItem
                                        onClick={() => handleUpdateStatus(request._id, "Approved")}
                                        className="text-green-600"
                                    >
                                        <Check className="mr-2 h-4 w-4" />
                                        Approve
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={() => {
                                            setSelectedRequest(request)
                                            setShowRejectDialog(true)
                                        }}
                                        className="text-destructive"
                                    >
                                        <X className="mr-2 h-4 w-4" />
                                        Reject
                                    </DropdownMenuItem>
                                </>
                            )}
                            {/* Show rejection reason to both admin and employees */}
                            {isRejected && (
                                <DropdownMenuItem
                                    onClick={() => {
                                        setSelectedRequest(request);
                                        setShowRejectionReasonDialog(true);
                                    }}
                                    className="text-destructive"
                                >
                                    <AlertCircle className="mr-2 h-4 w-4" />
                                    View Rejection Reason
                                </DropdownMenuItem>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                )
            },
        },
    ]

    if (!leaveRequests) {
        return (
            <div className="space-y-4">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-[400px] w-full" />
            </div>
        )
    }

    function formatLeaveDataForExport(data: LeaveRequestWithUser[]) {
        return data.map(request => ({
            Employee: request.user ? `${request.user.firstName} ${request.user.lastName}` : 'N/A',
            'Leave Type': request.type,
            'Start Date': format(new Date(request.startDate), "PPP"),
            'End Date': format(new Date(request.endDate), "PPP"),
            Status: request.status,
            'Created At': format(new Date(request._creationTime), "PPP"),
            'Rejection Reason': request.rejectionReason || 'N/A'
        }))
    }

    return (
        <Card>
            <CardHeader className="border-b">
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle>Leave Requests</CardTitle>
                        <CardDescription>
                            {isAdmin ? "Manage employee leave requests" : "Submit and track your leave requests"}
                        </CardDescription>
                    </div>
                    <div className="flex gap-2">
                        {!isAdmin && (
                            <Button onClick={() => setShowForm(true)}>
                                <Plus className="h-4 w-4 mr-1" />
                                Request Leave
                            </Button>
                        )}
                        <Button
                            variant="outline"
                            onClick={() => {
                                if (!leaveRequests) return
                                const exportData = formatLeaveDataForExport(leaveRequests)
                                downloadCSV(exportData, `leave-requests-${format(new Date(), "yyyy-MM-dd")}`)
                            }}
                        >
                            <Download className="h-4 w-4 mr-1" />
                            Export CSV
                        </Button>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="pt-6">
                <DataTable
                    columns={columns}
                    data={leaveRequests}
                    filter={isAdmin ? "user.firstName" : "type"}
                    filterLabel={isAdmin ? "Employee Name" : "Leave Type"}
                />

                {showForm && (
                    <LeaveRequestForm onClose={() => setShowForm(false)} />
                )}

                <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Reject Leave Request</DialogTitle>
                            <DialogDescription>
                                Please provide a reason for rejecting this leave request.
                            </DialogDescription>
                        </DialogHeader>
                        <Textarea
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            placeholder="Enter rejection reason"
                            className="min-h-[100px]"
                        />
                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setShowRejectDialog(false)
                                    setRejectionReason("")
                                    setSelectedRequest(null)
                                }}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={() => {
                                    if (selectedRequest) {
                                        handleUpdateStatus(selectedRequest._id, "Rejected", rejectionReason)
                                    }
                                }}
                                disabled={!rejectionReason}
                            >
                                Reject Request
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                <Dialog open={showRejectionReasonDialog} onOpenChange={setShowRejectionReasonDialog}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Rejection Reason</DialogTitle>
                        </DialogHeader>
                        {selectedRequest && (
                            <div className="space-y-4">
                                <div className="text-sm text-muted-foreground">
                                    <span className="font-medium text-foreground">Status:</span>{" "}
                                    <Badge variant="destructive">Rejected</Badge>
                                </div>
                                <div className="text-sm text-muted-foreground">
                                    <span className="font-medium text-foreground">Date:</span>{" "}
                                    {format(new Date(selectedRequest._creationTime), "PPP")}
                                </div>
                                <div className="space-y-2">
                                    <span className="text-sm font-medium">Reason:</span>
                                    <p className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
                                        {selectedRequest.rejectionReason}
                                    </p>
                                </div>
                            </div>
                        )}
                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setShowRejectionReasonDialog(false);
                                    setSelectedRequest(null);
                                }}
                            >
                                Close
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </CardContent>
        </Card>
    )
} 