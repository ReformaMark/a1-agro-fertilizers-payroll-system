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
        
        const { start, end } = getCurrentTimePeriod(new Date(selectedDate));
        
        return salaryComponents.filter((record) => {
            const recordDate = new Date(record._creationTime);
            return recordDate >= start && recordDate <= end;
        });
    }, [salaryComponents, selectedDate]);

    const dataForExport = filteredData.map((item) => {
        if (!item.employee) return null;
        const firstName = item.employee.firstName;
        const lastName = item.employee.lastName;
        const middleInitial = item.employee.middleName ? item.employee.middleName.charAt(0) + '.' : '';
        const fullName = `${lastName}, ${firstName} ${middleInitial}`;
        const ratePerDay = item.employee.ratePerDay ?? 0;
        const hoursWorked = item.hoursWorked ?? 0;
        const total = (ratePerDay / 8) * hoursWorked;
        const deductions = item.deductions.reduce((sum, d) => sum + d.amount, 0);

        return {
            employeeId: item.employee.employeeTypeId,
            name: fullName,
            daysWorked: hoursWorked.toFixed(1),
            ratePerDay: ratePerDay.toFixed(2),
            total: total.toFixed(2),
            sss: item.governmentContributions.sss.toFixed(2),
            philHealth: item.governmentContributions.philHealth.toFixed(2),
            pagIbig: item.governmentContributions.pagIbig.toFixed(2), 
            deductions: deductions.toFixed(2),
            netPay: item.netPay.toFixed(2)
        };
    }).filter(Boolean);
    
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
                                    dataForExport,
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
                
            </CardHeader>

            <CardContent className="pt-6">
                <div className="overflow-x-auto">
                <div>
                    {TimePeriod(selectedDate, setSelectedDate)}
                </div>
                    <DataTable
                        columns={columns} // TODO: Define payroll columns
                        data={filteredData as SalaryComponent[]}
                        filter="name"
                        filterLabel="Employee Name"
                    />
                </div>
            </CardContent>
        </Card>
    );
}




