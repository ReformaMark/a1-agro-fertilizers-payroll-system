"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PagibigReport } from "@/features/reports/components/pagibig-report";
import { PhilhealthReport } from "@/features/reports/components/philhealth-report";
import { SSSReport } from "@/features/reports/components/sss-report";

export default function ReportsPage() {
    return (
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 lg:py-10 space-y-6 md:space-y-8">
            <div className="space-y-2">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">
                    Government Contribution Reports
                </h1>
                <p className="text-sm sm:text-base text-muted-foreground">
                    View and export contribution reports for SSS, Pag-IBIG, and PhilHealth
                </p>
            </div>

            <Tabs defaultValue="sss" className="space-y-6">
                <TabsList className="w-full sm:w-auto grid grid-cols-3 sm:inline-flex gap-1">
                    <TabsTrigger value="sss" className="whitespace-nowrap">
                        SSS Report
                    </TabsTrigger>
                    <TabsTrigger value="pagibig" className="whitespace-nowrap">
                        Pag-IBIG Report
                    </TabsTrigger>
                    <TabsTrigger value="philhealth" className="whitespace-nowrap">
                        PhilHealth Report
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="sss" className="mt-6">
                    <SSSReport />
                </TabsContent>

                <TabsContent value="pagibig" className="mt-6">
                    <PagibigReport />
                </TabsContent>

                <TabsContent value="philhealth" className="mt-6">
                    <PhilhealthReport />
                </TabsContent>
            </Tabs>
        </div>
    );
}