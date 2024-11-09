import { ConvexClientProvider } from "@/components/convex-client-provider"
import { EmployeeGuard } from "@/components/employee-guard"
import { EmployeeHeader } from "@/components/employee-header"
import { EmployeeSidebar } from "@/components/employee-sidebar"
import { SidebarProvider } from "@/components/ui/sidebar"
import { RequireProfileCompletion } from "@/features/auth/components/require-profile-completion"
import { Toaster } from "sonner"

export default function EmployeeLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <ConvexClientProvider>
            <EmployeeGuard>
                <RequireProfileCompletion>
                    <div className="flex min-h-screen">
                        <SidebarProvider>
                            <EmployeeSidebar />
                            <div className="flex-1 flex flex-col">
                                <EmployeeHeader />
                                <main className="flex-1 overflow-y-auto p-6">
                                    {children}
                                </main>
                                <Toaster />
                            </div>
                        </SidebarProvider>
                    </div>
                </RequireProfileCompletion>
            </EmployeeGuard>
        </ConvexClientProvider>
    )
}