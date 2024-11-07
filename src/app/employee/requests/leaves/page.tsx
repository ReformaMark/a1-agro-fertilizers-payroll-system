"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useQuery } from "convex/react"
import { api } from "../../../../../convex/_generated/api"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useCurrentUser } from "@/hooks/use-current-user"
import { LeaveRequestList } from "@/features/leaves/components/leave-request-list"

export default function EmployeeLeavesPage() {
    const { data: currentUser } = useCurrentUser()
    const stats = useQuery(api.leaves.getLeaveRequestStats, { userId: currentUser?._id })

    return (
        <div className="container py-6">
            <div className="mb-6">
                <h1 className="text-3xl font-bold">My Leave Requests</h1>
                <p className="text-muted-foreground">
                    Submit and track your leave requests
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
                            Awaiting approval
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
                            Approved requests
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
                            Rejected requests
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