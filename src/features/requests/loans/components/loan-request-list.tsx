"use client";

import { DataTable } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import { AlertCircle, Check, CreditCardIcon, FileText, MoreHorizontal, Wallet, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Doc, Id } from "../../../../../convex/_generated/dataModel";
import {
    useCompanyLoans,
    useGovernmentLoans,
    useUpdateLoanStatus,
} from "../api/loans";

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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useCurrentUser } from "@/hooks/use-current-user";
import { getConvexErrorMessage } from "@/lib/utils";
import { useMutation } from "convex/react";
import { format } from "date-fns";
import { api } from "../../../../../convex/_generated/api";
import { IssueGovernmentLoanForm } from "./issue-government-loan-form";
import { LoanRequestForm } from "./loan-request-form";

interface BaseLoanFields {
    _id: Id<"companyLoans" | "governmentLoans">;
    status: "Pending" | "Approved" | "Rejected";
    amount: number;
    amortization: number;
    totalAmount: number;
    rejectionReason?: string;
    createdAt: string;
    modifiedAt: string;
    totalPaid?: number;
    remainingBalance?: number;
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

// Add this type to handle both loan types for rejection/status updates
type SelectedLoanType = {
    loan: CompanyLoanWithUser | GovernmentLoanWithUser;
    type: "company" | "government";
} | null;

export function LoanRequestList({
    filterStatus,
    showForm = false,
    onCloseForm,
}: LoanRequestListProps) {
    const { data: currentUser } = useCurrentUser();

    const [showRejectDialog, setShowRejectDialog] = useState(false);
    const [showRejectionReasonDialog, setShowRejectionReasonDialog] = useState(false);
    const [showPaymentDialog, setShowPaymentDialog] = useState(false);
    const [paymentAmount, setPaymentAmount] = useState("");
    const [selectedLoan, setSelectedLoan] = useState<SelectedLoanType>(null);
    const [selectedCompanyLoan, setSelectedCompanyLoan] = useState<CompanyLoanWithUser | null>(null);
    const [showIssueForm, setShowIssueForm] = useState(false)
    const [showCompanyLoanForm, setShowCompanyLoanForm] = useState(false)
    const [showCompanyDetailsDialog, setShowCompanyDetailsDialog] = useState(false);
    const [showGovernmentDetailsDialog, setShowGovernmentDetailsDialog] = useState(false);

    useEffect(() => {
        if (showForm) {
            setShowCompanyLoanForm(true)
        }
    }, [showForm])


    const addPayment = useMutation(api.loans.addCompanyLoanPayment);

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

    async function handleAddPayment(loanId: Id<"companyLoans">, amount: number) {
        try {
            await addPayment({
                loanId,
                amount,
            });
            toast.success("Payment added successfully");
            setShowPaymentDialog(false);
            setPaymentAmount("");
            setSelectedLoan(null);
        } catch (error) {
            toast.error(getConvexErrorMessage(error as Error));
        }
    }

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

    const companyActionColumn = {
        id: "actions",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        cell: ({ row }: { row: any }) => {
            const loan = row.original as CompanyLoanWithUser;
            const isPending = loan.status === "Pending";
            const isApproved = loan.status === "Approved";

            return (
                <>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent align="end">
                            <DropdownMenuItem
                                onClick={() => setShowCompanyDetailsDialog(true)}
                            >
                                <FileText className="mr-2 h-4 w-4" />
                                View Details
                            </DropdownMenuItem>

                            {isAdmin && isPending && (
                                <>
                                    <DropdownMenuItem
                                        onClick={() => handleUpdateStatus(loan._id, "company", "Approved")}
                                        className="text-green-600"
                                    >
                                        <Check className="mr-2 h-4 w-4" />
                                        Approve
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={() => {
                                            setSelectedLoan({ loan, type: "company" });
                                            setShowRejectDialog(true);
                                        }}
                                        className="text-destructive"
                                    >
                                        <X className="mr-2 h-4 w-4" />
                                        Reject
                                    </DropdownMenuItem>
                                </>
                            )}
                            {isAdmin && isApproved && (
                                <DropdownMenuItem
                                    onClick={() => {
                                        setSelectedCompanyLoan(loan);
                                        setShowPaymentDialog(true);
                                    }}
                                >
                                    <CreditCardIcon className="mr-2 h-4 w-4" />
                                    Add Payment
                                </DropdownMenuItem>
                            )}
                            {loan.status === "Rejected" && loan.rejectionReason && (
                                <DropdownMenuItem
                                    onClick={() => {
                                        setSelectedLoan({ loan, type: "company" });
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

                    <Dialog open={showCompanyDetailsDialog} onOpenChange={setShowCompanyDetailsDialog}>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Loan Request Details</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label>Type</Label>
                                        <div className="text-sm">{loan.type}</div>
                                    </div>
                                    <div>
                                        <Label>Status</Label>
                                        <div className="text-sm">{loan.status}</div>
                                    </div>
                                    <div>
                                        <Label>Amount</Label>
                                        <div className="text-sm">₱{loan.amount.toLocaleString()}</div>
                                    </div>
                                    <div>
                                        <Label>Total Amount</Label>
                                        <div className="text-sm">₱{loan.totalAmount.toLocaleString()}</div>
                                    </div>
                                    <div>
                                        <Label>Amortization</Label>
                                        <div className="text-sm">₱{loan.amortization.toLocaleString()}</div>
                                    </div>
                                    {loan.remarks && (
                                        <div className="col-span-2">
                                            <Label>Remarks</Label>
                                            <div className="text-sm">{loan.remarks}</div>
                                        </div>
                                    )}
                                    <div>
                                        <Label>Date Requested</Label>
                                        <div className="text-sm">{format(new Date(loan.createdAt), 'PPP')}</div>
                                    </div>
                                    <div>
                                        <Label>Last Modified</Label>
                                        <div className="text-sm">{format(new Date(loan.modifiedAt), 'PPP')}</div>
                                    </div>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>
                </>
            );
        },
    };

    const governmentActionColumn = {
        id: "actions",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        cell: ({ row }: { row: any }) => {
            const loan = row.original as GovernmentLoanWithUser;
            const isPending = loan.status === "Pending";

            return (
                <>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent align="end">
                            <DropdownMenuItem
                                onClick={() => setShowGovernmentDetailsDialog(true)}
                            >
                                <FileText className="mr-2 h-4 w-4" />
                                View Details
                            </DropdownMenuItem>

                            {isAdmin && isPending && (
                                <>
                                    <DropdownMenuItem
                                        onClick={() => handleUpdateStatus(loan._id, "government", "Approved")}
                                        className="text-green-600"
                                    >
                                        <Check className="mr-2 h-4 w-4" />
                                        Approve
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={() => {
                                            setSelectedLoan({ loan, type: "government" });
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
                                        setSelectedLoan({ loan, type: "government" });
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

                    <Dialog open={showGovernmentDetailsDialog} onOpenChange={setShowGovernmentDetailsDialog}>
                        <DialogContent className="sm:max-w-[525px]">
                            <DialogHeader>
                                <DialogTitle>Loan Details</DialogTitle>
                                <DialogDescription>
                                    Detailed information about the government loan request
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-6 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label className="text-right font-medium">Employee</Label>
                                    <div className="col-span-3">
                                        {loan.user ? `${loan.user.firstName} ${loan.user.lastName}` : 'N/A'}
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label className="text-right font-medium">Amount</Label>
                                    <div className="col-span-3 font-semibold">
                                        ₱{loan.amount.toLocaleString()}
                                    </div>
                                </div>

                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label className="text-right font-medium">Monthly Amortization</Label>
                                    <div className="col-span-3">
                                        ₱{loan.amortization.toLocaleString()}
                                    </div>
                                </div>

                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label className="text-right font-medium">Start Date</Label>
                                    <div className="col-span-3">
                                        {format(new Date(loan.startDate), 'MMMM d, yyyy')}
                                    </div>
                                </div>

                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label className="text-right font-medium">Monthly Schedule</Label>
                                    <div className="col-span-3">
                                        {loan.monthlySchedule}
                                    </div>
                                </div>

                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label className="text-right font-medium">Status</Label>
                                    <div className="col-span-3">
                                        <Badge variant={loan.status === "Approved" ? "default" : 
                                               loan.status === "Rejected" ? "destructive" : "secondary"}>
                                            {loan.status}
                                        </Badge>
                                    </div>
                                </div>

                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label className="text-right font-medium">Request Date</Label>
                                    <div className="col-span-3">
                                        {format(new Date(loan.createdAt), 'MMMM d, yyyy')}
                                    </div>
                                </div>

                                {loan.additionalInfo && (
                                    <div className="grid grid-cols-4 items-start gap-4">
                                        <Label className="text-right font-medium">Additional Info</Label>
                                        <div className="col-span-3">
                                            {loan.additionalInfo}
                                        </div>
                                    </div>
                                )}
                            </div>
                            <DialogFooter>
                                <Button variant="secondary" onClick={() => setShowGovernmentDetailsDialog(false)}>
                                    Close
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </>
            );
        },
    };

    const balanceColumn = {
        accessorKey: "remainingBalance",
        header: "Remaining Balance",
        // @ts-expect-error - no need to put a type here
        cell: ({ row }) => {
            const loan = row.original;
            const totalPaid = loan.totalPaid || 0;
            const remainingBalance = loan.totalAmount - totalPaid;
            return (
                <div className="space-y-1">
                    <div>₱{remainingBalance.toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground">
                        Paid: ₱{totalPaid.toLocaleString()}
                    </div>
                </div>
            );
        },
    };

    const companyLoanColumns: ColumnDef<CompanyLoanWithUser>[] = [
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
        balanceColumn,
        companyActionColumn,
    ];

    const governmentLoanColumns: ColumnDef<GovernmentLoanWithUser>[] = [
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
                        variant={status === "Approved" ? "default" : "secondary"}
                    >
                        {status === "Approved" ? "Active" : status}
                    </Badge>
                );
            },
        },
        governmentActionColumn,
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
                            Loan Management
                        </CardTitle>
                        <CardDescription>
                            {isAdmin
                                ? "Manage employee loans and issue government loans"
                                : "Submit and track your loan requests"}
                        </CardDescription>
                    </div>
                    {/* Add this button for admins */}
                    {isAdmin && (
                        <Button onClick={() => setShowIssueForm(true)}>
                            <CreditCardIcon className="h-4 w-4 mr-2" />
                            Issue Government Loan
                        </Button>
                    )}
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
                            filter="employeeName"
                            filterLabel="requests by employee name"
                        />
                    </TabsContent>

                    <TabsContent value="government">
                        <DataTable
                            columns={governmentLoanColumns}
                            data={governmentLoans as GovernmentLoanWithUser[]}
                            filter="employeeName"
                            filterLabel="requests by employee name"
                        />
                    </TabsContent>
                </Tabs>

                {showCompanyLoanForm && (
                    <LoanRequestForm
                        onClose={() => {
                            setShowCompanyLoanForm(false)
                            onCloseForm?.()
                        }}
                    />
                )}

                {showIssueForm && (
                    <IssueGovernmentLoanForm onClose={() => setShowIssueForm(false)} />
                )}

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

                <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add Payment for {selectedCompanyLoan?.type}</DialogTitle>
                            <DialogDescription>
                                Enter the payment amount for this company loan.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label>Payment Amount</Label>
                                <Input
                                    type="number"
                                    value={paymentAmount}
                                    onChange={(e) => setPaymentAmount(e.target.value)}
                                    placeholder="0.00"
                                />
                            </div>

                            {selectedCompanyLoan && (
                                <div className="text-sm space-y-2">
                                    <div>
                                        <span className="font-medium">Total Amount:</span>{" "}
                                        ₱{selectedCompanyLoan.totalAmount.toLocaleString()}
                                    </div>
                                    <div>
                                        <span className="font-medium">Already Paid:</span>{" "}
                                        ₱{(selectedCompanyLoan.totalPaid || 0).toLocaleString()}
                                    </div>
                                    <div>
                                        <span className="font-medium">Remaining Balance:</span>{" "}
                                        ₱{(selectedCompanyLoan.totalAmount - (selectedCompanyLoan.totalPaid || 0)).toLocaleString()}
                                    </div>
                                </div>
                            )}
                        </div>

                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setShowPaymentDialog(false);
                                    setPaymentAmount("");
                                    setSelectedCompanyLoan(null);
                                }}
                            >
                                Cancel
                            </Button>

                            <Button
                                onClick={() => {
                                    if (selectedCompanyLoan && paymentAmount) {
                                        handleAddPayment(
                                            selectedCompanyLoan._id,
                                            parseFloat(paymentAmount)
                                        );
                                    }
                                }}
                                disabled={!paymentAmount || parseFloat(paymentAmount) <= 0}
                            >
                                Add Payment
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </CardContent>
        </Card>
    );
}
