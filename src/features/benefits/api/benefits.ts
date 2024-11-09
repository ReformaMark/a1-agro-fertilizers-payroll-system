import { useCallback } from "react"
import { useMutation, useQuery } from "convex/react"
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

export function useIssueVoucher() {
    const issue = useMutation(api.benefits.issue)

    return useCallback(async (values: {
        userId: string
        type: string
        amount?: number
        description?: string
    }) => {
        return await issue(values)
    }, [issue])
}

export function useUpdateVoucherStatus() {
    const updateStatus = useMutation(api.benefits.updateBenefitRequestStatus)

    return useCallback(async (values: {
        requestId: Id<"benefitRequests">
        status: string
        rejectionReason?: string
    }) => {
        return await updateStatus(values)
    }, [updateStatus])
}

export function useActiveBenefits(userId?: Id<"users">) {
    return useQuery(api.benefits.getActiveBenefits, { userId })
} 