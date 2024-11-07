"use client"

import { DataTable } from "@/components/data-table"
import { Button } from "@/components/ui/button"
import { ColumnDef } from "@tanstack/react-table"
import { Doc, Id } from "../../../../convex/_generated/dataModel"
import { useState } from "react"
import { useBenefitRequests, useUpdateBenefitRequestStatus } from "../api/benefits"
import { toast } from "sonner"
import { Plus, MoreHorizontal, Check, X } from "lucide-react"
import { BenefitRequestForm } from "./benefit-request-form"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { useCurrentUser } from "@/hooks/use-current-user"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"

interface BenefitRequestWithUser extends Doc<"benefitRequests"> {
    user: Doc<"users"> | null
}

interface BenefitRequestListProps {
    filterStatus?: string;
}

export function BenefitRequestList({ filterStatus }: BenefitRequestListProps) {
    const { data: currentUser } = useCurrentUser()
    const [showForm, setShowForm] = useState(false)
    const [showRejectDialog, setShowRejectDialog] = useState(false)
    const [selectedRequest, setSelectedRequest] = useState<BenefitRequestWithUser | null>(null)
    const [rejectionReason, setRejectionReason] = useState("")
    const isAdmin = currentUser?.role === "admin"

    const benefitRequests = useBenefitRequests(
        isAdmin ? undefined : currentUser?._id,
        filterStatus
    )
    const updateStatus = useUpdateBenefitRequestStatus()

    async function handleUpdateStatus(requestId: Id<"benefitRequests">, status: string, reason?: string) {
        try {
            await updateStatus({
                requestId,
                status,
                rejectionReason: reason,
            })
            toast.success(`Benefit request ${status.toLowerCase()} successfully`)
            setShowRejectDialog(false)
            setRejectionReason("")
            setSelectedRequest(null)
        } catch (error) {
            console.error(error)
            toast.error(`Failed to ${status.toLowerCase()} benefit request`)
        }
    }

    const columns: ColumnDef<BenefitRequestWithUser>[] = [
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
            header: "Benefit Type",
            cell: ({ row }) => (
                <Badge variant="outline">
                    {row.getValue("type")}
                </Badge>
            ),
        },
        {
            accessorKey: "amount",
            header: "Amount",
            cell: ({ row }) => {
                const amount = row.getValue<number | undefined>("amount")
                return amount ? `₱${amount.toLocaleString()}` : "N/A"
            },
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => {
                const status = row.getValue<string>("status")
                return (
                    <Badge
                        variant="secondary"
                        className={status === "Approved" ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300" : ""}
                    >
                        {status}
                    </Badge>
                )
            },
        },
        {
            accessorKey: "createdAt",
            header: "Requested On",
            cell: ({ row }) => format(new Date(row.getValue("createdAt")), "PPP"),
        },
        {
            id: "actions",
            cell: ({ row }) => {
                const request = row.original
                const isPending = request.status === "Pending"

                if (!isAdmin && request.status !== "Pending") return null

                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
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
                            {request.description && (
                                <>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem className="flex flex-col items-start">
                                        <span className="font-medium mb-1">Description:</span>
                                        <span className="text-sm text-muted-foreground">
                                            {request.description}
                                        </span>
                                    </DropdownMenuItem>
                                </>
                            )}
                            {request.rejectionReason && (
                                <>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem className="flex flex-col items-start">
                                        <span className="font-medium mb-1">Rejection Reason:</span>
                                        <span className="text-sm text-muted-foreground">
                                            {request.rejectionReason}
                                        </span>
                                    </DropdownMenuItem>
                                </>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                )
            },
        },
    ]

    if (!benefitRequests) {
        return (
            <div className="space-y-4">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-[400px] w-full" />
            </div>
        )
    }

    return (
        <Card>
            <CardHeader className="border-b">
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle>Benefit Requests</CardTitle>
                        <CardDescription>
                            {isAdmin ? "Manage employee benefit requests" : "Submit and track your benefit requests"}
                        </CardDescription>
                    </div>
                    {!isAdmin && (
                        <Button onClick={() => setShowForm(true)}>
                            <Plus className="h-4 w-4 mr-1" />
                            Request Benefit
                        </Button>
                    )}
                </div>
            </CardHeader>

            <CardContent className="pt-6">
                <DataTable
                    columns={columns}
                    data={benefitRequests}
                    filter={isAdmin ? "user.firstName" : "type"}
                    filterLabel={isAdmin ? "Employee Name" : "Benefit Type"}
                />

                {showForm && (
                    <BenefitRequestForm onClose={() => setShowForm(false)} />
                )}

                <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Reject Benefit Request</DialogTitle>
                            <DialogDescription>
                                Please provide a reason for rejecting this benefit request.
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
            </CardContent>
        </Card>
    )
} 