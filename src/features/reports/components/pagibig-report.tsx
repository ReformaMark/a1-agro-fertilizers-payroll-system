"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";

export function PagibigReport() {
    const [dateRange, setDateRange] = useState("2024-10-16 2024-10-31");

    return (
        <Card className="p-6">
            <h1 className="text-2xl font-bold tracking-tight mb-6">Pag-IBIG Report</h1>
            <div className="flex justify-between items-center mb-6">
                <Select defaultValue={dateRange} onValueChange={setDateRange}>
                    <SelectTrigger className="w-[240px]">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="2024-10-16 2024-10-31">2024-10-16 2024-10-31</SelectItem>
                    </SelectContent>
                </Select>

                <div className="flex gap-2">
                    <Button variant="outline">Search</Button>
                    <Button>Export to CSV</Button>
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
                        {/* Table rows will go here */}
                    </tbody>
                    <tfoot className="bg-muted font-medium">
                        <tr>
                            <td colSpan={3} className="border p-2 text-right">Totals:</td>
                            <td className="border p-2 text-right">Total EE Share: ₱0.00</td>
                            <td className="border p-2 text-right">Total ER Share: ₱0.00</td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </Card>
    );
}