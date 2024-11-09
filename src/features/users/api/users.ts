import { useQuery } from "convex/react"
import { api } from "../../../../convex/_generated/api"

export function useUsers() {
    return useQuery(api.users.list)
} 