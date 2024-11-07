"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ExportLoanDialog } from "@/features/requests/loans/components/export-loan-dialog"
import { LoanRequestList } from "@/features/requests/loans/components/loan-request-list"
import { useQuery } from "convex/react"
import { api } from "../../../../../convex/_generated/api"

export default function AdminLoansPage() {
    const companyLoans = useQuery(api.loans.getCompanyLoans, {})
    const governmentLoans = useQuery(api.loans.getGovernmentLoans, {})

    const stats = {
        company: {
            total: companyLoans?.length || 0,
            pending: companyLoans?.filter(l => l.status === "Pending").length || 0,
            approved: companyLoans?.filter(l => l.status === "Approved").length || 0,
            rejected: companyLoans?.filter(l => l.status === "Rejected").length || 0,
        },
        government: {
            total: governmentLoans?.length || 0,
            pending: governmentLoans?.filter(l => l.status === "Pending").length || 0,
            approved: governmentLoans?.filter(l => l.status === "Approved").length || 0,
            rejected: governmentLoans?.filter(l => l.status === "Rejected").length || 0,
        }
    }

    return (
        <div className="container py-6">
            <div className="mb-6">
                <h1 className="text-3xl font-bold">Loan Management</h1>
                <p className="text-muted-foreground">
                    Review and manage employee loan requests
                </p>
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
                        <CardTitle className="text-sm font-medium">
                            Pending
                        </CardTitle>
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
                        <CardTitle className="text-sm font-medium">
                            Approved
                        </CardTitle>
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
                        <CardTitle className="text-sm font-medium">
                            Rejected
                        </CardTitle>
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

            {/* Add Export Buttons */}
            <div className="flex gap-2 mb-6">
                <ExportLoanDialog loans={companyLoans || []} type="company" />
                <ExportLoanDialog loans={governmentLoans || []} type="government" />
            </div>

            <Tabs defaultValue="all" className="space-y-6">
                <TabsList>
                    <TabsTrigger value="all">All Requests</TabsTrigger>
                    <TabsTrigger value="pending">Pending</TabsTrigger>
                    <TabsTrigger value="approved">Approved</TabsTrigger>
                    <TabsTrigger value="rejected">Rejected</TabsTrigger>
                </TabsList>

                <TabsContent value="all">
                    <LoanRequestList />
                </TabsContent>

                <TabsContent value="pending">
                    <LoanRequestList filterStatus="Pending" />
                </TabsContent>

                <TabsContent value="approved">
                    <LoanRequestList filterStatus="Approved" />
                </TabsContent>

                <TabsContent value="rejected">
                    <LoanRequestList filterStatus="Rejected" />
                </TabsContent>
            </Tabs>
        </div>
    )
} 