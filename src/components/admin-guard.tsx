"use client"

import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { useCheckRole } from "@/features/auth/api/use-check-role"
import { useConvexAuth } from "convex/react"

export function AdminGuard({ children }: { children: React.ReactNode }) {
    const router = useRouter()
    const { isAuthenticated, isLoading: isAuthLoading } = useConvexAuth()
    const { data: role, isLoading: isRoleLoading } = useCheckRole()

    useEffect(() => {
        if (!isAuthLoading && !isRoleLoading) {
            if (!isAuthenticated) {
                router.push("/")
                return
            }

            if (role !== "admin") {
                router.push("/employee")
                return
            }
        }
    }, [isAuthenticated, isAuthLoading, isRoleLoading, role, router])

    // Show nothing while checking authentication and role
    if (isAuthLoading || isRoleLoading) {
        return null // Or a loading spinner
    }

    // Only render children if authenticated and admin
    if (isAuthenticated && role === "admin") {
        return <>{children}</>
    }

    return null
}