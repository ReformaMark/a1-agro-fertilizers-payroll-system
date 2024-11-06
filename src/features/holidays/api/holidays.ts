import { useQuery, useMutation } from "convex/react"
import { api } from "../../../../convex/_generated/api"

export function useHolidays(
    year?: string,
    type?: string,
    location?: string,
    isArchived?: boolean,
) {
    return useQuery(api.holidays.getHolidays, {
        year,
        type,
        location,
        isArchived,
    })
}

export function useCreateHoliday() {
    return useMutation(api.holidays.createHoliday)
}

export function useUpdateHoliday() {
    return useMutation(api.holidays.updateHoliday)
}

export function useArchiveHoliday() {
    return useMutation(api.holidays.archiveHoliday)
}

export function useRestoreHoliday() {
    return useMutation(api.holidays.restoreHoliday)
} 