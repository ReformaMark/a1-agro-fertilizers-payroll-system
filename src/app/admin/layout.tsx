import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Metadata } from "next";
import { ConvexClientProvider } from "@/components/convex-client-provider";
import { Toaster } from "@/components/ui/sonner";
import { ConvexAuthNextjsServerProvider } from "@convex-dev/auth/nextjs/server";
import "@/lib/globals.css";

// TODO: add proper metadata
export const metadata: Metadata = {
    title: "A1 Admin",
    description: "A1 Admin",
};

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <ConvexAuthNextjsServerProvider>
            <ConvexClientProvider>
                <SidebarProvider>
                    <AppSidebar />
                    <main className="flex flex-col min-h-screen bg-white container mx-auto">
                        {children}
                    </main>
                    <Toaster />
                </SidebarProvider>
            </ConvexClientProvider>
        </ConvexAuthNextjsServerProvider>
    )
} 