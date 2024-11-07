"use client"

import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { useCheckRole } from "@/features/auth/api/use-check-role"
import { useConvexAuth } from "convex/react"

export function RoleCheck() {
    const router = useRouter()
    const { isAuthenticated, isLoading: isAuthLoading } = useConvexAuth()
    const { data: role, isLoading: isRoleLoading } = useCheckRole()

    useEffect(() => {
        if (!isAuthLoading && !isRoleLoading && isAuthenticated) {
            if (role === "admin") {
                router.push("/admin")
            } else {
                router.push("/employee")
            }
        }
    }, [isAuthenticated, isAuthLoading, isRoleLoading, role, router])

    return null
}