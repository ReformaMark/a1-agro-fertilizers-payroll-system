import { SSSContributionTable } from "@/features/settings/components/sss-contribution-table"

const SystemSettingsPage = () => {
    return (
        <div className="container py-6 space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">System Settings</h1>
            
            <div className="space-y-6">
                <SSSContributionTable />
                {/* Add other settings components as needed */}
            </div>
        </div>
    )
}

export default SystemSettingsPage;