"use client";

import { DataTable } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import { AlertCircle, Check, MoreHorizontal, Wallet, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Doc, Id } from "../../../../../convex/_generated/dataModel";
import {
    useCompanyLoans,
    useGovernmentLoans,
    useUpdateLoanStatus,
} from "../api/loans";
import { LoanRequestForm } from "./loan-request-form";

import { Badge } from "@/components/ui/badge";
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
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useCurrentUser } from "@/hooks/use-current-user";
import { format } from "date-fns";

interface BaseLoanFields {
    _id: Id<"companyLoans" | "governmentLoans">;
    status: "Pending" | "Approved" | "Rejected";
    amount: number;
    amortization: number;
    totalAmount: number;
    rejectionReason?: string;
    createdAt: string;
    modifiedAt: string;
    userId: Id<"users">;
}

interface CompanyLoanDoc extends BaseLoanFields {
    _id: Id<"companyLoans">;
    type: "VALE" | "Partial A/R";
    remarks?: string;
}

interface GovernmentLoanDoc extends BaseLoanFields {
    _id: Id<"governmentLoans">;
    applicationType: string;
    applicationNo: string;
    startDate: string;
    monthlySchedule: string;
    additionalInfo?: string;
    status: "Pending" | "Approved" | "Rejected";
}

interface User extends Doc<"users"> {
    firstName: string;
    lastName: string;
    filledUpByAdmin?: boolean;
}

type CompanyLoanWithUser = CompanyLoanDoc & { user: User | null };

type GovernmentLoanWithUser = GovernmentLoanDoc & { user: User | null };

interface LoanRequestListProps {
    filterStatus?: string;
    showForm?: boolean;
    onCloseForm?: () => void;
}

