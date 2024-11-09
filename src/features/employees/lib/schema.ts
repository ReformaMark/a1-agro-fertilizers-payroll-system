import { z } from "zod"



export const employeeFormSchema = z.object({

    _id: z.string().optional(),

    image: z.string().optional(),

    email: z.string().email(),

    password: z.string().min(8),

    firstName: z.string().min(1),

    middleName: z.string().optional(),

    lastName: z.string().min(1),

    dateOfBirth: z.string(),

    gender: z.enum(["male", "female"]),

    maritalStatus: z.enum(["single", "married", "widowed", "divorced", "separated"]),

    contactType: z.enum(["mobile", "landline"]),

    contactNumber: z.string()

        .refine((val) => {

            if (!val) return false

            const type = employeeFormSchema.shape.contactType

            // @ts-expect-error - TODO: fix this

            if (type === "mobile") {

                return /^\+63[0-9]{10}$/.test(val)

            }

            return /^\+63[0-9]{1,2}[0-9]{7,8}$/.test(val)

        }, {

            message: "Invalid phone number format. Mobile should be +63 followed by 10 digits. Landline should be +63 followed by area code and 7-8 digits."

        }),

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

    philHealthNumber: z.string()

        .regex(/^\d{2}-\d{9}-\d{1}$/, {

            message: "Invalid PhilHealth number format. Should be XX-XXXXXXXXX-X"

        }),

    pagIbigNumber: z.string()

        .regex(/^\d{4}-\d{4}-\d{4}$/, {

            message: "Invalid Pag-IBIG number format. Should be XXXX-XXXX-XXXX"

        }),

    sssNumber: z.string()

        .regex(/^\d{2}-\d{7}-\d{1}$/, {

            message: "Invalid SSS number format. Should be XX-XXXXXXX-X"

        }),

    birTin: z.string(),

    philHealthContribution: z.number(),

    pagIbigContribution: z.number(),

    sssContribution: z.number(),

    incomeTax: z.number(),

    philHealthSchedule: z.enum(["1st half", "2nd half"]),

    pagIbigSchedule: z.enum(["1st half", "2nd half"]),

    sssSchedule: z.enum(["1st half", "2nd half"]),

    incomeTaxSchedule: z.enum(["1st half", "2nd half"]),

    employeeTypeId: z.string()

        .regex(/^\d{4}\d{3}\d{4}$/, {

            message: "Invalid employee ID format. Should be YYYY-MMM-SSMS format"

        }),

})



export type EmployeeFormValues = z.infer<typeof employeeFormSchema>



export const editEmployeeSchema = z.object({

    firstName: z.string().min(1),

    middleName: z.string().optional(),

    lastName: z.string().min(1),

    image: z.string().optional(),

    maritalStatus: z.enum(["single", "married", "widowed", "divorced", "separated"]),

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

    philHealthNumber: z.string()

        .regex(/^\d{2}-\d{9}-\d{1}$/, {

            message: "Invalid PhilHealth number format. Should be XX-XXXXXXXXX-X"

        }),

    pagIbigNumber: z.string()

        .regex(/^\d{4}-\d{4}-\d{4}$/, {

            message: "Invalid Pag-IBIG number format. Should be XXXX-XXXX-XXXX"

        }),

    sssNumber: z.string()

        .regex(/^\d{2}-\d{7}-\d{1}$/, {

            message: "Invalid SSS number format. Should be XX-XXXXXXX-X"

        }),

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



export type EditEmployeeValues = z.infer<typeof editEmployeeSchema>


