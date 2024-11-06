import { z } from "zod"

export const employeeFormSchema = z.object({
  // Auth & Role
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["admin", "employee"]),

  // Personal Info
  firstName: z.string().min(1, "First name is required"),
  middleName: z.string().optional(),
  lastName: z.string().min(1, "Last name is required"),
  image: z.string().optional(),
  dateOfBirth: z.string(),
  gender: z.enum(["male", "female"]),
  maritalStatus: z.enum(["single", "married", "widowed", "divorced", "separated"]),
  contactType: z.enum(["mobile", "landline"]),
  contactNumber: z.string(),

  // Employment Info
  employeeTypeId: z.string(),
  department: z.string(),
  position: z.string(),
  hiredDate: z.string(),

  // Address Info
  region: z.string(),
  province: z.string(),
  city: z.string(),
  barangay: z.string(),
  postalCode: z.string(),
  street: z.string(),
  houseNumber: z.string(),

  // Payroll Info
  ratePerDay: z.number().min(0),
  philHealthNumber: z.string().optional(),
  pagIbigNumber: z.string().optional(),
  sssNumber: z.string().optional(),
  birTin: z.string().optional(),
  philHealthContribution: z.number().optional(),
  pagIbigContribution: z.number().optional(),
  sssContribution: z.number().optional(),
  incomeTax: z.number().optional(),
  
  // Payment Schedules
  philHealthSchedule: z.enum(["1st", "2nd"]),
  pagIbigSchedule: z.enum(["1st", "2nd"]),
  sssSchedule: z.enum(["1st", "2nd"]),
  incomeTaxSchedule: z.enum(["1st", "2nd"]),
})

export type EmployeeFormValues = z.infer<typeof employeeFormSchema> 