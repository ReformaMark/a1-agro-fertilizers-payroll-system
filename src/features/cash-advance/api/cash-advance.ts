import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";

export function useCashAdvanceRequests(
    userId?: Id<"users">,
    status?: string
) {
    return useQuery(api.cashAdvance.list, { userId, status });
}

export function useCreateCashAdvanceRequest() {
    return useMutation(api.cashAdvance.create);
}

export function useUpdateCashAdvanceStatus() {
    return useMutation(api.cashAdvance.updateStatus);
}
