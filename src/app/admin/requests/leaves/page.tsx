"use client"

import { LeaveRequestList } from "@/features/leaves/components/leave-request-list"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useQuery } from "convex/react"
import { api } from "../../../../../convex/_generated/api"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function AdminLeavesPage() {
    const stats = useQuery(api.leaves.getLeaveRequestStats, { userId: undefined })

    return (
        <div className="container py-6">
            <div className="mb-6">
                <h1 className="text-3xl font-bold">Leave Requests Management</h1>
                <p className="text-muted-foreground">
                    Review and manage employee leave requests
                </p>
            </div>

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

                {/* Similar cards for Pending, Approved, Rejected */}
                {/* ... */}
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
                    <LeaveRequestList filterStatus="Pending"  />
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