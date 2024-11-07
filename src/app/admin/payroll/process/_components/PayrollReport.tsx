"use client"

import { DataTable } from "@/components/data-table"
import { api } from "../../../../../../convex/_generated/api"
import { useQuery } from "convex/react"
import { Id } from "../../../../../../convex/_generated/dataModel"
import { columns } from "./columns"
import { SalaryComponent } from "@/lib/types"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { useState } from "react"

export default function PayrollReport() {
    const payrollPeriods = useQuery(api.payrollPeriods.list)
    const [selectedPeriodId, setSelectedPeriodId] = useState<Id<"payrollPeriods"> | null>(() => {
        // Initialize with the most recent period if available
        return payrollPeriods?.[0]?._id ?? null;
    })
    
    const salaryComponents = useQuery(
        api.salaryComponents.listByPayrollPeriod,
        selectedPeriodId ? { payrollPeriodId: selectedPeriodId } : "skip"
    )

    const data = salaryComponents ?? [] as SalaryComponent[]

    return (
        <div className="space-y-4">
            <Select onValueChange={(value) => setSelectedPeriodId(value as Id<"payrollPeriods">)}>
                <SelectTrigger className="w-[280px]">
                    <SelectValue placeholder="Select a payroll period" />
                </SelectTrigger>
                <SelectContent>
                    {payrollPeriods?.map((period) => (
                        <SelectItem key={period._id} value={period._id}>
                            {period.startDate} to {period.endDate}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

         
              
            <DataTable 
            
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            columns={columns as any} 
            data={data} />
         
        </div>
    )
}