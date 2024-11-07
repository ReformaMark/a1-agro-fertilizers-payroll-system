import { ConvexClientProvider } from "@/components/convex-client-provider"
import { EmployeeSidebar } from "@/components/employee-sidebar"
import { SidebarProvider } from "@/components/ui/sidebar"

export default function EmployeeLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <ConvexClientProvider>
            <div className="flex min-h-screen">
                <SidebarProvider>
                    <EmployeeSidebar />
                    <div className="flex-1 flex flex-col md:ml-32">
                        <main className="flex-1 overflow-y-auto container">
                            {children}
                        </main>
                    </div>
                </SidebarProvider>
            </div>
        </ConvexClientProvider>
    )
}