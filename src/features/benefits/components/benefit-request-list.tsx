"use client";

import { DataTable } from "@/components/data-table";

import { Button } from "@/components/ui/button";

import { ColumnDef } from "@tanstack/react-table";

import { Doc, Id } from "../../../../convex/_generated/dataModel";

import { useState } from "react";

import { useBenefitRequests, useUpdateVoucherStatus } from "../api/benefits";

import { toast } from "sonner";

import { Plus, MoreHorizontal, Check, X } from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

import { Skeleton } from "@/components/ui/skeleton";

import { Badge } from "@/components/ui/badge";

import { format } from "date-fns";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

import { useCurrentUser } from "@/hooks/use-current-user";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Textarea } from "@/components/ui/textarea";

import { IssueVoucherForm } from "./issue-voucher-form";

interface BenefitRequestWithUser extends Doc<"benefitRequests"> {
  user: Doc<"users"> | null;
}

interface BenefitRequestListProps {
  filterStatus?: string;
}

export function BenefitRequestList({ filterStatus }: BenefitRequestListProps) {
  const { data: currentUser } = useCurrentUser();

  const [showRejectDialog, setShowRejectDialog] = useState(false);

  const [selectedRequest, setSelectedRequest] =
    useState<BenefitRequestWithUser | null>(null);

  const [rejectionReason, setRejectionReason] = useState("");

  const isAdmin = currentUser?.role === "admin";

  const [showIssueForm, setShowIssueForm] = useState(false);

  const benefitRequests = useBenefitRequests(
    isAdmin ? undefined : currentUser?._id,
    filterStatus
  );

  const updateVoucherStatus = useUpdateVoucherStatus();

  const stats = {
    total: benefitRequests?.length || 0,
    pending: benefitRequests?.filter((r) => r.status === "Pending").length || 0,
    approved: benefitRequests?.filter((r) => r.status === "Approved").length || 0,
    rejected: benefitRequests?.filter((r) => r.status === "Rejected").length || 0,
  };

  async function handleUpdateStatus(
    requestId: Id<"benefitRequests">,
    status: string,
    reason?: string
  ) {
    try {
      await updateVoucherStatus({
        requestId,
        status,
        rejectionReason: reason,
      });

      toast.success(`Voucher ${status.toLowerCase()} successfully`);

      setShowRejectDialog(false);
      setRejectionReason("");
      setSelectedRequest(null);
    } catch (error) {
      console.error(error);
      toast.error(`Failed to ${status.toLowerCase()} voucher`);
    }
  }

  const columns: ColumnDef<BenefitRequestWithUser>[] = [
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
      header: "Voucher Type",
      cell: ({ row }) => (
        <Badge variant="outline">{row.getValue("type")}</Badge>
      ),
    },
    {
      accessorKey: "amount",
      header: "Amount",
      cell: ({ row }) => {
        const amount = row.getValue<number | undefined>("amount");
        return amount ? `₱${amount.toLocaleString()}` : "N/A";
      },
    },
    {
      accessorKey: "createdAt",
      header: "Issued On",
      cell: ({ row }) => format(new Date(row.getValue("createdAt")), "PPP"),
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const request = row.original;
        const isPending = request.status === "Pending";

        if (!isAdmin) return null;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end">
              {isPending && (
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

                  <DropdownMenuSeparator />
                </>
              )}

              {request.description && (
                <DropdownMenuItem className="flex flex-col items-start">
                  <span className="font-medium mb-1">Description:</span>
                  <span className="text-sm text-muted-foreground">
                    {request.description}
                  </span>
                </DropdownMenuItem>
              )}

              {request.rejectionReason && (
                <DropdownMenuItem className="flex flex-col items-start">
                  <span className="font-medium mb-1">Rejection Reason:</span>
                  <span className="text-sm text-muted-foreground">
                    {request.rejectionReason}
                  </span>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  if (!benefitRequests) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Vouchers
            </CardTitle>
            <Badge>{stats.total}</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">All vouchers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Badge variant="secondary">{stats.pending}</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">Awaiting approval</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <Badge variant="default">{stats.approved}</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.approved}</div>
            <p className="text-xs text-muted-foreground">Active vouchers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
            <Badge variant="destructive">{stats.rejected}</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.rejected}</div>
            <p className="text-xs text-muted-foreground">Declined vouchers</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="border-b">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Vouchers</CardTitle>
              <CardDescription>
                {isAdmin
                  ? "Manage and issue employee vouchers"
                  : "View your active vouchers"}
              </CardDescription>
            </div>

            {isAdmin && (
              <Button onClick={() => setShowIssueForm(true)}>
                <Plus className="h-4 w-4 mr-1" />
                Issue Voucher
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          <DataTable
            columns={columns}
            data={benefitRequests}
            filter={isAdmin ? "user.firstName" : "type"}
            filterLabel={isAdmin ? "Employee Name" : "Voucher Type"}
          />
        </CardContent>
      </Card>

      {showIssueForm && (
        <IssueVoucherForm onClose={() => setShowIssueForm(false)} />
      )}

      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Voucher</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this voucher.
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
              Reject Voucher
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
