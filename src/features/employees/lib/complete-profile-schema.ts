import { UseFormReturn } from "react-hook-form"
import { z } from "zod"

export const completeProfileSchema = z.object({
    // Employment Info
    department: z.string().min(1, "Department is required"),
    position: z.string().min(1, "Position is required"),
    hiredDate: z.string().min(1, "Hire date is required"),

    // Address Info
    region: z.string().min(1, "Region is required"),
    province: z.string().min(1, "Province is required"),
    city: z.string().min(1, "City is required"),
    barangay: z.string().min(1, "Barangay is required"),
    postalCode: z.string().min(1, "Postal code is required"),
    street: z.string().min(1, "Street is required"),
    houseNumber: z.string().min(1, "House number is required"),

    // Payroll Info
    ratePerDay: z.number().min(0, "Rate per day must be greater than 0"),
    philHealthNumber: z.string().min(1, "PhilHealth number is required"),
    philHealthContribution: z.number().min(0, "PhilHealth contribution must be greater than 0"),
    philHealthSchedule: z.enum(["1st half", "2nd half"]),

    pagIbigNumber: z.string().min(1, "Pag-IBIG number is required"),
    pagIbigContribution: z.number().min(0, "Pag-IBIG contribution must be greater than 0"),
    pagIbigSchedule: z.enum(["1st half", "2nd half"]),

    sssNumber: z.string().min(1, "SSS number is required"),
    sssContribution: z.number().min(0, "SSS contribution must be greater than 0"),
    sssSchedule: z.enum(["1st half", "2nd half"]),

    birTin: z.string().min(1, "BIR TIN is required"),
    incomeTax: z.number().min(0, "Income tax must be greater than 0"),
    incomeTaxSchedule: z.enum(["1st half", "2nd half"]),
})

export type CompleteProfileValues = z.infer<typeof completeProfileSchema>

export type FormStepProps = {
    form: UseFormReturn<CompleteProfileValues>
}