export function LoanRequestList({
    filterStatus,
    showForm = false,
    onCloseForm,
}: LoanRequestListProps) {
    const { data: currentUser } = useCurrentUser();

    const [showRejectDialog, setShowRejectDialog] = useState(false);
    const [showRejectionReasonDialog, setShowRejectionReasonDialog] = useState(false);

    const [selectedLoan, setSelectedLoan] = useState<{
        loan: CompanyLoanWithUser | GovernmentLoanWithUser;
        type: "company" | "government";
    } | null>(null);

    const [rejectionReason, setRejectionReason] = useState("");

    const isAdmin = currentUser?.role === "admin";

    const companyLoans = useCompanyLoans(
        isAdmin ? undefined : currentUser?._id,
        filterStatus
    );

    const governmentLoans = useGovernmentLoans(
        isAdmin ? undefined : currentUser?._id,
        filterStatus
    );

    const updateStatus = useUpdateLoanStatus();

    async function handleUpdateStatus(
        loanId: Id<"companyLoans"> | Id<"governmentLoans">,
        loanType: "company" | "government",
        status: "Approved" | "Rejected",
        reason?: string
    ) {
        try {
            await updateStatus({
                loanId,
                loanType,
                status,
                rejectionReason: reason,
            });

            toast.success(`Loan request ${status.toLowerCase()} successfully`);
            setShowRejectDialog(false);
            setRejectionReason("");
            setSelectedLoan(null);
        } catch (error) {
            toast.error(`Failed to ${status.toLowerCase()} loan request`);
            console.error(error);
        }
    }

    const actionColumn = {
        id: "actions",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        cell: ({ row }: { row: any }) => {
            const loan = row.original as CompanyLoanWithUser | GovernmentLoanWithUser;
            const isPending = loan.status === "Pending";
            const loanType = "applicationType" in loan ? "government" : "company";

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
                                    onClick={() => handleUpdateStatus(loan._id, loanType, "Approved")}
                                    className="text-green-600"
                                >
                                    <Check className="mr-2 h-4 w-4" />
                                    Approve
                                </DropdownMenuItem>

                                <DropdownMenuItem 
                                    onClick={() => {
                                        setSelectedLoan({ loan, type: loanType });
                                        setShowRejectDialog(true);
                                    }}
                                    className="text-destructive"
                                >
                                    <X className="mr-2 h-4 w-4" />
                                    Reject
                                </DropdownMenuItem>
                            </>
                        )}
                        {loan.status === "Rejected" && loan.rejectionReason && (
                            <DropdownMenuItem 
                                onClick={() => {
                                    setSelectedLoan({ loan, type: loanType });
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
    }

    const companyLoanColumns: ColumnDef<CompanyLoanWithUser>[] = [
        {
            accessorKey: "user",
            header: "Employee",
            cell: ({ row }) => {
                const user = row.original.user;
                return user ? `${user.firstName} ${user.lastName}` : "N/A";
            },
        },
        {
            accessorKey: "type",
            header: "Loan Type",
            cell: ({ row }) => (
                <Badge variant="outline">{row.getValue("type")}</Badge>
            ),
        },
        {
            accessorKey: "amount",
            header: "Amount",
            cell: ({ row }) => `₱${row.getValue<number>("amount").toLocaleString()}`,
        },
        {
            accessorKey: "amortization",
            header: "Monthly Amortization",
            cell: ({ row }) =>
                `₱${row.getValue<number>("amortization").toLocaleString()}`,
        },
        {
            accessorKey: "totalAmount",
            header: "Total Amount",
            cell: ({ row }) =>
                `₱${row.getValue<number>("totalAmount").toLocaleString()}`,
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
        actionColumn,
    ];

    const governmentLoanColumns: ColumnDef<GovernmentLoanWithUser>[] = [
        {
            accessorKey: "user",
            header: "Employee",
            cell: ({ row }) => {
                const user = row.original.user;
                return user ? `${user.firstName} ${user.lastName}` : "N/A";
            },
        },
        {
            accessorKey: "applicationType",
            header: "Loan Type",
            cell: ({ row }) => (
                <Badge variant="outline">{row.getValue("applicationType")}</Badge>
            ),
        },
        {
            accessorKey: "applicationNo",
            header: "Application No.",
        },
        {
            accessorKey: "amount",
            header: "Amount",
            cell: ({ row }) => `₱${row.getValue<number>("amount").toLocaleString()}`,
        },
        {
            accessorKey: "amortization",
            header: "Monthly Amortization",
            cell: ({ row }) =>
                `₱${row.getValue<number>("amortization").toLocaleString()}`,
        },
        {
            accessorKey: "monthlySchedule",
            header: "Schedule",
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => {
                const status = row.getValue<"Pending" | "Approved" | "Rejected">("status");
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
        actionColumn,
    ];

    if (!companyLoans || !governmentLoans) {
        return (
            <div className="space-y-4">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-[400px] w-full" />
            </div>
        );
    }

    return (
        <Card>
            <CardHeader className="border-b">
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <Wallet className="h-5 w-5" />
                            Loan Requests
                        </CardTitle>
                        <CardDescription>
                            {isAdmin
                                ? "Manage employee loan requests"
                                : "Submit and track your loan requests"}
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="pt-6">
                <Tabs defaultValue="company" className="space-y-4">
                    <TabsList>
                        <TabsTrigger value="company">Company Loans</TabsTrigger>
                        <TabsTrigger value="government">Government Loans</TabsTrigger>
                    </TabsList>

                    <TabsContent value="company">
                        <DataTable
                            columns={companyLoanColumns}
                            data={companyLoans as CompanyLoanWithUser[]}
                            filter={isAdmin ? "user.firstName" : "type"}
                            filterLabel={isAdmin ? "Employee Name" : "Loan Type"}
                        />
                    </TabsContent>

                    <TabsContent value="government">
                        <DataTable
                            columns={governmentLoanColumns}
                            data={governmentLoans as GovernmentLoanWithUser[]}
                            filter={isAdmin ? "user.firstName" : "applicationType"}
                            filterLabel={isAdmin ? "Employee Name" : "Loan Type"}
                        />
                    </TabsContent>
                </Tabs>

                {showForm && <LoanRequestForm onClose={() => onCloseForm?.()} />}

                <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Reject Loan Request</DialogTitle>
                            <DialogDescription>
                                Please provide a reason for rejecting this loan request.
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
                                    setSelectedLoan(null)
                                }}
                            >
                                Cancel
                            </Button>

                            <Button
                                variant="destructive"
                                onClick={() => {
                                    if (selectedLoan) {
                                        handleUpdateStatus(
                                            selectedLoan.loan._id,
                                            selectedLoan.type,
                                            "Rejected",
                                            rejectionReason
                                        )
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
                        {selectedLoan?.loan && (
                            <div className="space-y-4">
                                <div className="text-sm text-muted-foreground">
                                    <span className="font-medium text-foreground">Status:</span>{" "}
                                    <Badge variant="destructive">Rejected</Badge>
                                </div>
                                <div className="text-sm text-muted-foreground">
                                    <span className="font-medium text-foreground">Date:</span>{" "}
                                    {format(new Date(selectedLoan.loan.modifiedAt), "PPP")}
                                </div>
                                <div className="space-y-2">
                                    <span className="text-sm font-medium">Reason:</span>
                                    <p className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
                                        {selectedLoan.loan.rejectionReason}
                                    </p>
                                </div>
                            </div>
                        )}
                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setShowRejectionReasonDialog(false);
                                    setSelectedLoan(null);
                                }}
                            >
                                Close
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </CardContent>
        </Card>
    );
}
