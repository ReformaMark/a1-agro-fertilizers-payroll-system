
import { useQuery, useMutation } from "convex/react"
import { api } from "../../../../convex/_generated/api"
import { Id } from "../../../../convex/_generated/dataModel"

export function useCompensationTypes() {
    return useQuery(api.compensation.getTypes, {
        isArchived: false,
    })
}

export function useEmployeeCompensations(
    userId?: Id<"users">,
    status?: string,
) {
    return useQuery(api.compensation.getEmployeeCompensations, {
        userId,
        status,
    })
}

export function useCreateCompensationType() {
    return useMutation(api.compensation.createType)
}

export function useUpdateCompensationType() {
    return useMutation(api.compensation.updateType)
}

export function useCreateAdjustment() {
    return useMutation(api.compensation.createAdjustment)
}

export function useEmployee(userId: Id<"users">) {
    return useQuery(api.users.getEmployee, { userId })
}

export function useValidateAdjustment() {
    return useMutation(api.compensation.validateAdjustment)
}