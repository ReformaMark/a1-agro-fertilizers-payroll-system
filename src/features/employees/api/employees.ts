import { useQuery, useMutation } from "convex/react"
import { api } from "../../../../convex/_generated/api"

export function useEmployees(
  department?: string,
  status?: string
) {
  return useQuery(api.users.getEmployees, {
    department,
    status
  })
}