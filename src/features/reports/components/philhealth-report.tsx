"use client";

import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "convex/react";
import { useState } from "react";
import { api } from "../../../../convex/_generated/api";
import { ExportPhilhealthDialog } from "./export-philhealth-dialog";

export function PhilhealthReport() {
    const [schedule, setSchedule] = useState<"1st half" | "2nd half">("1st half");

    const employees = useQuery(api.users.listEmployeesWithContributions, {
        schedule
    });
    const philhealthTable = useQuery(api.contributionTables.getCurrentPhilhealth);

    const calculatePhilhealthContribution = (monthlyBasicSalary: number) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const isPhilHealthRange = (ranges: any[]): ranges is Array<{
            yearStart: number;
            yearEnd: number;
            basicSalary: { from: number; to: number | null };
            premiumRate: number;
            monthlyPremium: number;
            employeeShare: number;
            employerShare: number;
        }> => {
            return ranges.every(range => 'premiumRate' in range);
        };

        if (!philhealthTable?.ranges || !Array.isArray(philhealthTable.ranges) ||
            !isPhilHealthRange(philhealthTable.ranges)) {
            return { ee: 0, er: 0 };
        }

        // For salaries 10,000 and below
        if (monthlyBasicSalary <= 10000) {
            return {
                ee: 200, // Updated to 200 (400/2) based on 2024 rates
                er: 200  // Updated to 200 (400/2) based on 2024 rates
            };
        }

        // For salaries 80,000 and above (updated threshold for 2024)
        if (monthlyBasicSalary >= 80000) {
            return {
                ee: 1800, // Updated to 1800 (3600/2) based on 2024 rates
                er: 1800  // Updated to 1800 (3600/2) based on 2024 rates
            };
        }

        // For salaries between 10,000.01 to 79,999.99
        const currentRange = philhealthTable.ranges.find(range => {
            const currentYear = new Date().getFullYear();
            return currentYear >= range.yearStart && currentYear <= range.yearEnd;
        });

        if (!currentRange) {
            return { ee: 0, er: 0 };
        }

        const premiumRate = currentRange.premiumRate;
        const monthlyPremium = monthlyBasicSalary * (premiumRate / 100);
        const share = monthlyPremium / 2; // Split 50-50

        return {
            ee: Number(share.toFixed(2)),
            er: Number(share.toFixed(2))
        };
    };

    const tableData = employees?.map(employee => {
        const monthlyBasicSalary = employee.ratePerDay ? employee.ratePerDay * 22 : 0;
        const { ee, er } = calculatePhilhealthContribution(monthlyBasicSalary);

        return {
            empId: employee.employeeTypeId as string,
            name: `${employee.lastName}, ${employee.firstName}`,
            philhealthNo: employee.philHealthNumber || "N/A",
            employeeShare: ee,
            employerShare: er
        };
    }) || [];

    const totals = tableData.reduce((acc, row) => ({
        ee: acc.ee + row.employeeShare,
        er: acc.er + row.employerShare
    }), { ee: 0, er: 0 });

    return (
        <Card className="p-6">
            <h1 className="text-2xl font-bold tracking-tight mb-6">PhilHealth Report</h1>
            <div className="flex justify-between items-center mb-6">
                <Select value={schedule} onValueChange={(value) => setSchedule(value as "1st half" | "2nd half")}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="1st half">1st Half</SelectItem>
                        <SelectItem value="2nd half">2nd Half</SelectItem>
                    </SelectContent>
                </Select>

                <div className="flex gap-2">
                    <ExportPhilhealthDialog data={tableData} schedule={schedule} />
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="bg-muted">
                            <th className="border p-2 text-left">Emp. Id</th>
                            <th className="border p-2 text-left">Name</th>
                            <th className="border p-2 text-left">PhilHealth No.</th>
                            <th className="border p-2 text-right">Employee Share</th>
                            <th className="border p-2 text-right">Employer Share</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tableData.map((row, index) => (
                            <tr key={index} className="hover:bg-muted/50">
                                <td className="border p-2">{row.empId}</td>
                                <td className="border p-2">{row.name}</td>
                                <td className="border p-2">{row.philhealthNo}</td>
                                <td className="border p-2 text-right">₱{row.employeeShare.toFixed(2)}</td>
                                <td className="border p-2 text-right">₱{row.employerShare.toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot className="bg-muted font-medium">
                        <tr>
                            <td colSpan={3} className="border p-2 text-right">Totals:</td>
                            <td className="border p-2 text-right">₱{totals.ee.toFixed(2)}</td>
                            <td className="border p-2 text-right">₱{totals.er.toFixed(2)}</td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </Card>
    );
}