"use client"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import { useAuthActions } from "@convex-dev/auth/react"
import {
    BanknoteIcon,
    CalendarDays,
    Clock,
    Coins,
    Gift,
    Home,
    LogOut,
    Menu,
    Settings,
    Wallet
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"

const routes = [
    {
        label: "Dashboard",
        icon: Home,
        href: "/employee",
        color: "text-sky-500",
    },
    {
        label: "Attendance",
        icon: Clock,
        href: "/employee/attendance",
        color: "text-pink-700",
    },
    {
        label: "Payslip",
        icon: BanknoteIcon,
        href: "/employee/payroll",
        color: "text-emerald-500",
    },
    {
        label: "Leave Requests",
        icon: CalendarDays,
        href: "/employee/requests/leaves",
        color: "text-violet-500",
    },
    {
        label: "Vouchers",
        icon: Gift,
        href: "/employee/benefits",
        color: "text-rose-500",
    },
    {
        label: "Loans",
        icon: BanknoteIcon,
        href: "/employee/requests/loans",
        color: "text-green-500",
    },
    {
        label: "VALE",
        icon: Coins,
        href: "/employee/requests/cash-advance",
        color: "text-violet-500",
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
        <div className={cn("space-y-4 py-4 flex flex-col h-full bg-white border-r", className)}>
            <div className="px-3 py-2 flex-1">
                <Link href="/employee" className="flex flex-col items-center mb-8">
                    <div className="bg-[#8BC34A] w-full py-4 rounded-md flex flex-col items-center">
                        <Image src="/logo.svg" alt="A1 Agro" width={50} height={50} className="size-16" />
                        <h1 className="text-sm font-semibold text-center text-white mt-2 px-2">
                            A1 Agro Fertilizer and Chemical Supply
                        </h1>
                    </div>
                </Link>
                <div className="space-y-1">
                    {routes.map((route) => (
                        <Link
                            key={route.href}
                            href={route.href}
                            className={cn(
                                "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:bg-gray-100 rounded-lg transition",
                                pathname === route.href ? "text-[#8BC34A] bg-gray-100" : "text-gray-600"
                            )}
                        >
                            <div className="flex items-center flex-1">
                                <route.icon className={cn("h-5 w-5 mr-3",
                                    pathname === route.href ? "text-[#8BC34A]" : "text-gray-500"
                                )} />
                                {route.label}
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
            <div className="px-3 py-2 border-t">
                {bottomRoutes.map((route) => (
                    <Link
                        key={route.href}
                        href={route.href}
                        className={cn(
                            "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:bg-gray-100 rounded-lg transition",
                            pathname === route.href ? "text-[#8BC34A] bg-gray-100" : "text-gray-600"
                        )}
                    >
                        <div className="flex items-center flex-1">
                            <route.icon className={cn("h-5 w-5 mr-3",
                                pathname === route.href ? "text-[#8BC34A]" : "text-gray-500"
                            )} />
                            {route.label}
                        </div>
                    </Link>
                ))}
                <button
                    onClick={() => {
                        signOut()
                        window.location.href = "/auth"
                    }}
                    className="text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:bg-gray-100 rounded-lg transition text-gray-600"
                >
                    <div className="flex items-center flex-1">
                        <LogOut className="h-5 w-5 mr-3 text-gray-500" />
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
                        <Button variant="ghost" size="icon" className="text-gray-700">
                            <Menu className="h-6 w-6" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="p-0 w-72">
                        <SidebarContent />
                    </SheetContent>
                </Sheet>
            </div>

            {/* Desktop View */}
            <SidebarContent className="hidden md:flex w-72" />
        </>
    )
}