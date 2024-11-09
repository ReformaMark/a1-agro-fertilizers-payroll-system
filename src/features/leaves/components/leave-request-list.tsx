"use client";

import { DataTable } from "@/components/data-table";

import { Badge } from "@/components/ui/badge";

import { Button } from "@/components/ui/button";

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Skeleton } from "@/components/ui/skeleton";

import { Textarea } from "@/components/ui/textarea";

import { useCurrentUser } from "@/hooks/use-current-user";

import { ColumnDef } from "@tanstack/react-table";

import { format } from "date-fns";

import {
    AlertCircle,
    Check,
    Download,
    MoreHorizontal,
    Plus,
    X,
    FileText,
} from "lucide-react";

import { useState } from "react";

import { toast } from "sonner";

import { Doc, Id } from "../../../../convex/_generated/dataModel";

import { useLeaveRequests, useUpdateLeaveRequestStatus } from "../api/leaves";

import { LeaveRequestForm } from "./leave-request-form";

import { downloadCSV } from "@/lib/export-utils";

interface LeaveRequestWithUser extends Doc<"leaveRequests"> {
    user: Doc<"users"> | null;
}

interface LeaveRequestListProps {
    filterStatus?: "Pending" | "Approved" | "Rejected";
}

interface ViewReasonDialogProps {
    isOpen: boolean;

    onClose: () => void;

    request: LeaveRequestWithUser;
}

