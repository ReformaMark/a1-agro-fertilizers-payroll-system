"use client"

import { LeaveRequestList } from "@/features/leaves/components/leave-request-list"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useQuery } from "convex/react"
import { api } from "../../../../../convex/_generated/api"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { useState } from "react"
import { LeaveRequestForm } from "@/features/leaves/components/leave-request-form"

export default function AdminLeavesPage() {
    const stats = useQuery(api.leaves.getLeaveRequestStats, { userId: undefined })
    const [showIssueLeaveForm, setShowIssueLeaveForm] = useState(false);

    return (
        <div className="container py-6">
            <div className="mb-6 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Leave Requests Management</h1>
                    <p className="text-muted-foreground">
                        Review and manage employee leave requests
                    </p>
                </div>

                <Button onClick={() => setShowIssueLeaveForm(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Issue Leave
                </Button>
            </div>

            {showIssueLeaveForm && (
                <LeaveRequestForm
                    onClose={() => setShowIssueLeaveForm(false)}
                />
            )}

            {/* Stats Overview */}
            <div className="grid gap-4 md:grid-cols-4 mb-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Requests
                        </CardTitle>
                        <Badge>{stats?.total || 0}</Badge>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.total || 0}</div>
                        <p className="text-xs text-muted-foreground">
                            All time requests
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Pending
                        </CardTitle>
                        <Badge variant="secondary">{stats?.pending || 0}</Badge>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.pending || 0}</div>
                        <p className="text-xs text-muted-foreground">
                            Awaiting review
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Approved
                        </CardTitle>
                        <Badge variant="default">{stats?.approved || 0}</Badge>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.approved || 0}</div>
                        <p className="text-xs text-muted-foreground">
                            Accepted requests
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Rejected
                        </CardTitle>
                        <Badge variant="destructive">{stats?.rejected || 0}</Badge>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.rejected || 0}</div>
                        <p className="text-xs text-muted-foreground">
                            Declined requests
                        </p>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="all" className="space-y-6">
                <TabsList>
                    <TabsTrigger value="all">All Requests</TabsTrigger>
                    <TabsTrigger value="pending">Pending</TabsTrigger>
                    <TabsTrigger value="approved">Approved</TabsTrigger>
                    <TabsTrigger value="rejected">Rejected</TabsTrigger>
                </TabsList>

                <TabsContent value="all">
                    <LeaveRequestList />
                </TabsContent>

                <TabsContent value="pending">
                    <LeaveRequestList filterStatus="Pending" />
                </TabsContent>

                <TabsContent value="approved">
                    <LeaveRequestList filterStatus="Approved" />
                </TabsContent>

                <TabsContent value="rejected">
                    <LeaveRequestList filterStatus="Rejected" />
                </TabsContent>
            </Tabs>
        </div>
    )
} 