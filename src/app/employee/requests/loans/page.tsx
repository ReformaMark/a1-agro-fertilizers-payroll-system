"use client";

import { LoanRequestList } from "@/features/requests/loans/components/loan-request-list";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Badge } from "@/components/ui/badge";
import { useCurrentUser } from "@/hooks/use-current-user";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useState } from "react";

export default function EmployeeLoansPage() {
  const { data: currentUser } = useCurrentUser();
  const [showForm, setShowForm] = useState(false);
  const companyLoans = useQuery(api.loans.getCompanyLoans, {
    userId: currentUser?._id,
  });

  const governmentLoans = useQuery(api.loans.getGovernmentLoans, {
    userId: currentUser?._id,
  });

  const stats = {
    company: {
      total: companyLoans?.length || 0,
      pending: companyLoans?.filter((l) => l.status === "Pending").length || 0,

      approved:
        companyLoans?.filter((l) => l.status === "Approved").length || 0,

      rejected:
        companyLoans?.filter((l) => l.status === "Rejected").length || 0,
    },

    government: {
      total: governmentLoans?.length || 0,

      pending:
        governmentLoans?.filter((l) => l.status === "Pending").length || 0,

      approved:
        governmentLoans?.filter((l) => l.status === "Approved").length || 0,

      rejected:
        governmentLoans?.filter((l) => l.status === "Rejected").length || 0,
    },
  };

  return (
    <div className="container py-6">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">My Loan Requests</h1>

          <p className="text-muted-foreground">
            Submit and track your loan requests
          </p>
        </div>

        {currentUser?.filledUpByAdmin && (
          <Button onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-1" />
            New Loan Request
          </Button>
        )}
      </div>

      {/* Stats Overview */}

      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Requests
            </CardTitle>

            <Badge>{stats.company.total + stats.government.total}</Badge>
          </CardHeader>

          <CardContent>
            <div className="text-2xl font-bold">
              {stats.company.total + stats.government.total}
            </div>

            <div className="text-xs text-muted-foreground space-y-1">
              <div>Company: {stats.company.total}</div>

              <div>Government: {stats.government.total}</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>

            <Badge variant="secondary">
              {stats.company.pending + stats.government.pending}
            </Badge>
          </CardHeader>

          <CardContent>
            <div className="text-2xl font-bold">
              {stats.company.pending + stats.government.pending}
            </div>

            <div className="text-xs text-muted-foreground space-y-1">
              <div>Company: {stats.company.pending}</div>

              <div>Government: {stats.government.pending}</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>

            <Badge variant="default">
              {stats.company.approved + stats.government.approved}
            </Badge>
          </CardHeader>

          <CardContent>
            <div className="text-2xl font-bold">
              {stats.company.approved + stats.government.approved}
            </div>

            <div className="text-xs text-muted-foreground space-y-1">
              <div>Company: {stats.company.approved}</div>

              <div>Government: {stats.government.approved}</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejected</CardTitle>

            <Badge variant="destructive">
              {stats.company.rejected + stats.government.rejected}
            </Badge>
          </CardHeader>

          <CardContent>
            <div className="text-2xl font-bold">
              {stats.company.rejected + stats.government.rejected}
            </div>

            <div className="text-xs text-muted-foreground space-y-1">
              <div>Company: {stats.company.rejected}</div>

              <div>Government: {stats.government.rejected}</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <LoanRequestList
        showForm={showForm}
        onCloseForm={() => setShowForm(false)}
      />
    </div>
  );
}
