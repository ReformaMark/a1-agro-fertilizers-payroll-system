"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CompensationTypes } from "./compensation-types"
import { EmployeeCompensations } from "./employee-compensations"
import { CompensationAdjustments } from "./compoensation-adjustments"


export function CompensationDashboard() {
    return (
        <div className="container mx-auto p-6">
            <h1 className="text-3xl font-bold mb-6">Compensation Management</h1>
            <Tabs defaultValue="types">
                <TabsList>
                    <TabsTrigger value="types">Compensation Types</TabsTrigger>
                    <TabsTrigger value="assignments">Employee Assignments</TabsTrigger>
                    <TabsTrigger value="adjustments">Adjustments</TabsTrigger>
                </TabsList>
                <TabsContent value="types">
                    <CompensationTypes />
                </TabsContent>
                <TabsContent value="assignments">
                    <EmployeeCompensations />
                </TabsContent>
                <TabsContent value="adjustments">
                    <CompensationAdjustments />
                </TabsContent>
            </Tabs>
        </div>
    )
}