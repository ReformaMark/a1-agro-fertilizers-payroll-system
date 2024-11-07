import { useQuery, useMutation } from "convex/react"
import { api } from "../../../../../convex/_generated/api"
import { Id } from "../../../../../convex/_generated/dataModel"

export function useCompanyLoans(
    userId?: Id<"users">,
    status?: string,
) {
    return useQuery(api.loans.getCompanyLoans, {
        userId,
        status,
    })
}

export function useGovernmentLoans(
    userId?: Id<"users">,
    status?: string,
) {
    return useQuery(api.loans.getGovernmentLoans, {
        userId,
        status,
    })
}

export function useCreateCompanyLoan() {
    return useMutation(api.loans.createCompanyLoan)
}

export function useCreateGovernmentLoan() {
    return useMutation(api.loans.createGovernmentLoan)
}

export function useUpdateLoanStatus() {
    return useMutation(api.loans.updateLoanStatus)
} 