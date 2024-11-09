"use client";

import { DataTable } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Download } from "lucide-react";
import { useMemo, useState } from "react";
import { useQuery } from "convex/react";
import { downloadCSV } from "@/lib/export-utils";
import { api } from "../../../../../../convex/_generated/api";
import TimePeriod from "@/features/attendance/components/time-period";
import { formatDate, getCurrentTimePeriod } from "@/lib/utils";
import { columns } from "./columns";
import { SalaryComponent } from "@/lib/types";

export default function PayrollReport() {
    const getCurrentDate = () => {
        const date = new Date()
        return date.toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        })
    }  
    const [selectedDate, setSelectedDate] = useState<string>(getCurrentDate())

    const { start, end } = useMemo(() => {
        return getCurrentTimePeriod(new Date(selectedDate))
    }, [selectedDate])

    const salaryComponents = useQuery(api.salaryComponents.listByPayrollPeriod, {
        startDate: formatDate(start),
        endDate: formatDate(end)
    });

    const filteredData = useMemo(() => {
        if (!salaryComponents) return [];
        return salaryComponents
    }, [salaryComponents]);
    return (
        <Card>
            <CardHeader className="border-b">
                <div className="flex justify-between space-y-5 items-center">
                    <div>
                        <CardTitle>Payroll Sheet</CardTitle>
                        <CardDescription>
                            View and manage employee payroll information
                        </CardDescription>
                    </div>

                    <div className="flex gap-4 items-center">
                        <Button
                            variant="default"
                            onClick={() => {        
                                if (!filteredData.length) return;
                                downloadCSV(
                                    filteredData,
                                    `payroll-${formatDate(start)}-${formatDate(end)}`
                                );
                            }}
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            <Download className="h-4 w-4 mr-1" />
                            Export CSV
                        </Button>
                    </div>
                </div>
                <div>
                    {TimePeriod(selectedDate, setSelectedDate)}
                </div>
            </CardHeader>

            <CardContent className="pt-6">
                <DataTable
                    columns={columns} // TODO: Define payroll columns
                    data={filteredData as SalaryComponent[]}
                    filter="employee.firstName"
                    filterLabel="Employee Name"
                />
            </CardContent>
        </Card>
    );
}




