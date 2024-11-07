import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SSSContributionTable } from "@/features/settings/components/sss-contribution-table"
import { PagibigContributionTable } from "@/features/settings/components/pagibig-contribution-table"
import { Card } from "@/components/ui/card"

const SystemSettingsPage = () => {
    return (
        <div className="container py-6 space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">System Settings</h1>
            
            <Tabs defaultValue="sss" className="space-y-4">
                <TabsList className="w-full justify-start">
                    <TabsTrigger value="sss" className="flex-1">
                        SSS Contributions
                    </TabsTrigger>
                    <TabsTrigger value="philhealth" className="flex-1">
                        PhilHealth Contributions
                    </TabsTrigger>
                    <TabsTrigger value="pagibig" className="flex-1">
                        Pag-IBIG Contributions
                    </TabsTrigger>
                    <TabsTrigger value="tax" className="flex-1">
                        Income Tax Rates
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="sss">
                    <SSSContributionTable />
                </TabsContent>

                <TabsContent value="pagibig">
                    <PagibigContributionTable />
                </TabsContent>

                <TabsContent value="philhealth">
                    <Card className="p-6">
                        <h2 className="text-xl font-semibold mb-4">PhilHealth Contribution Table</h2>
                        {/* Add PhilHealth table component here */}
                        <div className="text-muted-foreground">
                            PhilHealth contribution table will be implemented here
                        </div>
                    </Card>
                </TabsContent>

                <TabsContent value="tax">
                    <Card className="p-6">
                        <h2 className="text-xl font-semibold mb-4">Income Tax Rate Table</h2>
                        {/* Add Income Tax table component here */}
                        <div className="text-muted-foreground">
                            Income tax rate table will be implemented here
                        </div>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}

export default SystemSettingsPage