import { z } from "zod"

export const employeeFormSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
    firstName: z.string().min(1),
    middleName: z.string().optional(),
    lastName: z.string().min(1),
    dateOfBirth: z.string(),
    gender: z.enum(["male", "female"]),
    maritalStatus: z.enum(["single", "married", "widowed", "divorced", "separated"]),
    contactType: z.enum(["mobile", "landline"]),
    contactNumber: z.string(),
    department: z.string(),
    position: z.string(),
    hiredDate: z.string(),
    region: z.string(),
    province: z.string(),
    city: z.string(),
    barangay: z.string(),
    postalCode: z.string(),
    street: z.string(),
    houseNumber: z.string(),
    ratePerDay: z.number(),
    philHealthNumber: z.string(),
    pagIbigNumber: z.string(),
    sssNumber: z.string(),
    birTin: z.string(),
    philHealthContribution: z.number(),
    pagIbigContribution: z.number(),
    sssContribution: z.number(),
    incomeTax: z.number(),
    philHealthSchedule: z.enum(["1st half", "2nd half"]),
    pagIbigSchedule: z.enum(["1st half", "2nd half"]),
    sssSchedule: z.enum(["1st half", "2nd half"]),
    incomeTaxSchedule: z.enum(["1st half", "2nd half"]),
})

export type EmployeeFormValues = z.infer<typeof employeeFormSchema> 