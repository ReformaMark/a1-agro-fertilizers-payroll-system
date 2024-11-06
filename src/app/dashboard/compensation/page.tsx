import { CompensationTabs } from "@/features/compensation/components/compensation-tabs"

export default function CompensationPage() {
    return (
        <div className="container py-6">
            <div className="mb-6">
                <h1 className="text-3xl font-bold">Compensation Management</h1>
                <p className="text-muted-foreground">
                    Manage employee compensations, types, and adjustments
                </p>
            </div>
            <CompensationTabs />
        </div>
    )
} 