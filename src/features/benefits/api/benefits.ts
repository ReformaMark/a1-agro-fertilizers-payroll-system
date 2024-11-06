import { useQuery, useMutation } from "convex/react"
import { api } from "../../../../convex/_generated/api"
import { Id } from "../../../../convex/_generated/dataModel"

export function useBenefitRequests(
    userId?: Id<"users">,
    status?: string,
) {
    return useQuery(api.benefits.getBenefitRequests, {
        userId,
        status,
    })
}

export function useCreateBenefitRequest() {
    return useMutation(api.benefits.createBenefitRequest)
}

export function useUpdateBenefitRequestStatus() {
    return useMutation(api.benefits.updateBenefitRequestStatus)
} 