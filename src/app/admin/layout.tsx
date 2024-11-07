import { AppSidebar } from "@/components/app-sidebar"
import { ConvexClientProvider } from "@/components/convex-client-provider"
import { SidebarProvider } from "@/components/ui/sidebar"
import { Toaster } from "sonner"
import { AdminGuard } from "../../components/admin-guard"

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <ConvexClientProvider>
            <AdminGuard>
                <SidebarProvider>
                    <AppSidebar />
                    <div className="flex flex-col min-h-screen bg-white container mx-auto">
                        {children}
                        <Toaster />
                    </div>
                </SidebarProvider>
            </AdminGuard>
        </ConvexClientProvider>
    )
} 