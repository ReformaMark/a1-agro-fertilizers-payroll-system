"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

export function SSSReport() {
    // const [dateRange, setDateRange] = useState("2024-10-16 2024-10-31");
    const [schedule, setSchedule] = useState<"1st half" | "2nd half">("1st half");
    const [open, setOpen] = useState(false);

    const employees = useQuery(api.users.listEmployeesWithContributions, {
        schedule
    });

    const findEmployerShares = (employeeShare: number) => {
        // Direct calculation without table lookup
        return {
            er: Math.round(employeeShare * 2.11111 * 100) / 100, // Round to 2 decimal places
            ec: employeeShare >= 675 ? 30 : 10, // EC is 30 for higher contributions, 10 for lower
            isOutOfRange: false
        };
    };

    const tableData = employees?.map(employee => {
        const employeeShare = employee.sssContribution || 0;
        const { er, ec } = findEmployerShares(employeeShare);

        return {
            empId: employee.employeeTypeId as string,
            name: `${employee.lastName}, ${employee.firstName}`,
            sssNo: employee.sssNumber || "N/A",
            employeeShare: Number(employeeShare),  // Ensure it's a number
            employerShare: Number(er),             // Ensure it's a number
            ecEmployerShare: Number(ec)            // Ensure it's a number
        };
    }) || [];

    const totals = tableData.reduce((acc, row) => ({
        ee: acc.ee + (typeof row.employeeShare === 'number' ? row.employeeShare : 0),
        er: acc.er + (typeof row.employerShare === 'number' ? row.employerShare : 0),
        ec: acc.ec + (typeof row.ecEmployerShare === 'number' ? row.ecEmployerShare : 0)
    }), { ee: 0, er: 0, ec: 0 });

    const handleExport = () => {
        // Convert data to CSV format
        const headers = ["Emp. Id", "Name", "SSS No.", "Employee Share", "Employer Share", "EC Employer Share"];
        const csvData = [
            headers,
            ...tableData.map(row => [
                row.empId,
                row.name,
                row.sssNo,
                row.employeeShare,
                row.employerShare,
                row.ecEmployerShare
            ])
        ];

        // Calculate totals
        const totals = tableData.reduce(
            (acc, row) => ({
                ee: acc.ee + row.employeeShare,
                er: acc.er + (typeof row.employerShare === 'number' ? row.employerShare : 0),
                ec: acc.ec + (typeof row.ecEmployerShare === 'number' ? row.ecEmployerShare : 0)
            }),
            { ee: 0, er: 0, ec: 0 }
        );

        // Add totals row
        csvData.push([
            "TOTALS", "", "",
            totals.ee.toFixed(2),
            totals.er.toFixed(2),
            totals.ec.toFixed(2)
        ]);

        // Convert to CSV string
        const csvString = csvData
            .map(row => row.map(cell => `"${cell}"`).join(","))
            .join("\n");

        // Create and trigger download
        const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", `sss_report_${schedule}_${new Date().toISOString().split('T')[0]}.csv`);
            link.style.visibility = "hidden";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }

        setOpen(false);
    };

    return (
        <>
            <Card className="p-6">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex gap-4">
                        {/* <Select defaultValue={dateRange} onValueChange={setDateRange}>
                        <SelectTrigger className="w-[240px]">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="2024-10-16 2024-10-31">2024-10-16 2024-10-31</SelectItem>
                        </SelectContent>
                    </Select> */}

                        <Select value={schedule} onValueChange={(value) => setSchedule(value as "1st half" | "2nd half")}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="1st half">1st Half</SelectItem>
                                <SelectItem value="2nd half">2nd Half</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex gap-2">
                        {/* <Button variant="outline">Search</Button> */}
                        <Dialog open={open} onOpenChange={setOpen}>
                            <Button onClick={() => setOpen(true)}>
                                Export SSS Report
                            </Button>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Export SSS Report</DialogTitle>
                                    <DialogDescription>
                                        This will export the SSS report for {schedule} to a CSV file.
                                    </DialogDescription>
                                </DialogHeader>
                                <DialogFooter>
                                    <Button variant="outline" onClick={() => setOpen(false)}>
                                        Cancel
                                    </Button>
                                    <Button onClick={handleExport}>
                                        Export
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-muted">
                                <th className="border p-2 text-left">Emp. Id</th>
                                <th className="border p-2 text-left">Name</th>
                                <th className="border p-2 text-left">SSS No.</th>
                                <th className="border p-2 text-right">Employee Share</th>
                                <th className="border p-2 text-right">Employer Share</th>
                                <th className="border p-2 text-right">EC Employer Share</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tableData.map((row, index) => (
                                <tr key={index} className="hover:bg-muted/50">
                                    <td className="border p-2">{row.empId}</td>
                                    <td className="border p-2">{row.name}</td>
                                    <td className="border p-2">{row.sssNo}</td>
                                    <td className="border p-2 text-right">₱{row.employeeShare.toFixed(2)}</td>
                                    <td className="border p-2 text-right">
                                        {typeof row.employerShare === 'number'
                                            ? `₱${row.employerShare.toFixed(2)}`
                                            : row.employerShare}
                                    </td>
                                    <td className="border p-2 text-right">
                                        {typeof row.ecEmployerShare === 'number'
                                            ? `₱${row.ecEmployerShare.toFixed(2)}`
                                            : row.ecEmployerShare}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot className="bg-muted font-medium">
                            <tr>
                                <td colSpan={3} className="border p-2 text-right">Totals:</td>
                                <td className="border p-2 text-right">₱{totals.ee.toFixed(2)}</td>
                                <td className="border p-2 text-right">₱{totals.er.toFixed(2)}</td>
                                <td className="border p-2 text-right">₱{totals.ec.toFixed(2)}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </Card>
        </>
    );
}