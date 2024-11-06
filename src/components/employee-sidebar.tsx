"use client"

import { cn } from "@/lib/utils"
import {
    BabyIcon,
    CalendarDays,
    Clock,
    HeartPulse,
    Home,
    LogOut,
    Menu,
    Settings,
    Wallet,
    FileText,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { useAuthActions } from "@convex-dev/auth/react"

const routes = [
    {
        label: "Dashboard",
        icon: Home,
        href: "/employee",
        color: "text-sky-500",
    },
    {
        label: "Leave Requests",
        icon: CalendarDays,
        href: "/employee/leaves",
        color: "text-violet-500",
    },
    {
        label: "Time & Attendance",
        icon: Clock,
        href: "/employee/attendance",
        color: "text-pink-700",
    },
    {
        label: "Requests",
        icon: FileText,
        href: "/employee/requests",
        color: "text-violet-500",
        subItems: [
            {
                label: "Benefits",
                href: "/employee/requests/benefits",
            },
            {
                label: "Loans",
                href: "/employee/requests/loans",
            },
            {
                label: "Cash Advances",
                href: "/employee/requests/cash-advances",
            },
        ],
    },
    {
        label: "Parental Leave",
        icon: BabyIcon,
        href: "/employee/parental",
        color: "text-emerald-500",
    },
    {
        label: "Compensation",
        icon: Wallet,
        href: "/employee/compensation",
        color: "text-green-700",
    },
]

const bottomRoutes = [
    {
        label: "Settings",
        icon: Settings,
        href: "/employee/settings",
        color: "text-gray-500",
    },
]

interface SidebarContentProps {
    className?: string
}

const SidebarContent = ({ className }: SidebarContentProps) => {
    const pathname = usePathname()
    const { signOut } = useAuthActions()

    return (
        <div className={cn("space-y-4 py-4 flex flex-col h-full bg-gray-900 text-white", className)}>
            <div className="px-3 py-2 flex-1">
                <Link href="/employee" className="flex items-center pl-3 mb-14">
                    <h1 className="text-2xl font-bold">
                        Employee Portal
                    </h1>
                </Link>
                <div className="space-y-1">
                    {routes.map((route) => (
                        <Link
                            key={route.href}
                            href={route.href}
                            className={cn(
                                "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-white hover:bg-white/10 rounded-lg transition",
                                pathname === route.href ? "text-white bg-white/10" : "text-zinc-400"
                            )}
                        >
                            <div className="flex items-center flex-1">
                                <route.icon className={cn("h-5 w-5 mr-3", route.color)} />
                                {route.label}
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
            <div className="px-3 py-2 border-t border-gray-700">
                {bottomRoutes.map((route) => (
                    <Link
                        key={route.href}
                        href={route.href}
                        className="text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-white hover:bg-white/10 rounded-lg transition text-zinc-400"
                    >
                        <div className="flex items-center flex-1">
                            <route.icon className={cn("h-5 w-5 mr-3", route.color)} />
                            {route.label}
                        </div>
                    </Link>
                ))}
                <button
                    onClick={() => signOut()}
                    className="text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-white hover:bg-white/10 rounded-lg transition text-zinc-400"
                >
                    <div className="flex items-center flex-1">
                        <LogOut className={cn("h-5 w-5 mr-3", "text-gray-500")} />
                        Logout
                    </div>
                </button>
            </div>
        </div>
    )
}
export function EmployeeSidebar() {
    return (
        <>
            {/* Mobile View */}
            <div className="fixed top-4 left-4 z-50 md:hidden">
                <Sheet>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <Menu className="h-6 w-6" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="p-0 bg-transparent text-white">
                        <SidebarContent />
                    </SheetContent>
                </Sheet>
            </div>

            {/* Desktop View */}
            <SidebarContent className="hidden md:flex" />
        </>
    )
}