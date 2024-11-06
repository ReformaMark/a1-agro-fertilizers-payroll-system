"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { EmployeeCompensations } from "./employee-compensations"
import { CompensationTypes } from "./compensation-types"
import { CompensationAdjustments } from "./compensation-adjustments"

export function CompensationTabs() {
    return (
        <Tabs defaultValue="compensations" className="space-y-4">
            <TabsList>
                <TabsTrigger value="compensations">Compensations</TabsTrigger>
                <TabsTrigger value="types">Types</TabsTrigger>
                <TabsTrigger value="adjustments">Adjustments</TabsTrigger>
            </TabsList>
            <TabsContent value="compensations" className="space-y-4">
                <EmployeeCompensations />
            </TabsContent>
            <TabsContent value="types" className="space-y-4">
                <CompensationTypes />
            </TabsContent>
            <TabsContent value="adjustments" className="space-y-4">
                <CompensationAdjustments />
            </TabsContent>
        </Tabs>
    )
} 