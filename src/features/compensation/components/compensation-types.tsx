"use client";

import { DataTable } from "@/components/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import { PlusCircle } from "lucide-react";
import { useState } from "react";
import { Doc } from "../../../../convex/_generated/dataModel";
import { useCompensationTypes } from "../api/compensation";
import { CompensationTypeForm } from "./compensation-type-form";

type CompensationType = Doc<"compensationTypes">;

const categoryColors = {
    "Allowance": "bg-blue-100 text-blue-800",
    "Bonus": "bg-green-100 text-green-800",
    "Benefit": "bg-purple-100 text-purple-800",
    "Other": "bg-gray-100 text-gray-800"
} as const;

const frequencyColors = {
    "Monthly": "bg-indigo-100 text-indigo-800",
    "Quarterly": "bg-cyan-100 text-cyan-800",
    "Annual": "bg-amber-100 text-amber-800",
    "One-time": "bg-rose-100 text-rose-800"
} as const;

const columns: ColumnDef<CompensationType>[] = [
    {
        accessorKey: "name",
        header: "Name",
        cell: ({ row }) => (
            <span className="font-medium">{row.getValue("name")}</span>
        )
    },

    {
        accessorKey: "category",
        header: "Category",
        cell: ({ row }) => {
            const category = row.getValue("category") as keyof typeof categoryColors;
            return (
                <Badge className={`${categoryColors[category]} border-none`}>
                    {category}
                </Badge>
            );
        }
    },

    {
        accessorKey: "frequency",
        header: "Frequency",
        cell: ({ row }) => {
            const frequency = row.getValue("frequency") as keyof typeof frequencyColors;
            return (
                <Badge className={`${frequencyColors[frequency]} border-none`}>
                    {frequency}
                </Badge>
            );
        }
    },

    {
        accessorKey: "defaultAmount",
        header: "Default Amount",
        cell: ({ row }) => {
            const amount = row.getValue("defaultAmount") as number;
            return (
                <span className="font-mono">
                    {amount ? `₱${amount.toLocaleString()}` : "-"}
                </span>
            );
        },
    },

    {
        accessorKey: "taxable",
        header: "Taxable",
        cell: ({ row }) => (
            <Badge className={row.getValue("taxable") ?
                "bg-red-100 text-red-800 border-none" :
                "bg-emerald-100 text-emerald-800 border-none"
            }>
                {row.getValue("taxable") ? "Yes" : "No"}
            </Badge>
        ),
    },
];

export function CompensationTypes() {
    const [showForm, setShowForm] = useState(false);
    const [editingType, setEditingType] = useState<CompensationType | null>(null);

    const types = useCompensationTypes();

    const handleRowClick = (type: CompensationType) => {
        setEditingType(type);
        setShowForm(true);
    };

    if (!types) return (
        <div className="flex items-center justify-center h-48 text-muted-foreground">
            Loading...
        </div>
    );

    return (
        <div className="space-y-6 p-4">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-semibold tracking-tight">Voucher Types</h2>

                <Button
                    onClick={() => {
                        setEditingType(null);
                        setShowForm(true);
                    }}
                    className="gap-2"
                >
                    <PlusCircle className="h-4 w-4" />
                    Add New Type
                </Button>
            </div>

            <div className="rounded-lg border bg-card">
                <DataTable
                    columns={columns}
                    data={types}
                    filter="name"
                    onRowClick={handleRowClick}
                    filterLabel="Name"
                />
            </div>

            {showForm && (
                <CompensationTypeForm
                    onClose={() => {
                        setShowForm(false);
                        setEditingType(null);
                    }}
                    editingType={editingType}
                />
            )}
        </div>
    );
}
