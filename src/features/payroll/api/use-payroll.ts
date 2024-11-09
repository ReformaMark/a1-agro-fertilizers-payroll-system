import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";

export function usePayrollList({startDate, endDate, userId}: {startDate: string, endDate: string, userId: Id<'users'>}) {
    return useQuery(api.salaryComponents.getSalaryComponentsByPayrollPeriod, {startDate: startDate, endDate: endDate, userId: userId})
} 