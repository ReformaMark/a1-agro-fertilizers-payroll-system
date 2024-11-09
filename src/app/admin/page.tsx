"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useQuery } from "convex/react"
import { format } from "date-fns"
import { Cake, GiftIcon, UserCheck, Users } from "lucide-react"
import { api } from "../../../convex/_generated/api"

const AdminPage = () => {
    const stats = useQuery(api.users.getDashboardStats)

    return (
        <div className="flex-1 space-y-8 p-8">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card className="shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                        <CardTitle className="text-base font-semibold">
                            Total Employees
                        </CardTitle>
                        <Users className="h-5 w-5 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold tracking-tight">
                            {stats?.totalEmployees ?? 0}
                        </div>
                        <p className="mt-2 text-sm text-muted-foreground">
                            Active employees in the system
                        </p>
                    </CardContent>
                </Card>

                <Card className="shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                        <CardTitle className="text-base font-semibold">
                            Present Today
                        </CardTitle>
                        <UserCheck className="h-5 w-5 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold tracking-tight">
                            {stats?.presentToday ?? 0}
                        </div>
                        <p className="mt-2 text-sm text-muted-foreground">
                            Employees who logged in today
                        </p>
                    </CardContent>
                </Card>

                <Card className="shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                        <CardTitle className="text-base font-semibold">
                            Birthdays Today
                        </CardTitle>
                        <GiftIcon className="h-5 w-5 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold tracking-tight">
                            {stats?.birthdaysToday.length ?? 0}
                        </div>
                        <div className="mt-4 space-y-2">
                            {stats?.birthdaysToday.map(employee => {
                                const [, month, day] = employee.dateOfBirth.split('-');
                                return (
                                    <div
                                        key={employee.id}
                                        className="flex items-center justify-between text-sm"
                                    >
                                        <span className="text-muted-foreground">{employee.name}</span>
                                        <span className="text-green-500 font-medium">
                                            🎉 Today!
                                        </span>
                                    </div>
                                );
                            })}
                            {stats?.birthdaysToday.length === 0 && (
                                <p className="text-sm text-muted-foreground">
                                    No birthdays today
                                </p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card className="shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                        <CardTitle className="text-base font-semibold">
                            Upcoming Birthdays
                        </CardTitle>
                        <Cake className="h-5 w-5 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold tracking-tight">
                            {stats?.upcomingBirthdays.length ?? 0}
                        </div>
                        <div className="mt-4 space-y-2">
                            {stats?.upcomingBirthdays.map(employee => (
                                <div
                                    key={employee.id}
                                    className="flex items-center justify-between text-sm"
                                >
                                    <span className="text-muted-foreground">{employee.name}</span>
                                    <span className="text-muted-foreground">
                                        {format(new Date(`2000-${employee.dateOfBirth.split('-')[1]}-${employee.dateOfBirth.split('-')[2]}`), 'MMM d')}
                                        <span className="ml-2">({employee.daysUntil} {employee.daysUntil === 1 ? 'day' : 'days'})</span>
                                    </span>
                                </div>
                            ))}
                            {stats?.upcomingBirthdays.length === 0 && (
                                <p className="text-sm text-muted-foreground">
                                    No upcoming birthdays in the next 30 days
                                </p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

export default AdminPage