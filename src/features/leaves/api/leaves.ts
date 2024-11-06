import { useQuery, useMutation } from "convex/react"
import { api } from "../../../../convex/_generated/api"
import { Id } from "../../../../convex/_generated/dataModel"

export function useLeaveRequests(
    userId?: Id<"users">,
    status?: string,
) {
    return useQuery(api.leaves.getLeaveRequests, {
        userId,
        status,
    })
}

export function useCreateLeaveRequest() {
    return useMutation(api.leaves.createLeaveRequest)
}

export function useUpdateLeaveRequestStatus() {
    return useMutation(api.leaves.updateLeaveRequestStatus)
} 