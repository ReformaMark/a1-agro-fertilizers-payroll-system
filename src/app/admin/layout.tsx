import { AppSidebar } from "@/components/app-sidebar"
import { AdminHeader } from "@/components/admin-header"
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
                <div className="flex min-h-screen">
                    <SidebarProvider>
                        <AppSidebar />
                        <div className="flex-1 flex flex-col">
                            <AdminHeader />
                            <main className="flex-1 overflow-y-auto p-6">
                                {children}
                            </main>
                            <Toaster />
                        </div>
                    </SidebarProvider>
                </div>
            </AdminGuard>
        </ConvexClientProvider>
    )
}