"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { CompensationTypes } from "./compensation-types"
import { EmployeeCompensations } from "./employee-compensations"
import { CompensationAdjustments } from "./compensation-adjustments"

export function CompensationDashboard() {
    return (
        <div className="container mx-auto p-4 md:p-6">
            <h1 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6">
                Compensation Management
            </h1>
            <Tabs defaultValue="types" className="w-full">
                <TabsList className="w-full justify-start overflow-x-auto">
                    <TabsTrigger value="types" className="flex-1 md:flex-none">
                        Compensation Types
                    </TabsTrigger>
                    <TabsTrigger value="assignments" className="flex-1 md:flex-none">
                        Employee Assignments
                    </TabsTrigger>
                    <TabsTrigger value="adjustments" className="flex-1 md:flex-none">
                        Adjustments
                    </TabsTrigger>
                </TabsList>
                <Card className="mt-4 border-t-0 rounded-t-none">
                    <CardContent className="p-4 md:p-6">
                        <TabsContent value="types">
                            <CompensationTypes />
                        </TabsContent>
                        <TabsContent value="assignments">
                            <EmployeeCompensations />
                        </TabsContent>
                        <TabsContent value="adjustments">
                            <CompensationAdjustments />
                        </TabsContent>
                    </CardContent>
                </Card>
            </Tabs>
        </div>
    )
}