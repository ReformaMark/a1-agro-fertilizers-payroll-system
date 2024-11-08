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

interface ExportPhilhealthDialogProps {
    data: {
        empId: string;
        name: string;
        philhealthNo: string;
        employeeShare: number;
        employerShare: number;
    }[];
    schedule: "1st half" | "2nd half";
}

export function ExportPhilhealthDialog({ data, schedule }: ExportPhilhealthDialogProps) {
    const [open, setOpen] = useState(false);

    const handleExport = () => {
        // Convert data to CSV format
        const headers = ["Emp. Id", "Name", "PhilHealth No.", "Employee Share", "Employer Share"];
        const csvData = [
            headers,
            ...data.map(row => [
                row.empId,
                row.name,
                row.philhealthNo,
                row.employeeShare.toFixed(2),
                row.employerShare.toFixed(2)
            ])
        ];

        // Calculate totals
        const totals = data.reduce(
            (acc, row) => ({
                ee: acc.ee + row.employeeShare,
                er: acc.er + row.employerShare
            }),
            { ee: 0, er: 0 }
        );

        // Add totals row
        csvData.push([
            "TOTALS", "", "",
            totals.ee.toFixed(2),
            totals.er.toFixed(2)
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
            link.setAttribute("download", `philhealth_report_${schedule}_${new Date().toISOString().split('T')[0]}.csv`);
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
                Export PhilHealth Report
            </Button>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Export PhilHealth Report</DialogTitle>
                    <DialogDescription>
                        This will export the PhilHealth report for {schedule} to a CSV file.
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