function ViewReasonDialog({ isOpen, onClose, request }: ViewReasonDialogProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Leave Request Details</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="space-y-1">
                            <p className="text-muted-foreground">Employee</p>

                            <p className="font-medium">
                                {request.user
                                    ? `${request.user.firstName} ${request.user.lastName}`
                                    : "N/A"}
                            </p>
                        </div>

                        <div className="space-y-1">
                            <p className="text-muted-foreground">Leave Type</p>

                            <p className="font-medium">
                                <Badge variant="outline">{request.type}</Badge>
                            </p>
                        </div>

                        <div className="space-y-1">
                            <p className="text-muted-foreground">Start Date</p>

                            <p className="font-medium">
                                {format(new Date(request.startDate), "PPP")}
                            </p>
                        </div>

                        <div className="space-y-1">
                            <p className="text-muted-foreground">End Date</p>

                            <p className="font-medium">
                                {format(new Date(request.endDate), "PPP")}
                            </p>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">Reason</p>

                        <div className="rounded-lg border bg-muted/50 p-3">
                            <p className="text-sm whitespace-pre-wrap">{request.reason}</p>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

export function LeaveRequestList({ filterStatus }: LeaveRequestListProps) {
    const { data: currentUser } = useCurrentUser();

    const [showForm, setShowForm] = useState(false);

    const [showRejectDialog, setShowRejectDialog] = useState(false);

    const [selectedRequest, setSelectedRequest] =
        useState<LeaveRequestWithUser | null>(null);

    const [rejectionReason, setRejectionReason] = useState("");

    const [showRejectionReasonDialog, setShowRejectionReasonDialog] =
        useState(false);

    const [showReasonDialog, setShowReasonDialog] = useState(false);

    const isAdmin = currentUser?.role === "admin";

    const leaveRequests = useLeaveRequests(
        isAdmin ? undefined : currentUser?._id,

        filterStatus
    );

    const updateStatus = useUpdateLeaveRequestStatus();

    async function handleUpdateStatus(
        requestId: Id<"leaveRequests">,

        status: string,

        reason?: string
    ) {
        try {
            await updateStatus({
                requestId,

                status,

                rejectionReason: reason,
            });

            toast.success(`Leave request ${status.toLowerCase()} successfully`);

            setShowRejectDialog(false);

            setRejectionReason("");

            setSelectedRequest(null);
        } catch (error) {
            toast.error(`Failed to ${status.toLowerCase()} leave request`);

            console.error(error);
        }
    }

    const columns: ColumnDef<LeaveRequestWithUser>[] = [
        {
            accessorKey: "employeeName",
            accessorFn: (row) => row.user ? `${row.user.firstName} ${row.user.lastName}` : "N/A",
            header: "Employee",
            cell: ({ row }) => {
                const user = row.original.user;

                return user ? `${user.firstName} ${user.lastName}` : "N/A";
            },
        },
        {
            accessorKey: "type",
            header: "Leave Type",
            cell: ({ row }) => (
                <Badge variant="outline">{row.getValue("type")}</Badge>
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
            accessorKey: "reason",

            header: "Reason",

            cell: ({ row }) => {
                const reason = row.getValue<string>("reason");

                return (
                    <div className="max-w-[200px] truncate" title={reason}>
                        {reason || "No reason provided"}
                    </div>
                );
            },
        },

        {
            accessorKey: "status",

            header: "Status",

            cell: ({ row }) => {
                const status = row.getValue<string>("status");

                return (
                    <Badge
                        variant={
                            status === "Approved"
                                ? "default"
                                : status === "Rejected"
                                    ? "destructive"
                                    : "secondary"
                        }
                    >
                        {status}
                    </Badge>
                );
            },
        },

        {
            id: "actions",

            cell: ({ row }) => {
                const request = row.original;

                const isPending = request.status === "Pending";

                const isRejected = request.status === "Rejected";

                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent align="end">
                            <DropdownMenuItem
                                onClick={() => {
                                    setSelectedRequest(request);

                                    setShowReasonDialog(true);
                                }}
                            >
                                <FileText className="mr-2 h-4 w-4" />
                                View Details
                            </DropdownMenuItem>

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
                                            setSelectedRequest(request);

                                            setShowRejectDialog(true);
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
                );
            },
        },
    ];

    if (!leaveRequests) {
        return (
            <div className="space-y-4">
                <Skeleton className="h-20 w-full" />

                <Skeleton className="h-[400px] w-full" />
            </div>
        );
    }

    function formatLeaveDataForExport(data: LeaveRequestWithUser[]) {
        return data.map((request) => ({
            Employee: request.user
                ? `${request.user.firstName} ${request.user.lastName}`
                : "N/A",

            "Leave Type": request.type,

            "Start Date": format(new Date(request.startDate), "PPP"),

            "End Date": format(new Date(request.endDate), "PPP"),

            Reason: request.reason || "No reason provided",

            Status: request.status,

            "Created At": format(new Date(request._creationTime), "PPP"),

            "Rejection Reason": request.rejectionReason || "N/A",
        }));
    }

    return (
        <Card>
            <CardHeader className="border-b">
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle>Leave Requests</CardTitle>

                        <CardDescription>
                            {isAdmin
                                ? "Manage employee leave requests"
                                : "Submit and track your leave requests"}
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
                                if (!leaveRequests) return;

                                const exportData = formatLeaveDataForExport(leaveRequests);

                                downloadCSV(
                                    exportData,

                                    `leave-requests-${format(new Date(), "yyyy-MM-dd")}`
                                );
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
                    filter="employeeName"
                    filterLabel="requests by employee name"
                />

                {showForm && <LeaveRequestForm onClose={() => setShowForm(false)} />}

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
                                    setShowRejectDialog(false);

                                    setRejectionReason("");

                                    setSelectedRequest(null);
                                }}
                            >
                                Cancel
                            </Button>

                            <Button
                                variant="destructive"
                                onClick={() => {
                                    if (selectedRequest) {
                                        handleUpdateStatus(
                                            selectedRequest._id,

                                            "Rejected",

                                            rejectionReason
                                        );
                                    }
                                }}
                                disabled={!rejectionReason}
                            >
                                Reject Request
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                <Dialog
                    open={showRejectionReasonDialog}
                    onOpenChange={setShowRejectionReasonDialog}
                >
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

                {selectedRequest && (
                    <ViewReasonDialog
                        isOpen={showReasonDialog}
                        onClose={() => {
                            setShowReasonDialog(false);

                            setSelectedRequest(null);
                        }}
                        request={selectedRequest}
                    />
                )}
            </CardContent>
        </Card>
    );
}
