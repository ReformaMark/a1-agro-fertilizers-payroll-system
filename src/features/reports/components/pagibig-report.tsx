"use client";

import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "convex/react";
import { useState } from "react";
import { api } from "../../../../convex/_generated/api";
import { ExportPagibigDialog } from "./export-pagibig-dialog";

export function PagibigReport() {
    const [schedule, setSchedule] = useState<"1st half" | "2nd half">("1st half");

    const employees = useQuery(api.users.listEmployeesWithContributions, {
        schedule
    });

    const findEmployerShare = (monthlyCompensation: number) => {
        const PAGIBIG_MAX_COMPENSATION = 10000; // Maximum compensation for computation
        const LOWER_THRESHOLD = 1500;

        // If monthly compensation exceeds the maximum, use the maximum instead
        const baseCompensation = Math.min(monthlyCompensation, PAGIBIG_MAX_COMPENSATION);

        // If monthly compensation is 1,500 and below
        if (monthlyCompensation <= LOWER_THRESHOLD) {
            return {
                ee: monthlyCompensation * 0.01, // 1% for employee
                er: monthlyCompensation * 0.02  // 2% for employer
            };
        }
        // If monthly compensation is over 1,500 (use baseCompensation for calculation)
        return {
            ee: baseCompensation * 0.02, // 2% for employee
            er: baseCompensation * 0.02  // 2% for employer
        };
    };

    const tableData = employees?.map(employee => {
        const monthlyCompensation = employee.ratePerDay ? employee.ratePerDay * 22 : 0; // Assuming 22 working days
        const { ee, er } = findEmployerShare(monthlyCompensation);

        return {
            empId: employee._id.slice(-6).toUpperCase(),
            name: `${employee.lastName}, ${employee.firstName}`,
            pagibigNo: employee.pagIbigNumber || "N/A",
            employeeShare: Number(ee.toFixed(2)),
            employerShare: Number(er.toFixed(2))
        };
    }) || [];

    const totals = tableData.reduce((acc, row) => ({
        ee: acc.ee + row.employeeShare,
        er: acc.er + row.employerShare
    }), { ee: 0, er: 0 });

    return (
        <Card className="p-6">
            <h1 className="text-2xl font-bold tracking-tight mb-6">Pag-IBIG Report</h1>
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
                    <ExportPagibigDialog data={tableData} schedule={schedule} />
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="bg-muted">
                            <th className="border p-2 text-left">Emp. Id</th>
                            <th className="border p-2 text-left">Name</th>
                            <th className="border p-2 text-left">Pag-IBIG No.</th>
                            <th className="border p-2 text-right">Employee Share</th>
                            <th className="border p-2 text-right">Employer Share</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tableData.map((row, index) => (
                            <tr key={index} className="hover:bg-muted/50">
                                <td className="border p-2">{row.empId}</td>
                                <td className="border p-2">{row.name}</td>
                                <td className="border p-2">{row.pagibigNo}</td>
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