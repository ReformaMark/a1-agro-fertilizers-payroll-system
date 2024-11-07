"use client";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";

interface ExportPagibigDialogProps {
    data: {
        empId: string;
        name: string;
        pagibigNo: string;
        employeeShare: number;
        employerShare: number;
    }[];
    schedule: "1st half" | "2nd half";
}

export function ExportPagibigDialog({ data, schedule }: ExportPagibigDialogProps) {
    const [open, setOpen] = useState(false);

    const handleExport = () => {
        const headers = ["Emp. Id", "Name", "Pag-IBIG No.", "Employee Share", "Employer Share"];
        const csvData = [
            headers,
            ...data.map(row => [
                row.empId,
                row.name,
                row.pagibigNo,
                row.employeeShare,
                row.employerShare
            ])
        ];

        // Add totals row
        const totals = data.reduce(
            (acc, row) => ({
                ee: acc.ee + row.employeeShare,
                er: acc.er + row.employerShare
            }),
            { ee: 0, er: 0 }
        );

        csvData.push([
            "TOTALS", "", "",
            totals.ee.toFixed(2),
            totals.er.toFixed(2)
        ]);

        const csvString = csvData
            .map(row => row.map(cell => `"${cell}"`).join(","))
            .join("\n");

        const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", `pagibig_report_${schedule}_${new Date().toISOString().split('T')[0]}.csv`);
            link.style.visibility = "hidden";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }

        setOpen(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <Button onClick={() => setOpen(true)}>
                Export Pag-IBIG Report
            </Button>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Export Pag-IBIG Report</DialogTitle>
                    <DialogDescription>
                        This will export the Pag-IBIG report for {schedule} to a CSV file.
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
    );
}