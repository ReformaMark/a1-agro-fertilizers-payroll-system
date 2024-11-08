"use client"

import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { useCheckRole } from "@/features/auth/api/use-check-role"
import { useConvexAuth } from "convex/react"

export function EmployeeGuard({ children }: { children: React.ReactNode }) {
    const router = useRouter()
    const { isAuthenticated, isLoading: isAuthLoading } = useConvexAuth()
    const { data: role, isLoading: isRoleLoading } = useCheckRole()

    useEffect(() => {
        if (!isAuthLoading && !isRoleLoading) {
            if (!isAuthenticated) {
                router.push("/auth")
                return
            }

            if (role !== "employee") {
                router.push("/admin")
                return
            }
        }
    }, [isAuthenticated, isAuthLoading, isRoleLoading, role, router])

    // Show nothing while checking authentication and role
    if (isAuthLoading || isRoleLoading) {
        return null // Or a loading spinner
    }

    // Only render children if authenticated and employee
    if (isAuthenticated && role === "employee") {
        return <>{children}</>
    }

    return null
}