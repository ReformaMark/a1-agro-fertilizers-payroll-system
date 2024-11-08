"use client"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useQuery } from "convex/react"
import { CalendarDays, Clock, HeartPulse, Wallet } from "lucide-react"
import { api } from "../../../convex/_generated/api"
import { useCurrentUser } from "@/hooks/use-current-user"

export default function EmployeeDashboard() {
    const { data: currentUser } = useCurrentUser()
    const leaveBalance = useQuery(api.leaves.getLeaveBalance, {
        userId: currentUser?._id
    })

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
            </div>

            {/* Quick Stats */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Leave Balance
                        </CardTitle>
                        <CalendarDays className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{leaveBalance ?? '...'} days</div>
                        <p className="text-xs text-muted-foreground">
                            Annual leave remaining
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Pending Requests
                        </CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">2</div>
                        <p className="text-xs text-muted-foreground">
                            Awaiting approval
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Active Benefits
                        </CardTitle>
                        <HeartPulse className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">3</div>
                        <p className="text-xs text-muted-foreground">
                            Current benefit plans
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Compensation
                        </CardTitle>
                        <Wallet className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">₱45,000</div>
                        <p className="text-xs text-muted-foreground">
                            Monthly total
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Activity and Benefits */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center">
                                <div className="ml-4 space-y-1">
                                    <p className="text-sm font-medium">Leave Request Approved</p>
                                    <p className="text-sm text-muted-foreground">
                                        Your leave request for Dec 24-26 has been approved
                                    </p>
                                </div>
                                <Badge className="ml-auto">New</Badge>
                            </div>
                            {/* Add more activity items */}
                        </div>
                    </CardContent>
                </Card>

                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Available Benefits</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center">
                                <div className="ml-4 space-y-1">
                                    <p className="text-sm font-medium">Health Insurance</p>
                                    <p className="text-sm text-muted-foreground">
                                        Premium healthcare coverage
                                    </p>
                                </div>
                                <Badge variant="outline" className="ml-auto">
                                    Active
                                </Badge>
                            </div>
                            {/* Add more benefits */}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Leave Calendar and Requests */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Upcoming Leaves</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {/* Add calendar or list of upcoming leaves */}
                        </div>
                    </CardContent>
                </Card>

                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Pending Requests</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {/* Add list of pending requests */}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
} 