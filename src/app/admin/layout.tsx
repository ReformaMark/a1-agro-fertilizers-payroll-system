"use client"

import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <SidebarProvider>
            <AppSidebar />
            <div className="flex flex-col min-h-screen bg-white container mx-auto">
                {children}
            </div>
        </SidebarProvider>
    )
} 