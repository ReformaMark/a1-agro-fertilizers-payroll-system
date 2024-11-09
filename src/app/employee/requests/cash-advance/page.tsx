"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useQuery } from "convex/react"
import { api } from "../../../../../convex/_generated/api"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useCurrentUser } from "@/hooks/use-current-user"
import { CashAdvanceRequestList } from "@/features/cash-advance/components/cash-advance-request-list"

function StatCard({
    title,
    value,
    description,
    variant = "default"
}: {
    title: string
    value: number
    description: string
    variant?: "default" | "secondary" | "destructive"
}) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <Badge variant={variant}>{value}</Badge>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                <p className="text-xs text-muted-foreground">{description}</p>
            </CardContent>
        </Card>
    )
}

const EmployeeCashAdvancePage = () => {
    const { data: currentUser } = useCurrentUser()
    const stats = useQuery(api.cashAdvance.getStats, { userId: currentUser?._id })

    return (
        <div className="container py-6">
            <div className="mb-6">
                <h1 className="text-3xl font-bold">My VALE Requests</h1>
                <p className="text-muted-foreground">
                    Submit and track your VALE requests
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-4 mb-6">
                <StatCard
                    title="Total Requests"
                    value={stats?.total || 0}
                    description="All time requests"
                />
                <StatCard
                    title="Pending"
                    value={stats?.pending || 0}
                    description="Awaiting approval"
                    variant="secondary"
                />
                <StatCard
                    title="Approved"
                    value={stats?.approved || 0}
                    description="Approved requests"
                />
                <StatCard
                    title="Rejected"
                    value={stats?.rejected || 0}
                    description="Rejected requests"
                    variant="destructive"
                />
            </div>

            <Tabs defaultValue="all">
                <TabsList className="mb-6">
                    <TabsTrigger value="all">All Requests</TabsTrigger>
                    <TabsTrigger value="pending">Pending</TabsTrigger>
                    <TabsTrigger value="approved">Approved</TabsTrigger>
                    <TabsTrigger value="rejected">Rejected</TabsTrigger>
                </TabsList>

                <TabsContent value="all">
                    <div className="w-full">
                        <CashAdvanceRequestList />
                    </div>
                </TabsContent>

                <TabsContent value="pending">
                    <div className="w-full">
                        <CashAdvanceRequestList filterStatus="Pending" />
                    </div>
                </TabsContent>

                <TabsContent value="approved">
                    <div className="w-full">
                        <CashAdvanceRequestList filterStatus="Approved" />
                    </div>
                </TabsContent>

                <TabsContent value="rejected">
                    <div className="w-full">
                        <CashAdvanceRequestList filterStatus="Rejected" />
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}

export default EmployeeCashAdvancePage
