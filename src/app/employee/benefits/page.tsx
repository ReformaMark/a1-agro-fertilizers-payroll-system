"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BenefitRequestList } from "@/features/benefits/components/benefit-request-list"
import { useQuery } from "convex/react"
import { Briefcase, Car, Gift, GraduationCap, HeartPulse, Home } from "lucide-react"
import { api } from "../../../../convex/_generated/api"

// Map compensation types to icons
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const BENEFIT_ICONS: Record<string, any> = {
    "Base Salary": Briefcase,
    "Health Insurance": HeartPulse,
    "Transportation Allowance": Car,
    "Housing Allowance": Home,
    "Education Allowance": GraduationCap,
    "Other Benefits": Gift,
}

export default function BenefitsPage() {
    const user = useQuery(api.users.get)
    const compensationTypes = useQuery(api.compensation.getTypes, { isArchived: false })
    const activeBenefits = useQuery(api.benefits.getActiveBenefits, { userId: user?._id })

    // Filter compensation types to only show allowances and vouchers
    const availableBenefits = compensationTypes?.filter(type =>
        type.category === "Allowance" || type.category === "Benefit"
    ).map(type => ({
        title: type.name,
        description: type.description || `${type.name} for eligible employees`,
        icon: BENEFIT_ICONS[type.name] || Gift,
        status: activeBenefits?.[type.name]?.length ? "Active" : "Available",
        coverage: type.defaultAmount ? `₱${type.defaultAmount.toLocaleString()}/month` : "Variable",
        details: [
            "Standard coverage",
            "Subject to eligibility", 
            "Terms and conditions apply"
        ]
    }))

    return (
        <div className="container py-6">
            <div className="mb-6">
                <h1 className="text-3xl font-bold">Vouchers & Allowances</h1>
                <p className="text-muted-foreground">
                    View and manage your vouchers and submit requests
                </p>
            </div>

            <Tabs defaultValue="available" className="space-y-6">
                <TabsList>
                    <TabsTrigger value="available">Available Vouchers</TabsTrigger>
                    <TabsTrigger value="requests">My Requests</TabsTrigger>
                </TabsList>

                <TabsContent value="available" className="space-y-6">
                    {!availableBenefits ? (
                        <div className="grid gap-6 md:grid-cols-2">
                            {[1, 2, 3, 4].map((i) => (
                                <Card key={i}>
                                    <CardHeader>
                                        <div className="h-20 animate-pulse bg-muted rounded" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-2">
                                            <div className="h-4 animate-pulse bg-muted rounded" />
                                            <div className="h-4 animate-pulse bg-muted rounded w-2/3" />
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <div className="grid gap-6 md:grid-cols-2">
                            {availableBenefits.map((benefit) => (
                                <Card key={benefit.title}>
                                    <CardHeader>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-2">
                                                <benefit.icon className="h-5 w-5 text-primary" />
                                                <CardTitle className="text-lg">{benefit.title}</CardTitle>
                                            </div>
                                            <Badge variant={benefit.status === "Active" ? "default" : "secondary"}>
                                                {benefit.status}
                                            </Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            <div>
                                                <p className="text-sm text-muted-foreground">
                                                    {benefit.description}
                                                </p>
                                                <p className="mt-1 text-sm font-medium">
                                                    Coverage: {benefit.coverage}
                                                </p>
                                            </div>
                                            <div className="space-y-2">
                                                <p className="text-sm font-medium">Includes:</p>
                                                <ul className="text-sm text-muted-foreground list-disc pl-4 space-y-1">
                                                    {benefit.details.map((detail: string, index: number) => (
                                                        <li key={index}>{detail}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="requests">
                    <BenefitRequestList />
                </TabsContent>
            </Tabs>
        </div>
    )
} 