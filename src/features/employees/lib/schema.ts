import { z } from "zod"

export const MIN_AGE = 16;
export const MAX_AGE = 65;

function isAtLeastAge(dob: Date, minAge: number): boolean {
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }

    return age >= minAge;
}

function isUnderAge(dob: Date, maxAge: number): boolean {
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }

    return age <= maxAge;
}

function isValidPhoneNumber(val: string, type: "mobile" | "landline"): boolean {
    if (!val) return false;

    // Check for repeating digits after +63
    const digits = val.slice(3); // Remove +63
    const hasRepeatingDigits = /^(.)\1+$/.test(digits);
    if (hasRepeatingDigits) return false;

    if (type === "mobile") {
        // Mobile: +63 followed by 10 digits, first digit should be 9
        return /^\+639\d{9}$/.test(val);
    }

    // Landline: +63 followed by 1-2 digit area code and 7-8 digits
    return /^\+63[2-8]\d{0,1}[0-9]{7,8}$/.test(val);
}

const nameRegex = /^[A-Za-z\s'-]+$/;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const employeeFormSchema: z.ZodObject<any> = z.object({
    _id: z.string().optional(),
    image: z.string().optional(),
    email: z.string().email().max(50, "Email must not exceed 50 characters"),
    password: z.string().min(8).max(25, "Password must not exceed 25 characters"),
    firstName: z.string()
        .min(2, "First name must be at least 2 characters")
        .max(50, "First name must not exceed 50 characters")
        .regex(nameRegex, "First name must contain only letters, spaces, hyphens and apostrophes"),
    middleName: z.string().max(50, "Middle name must not exceed 50 characters").optional(),
    lastName: z.string()
        .min(2, "Last name must be at least 2 characters")
        .max(50, "Last name must not exceed 50 characters")
        .regex(nameRegex, "Last name must contain only letters, spaces, hyphens and apostrophes"),
    dateOfBirth: z.date({
        required_error: "Date of birth is required",
    })
        .refine((date) => isAtLeastAge(date, MIN_AGE), {
            message: `Employee must be at least ${MIN_AGE} years old`,
        })
        .refine((date) => isUnderAge(date, MAX_AGE), {
            message: `Employee must be under ${MAX_AGE} years old`,
        }),
    gender: z.enum(["male", "female"]),
    maritalStatus: z.enum(["single", "married", "widowed", "divorced", "separated"]),
    contactType: z.enum(["mobile", "landline"]),
    contactNumber: z.string()
        .max(50, "Contact number must not exceed 50 characters")
        .refine((val: string): boolean => {
            if (!val) return false;
            const type = employeeFormSchema.shape.contactType._def.values[0] as "mobile" | "landline";
            return isValidPhoneNumber(val, type);
        }, {
            message: "Invalid phone number format. Mobile should start with +639 followed by 9 unique digits. Landline should be +63 followed by area code and 7-8 digits."
        }),
    department: z.string().min(2, "Department must be at least 2 characters").max(50, "Department must not exceed 50 characters"),
    position: z.string().min(2, "Position must be at least 2 characters").max(50, "Position must not exceed 50 characters"),
    hiredDate: z.string().max(50, "Hired date must not exceed 50 characters"),
    region: z.string().max(50, "Region must not exceed 50 characters"),
    province: z.string().max(50, "Province must not exceed 50 characters"),
    city: z.string().max(50, "City must not exceed 50 characters"),
    barangay: z.string().max(50, "Barangay must not exceed 50 characters"),
    postalCode: z.string().max(50, "Postal code must not exceed 50 characters"),
    street: z.string().max(50, "Street must not exceed 50 characters"),
    houseNumber: z.string().max(50, "House number must not exceed 50 characters"),
    ratePerDay: z.number()
        .min(300, "Rate per day must be at least ₱300")
        .max(5000, "Rate per day cannot exceed ₱5,000")
        .positive("Rate per day must be greater than 0"),
    philHealthNumber: z.string()
        .max(50, "PhilHealth number must not exceed 50 characters")
        .regex(/^\d{2}-\d{9}-\d{1}$/, {
            message: "Invalid PhilHealth number format. Should be XX-XXXXXXXXX-X"
        }),
    pagIbigNumber: z.string()
        .max(50, "Pag-IBIG number must not exceed 50 characters")
        .regex(/^\d{4}-\d{4}-\d{4}$/, {
            message: "Invalid Pag-IBIG number format. Should be XXXX-XXXX-XXXX"
        }),
    sssNumber: z.string()
        .max(50, "SSS number must not exceed 50 characters")
        .regex(/^\d{2}-\d{7}-\d{1}$/, {
            message: "Invalid SSS number format. Should be XX-XXXXXXX-X"
        }),
    birTin: z.string().max(50, "BIR TIN must not exceed 50 characters"),
    philHealthContribution: z.number().nonnegative("PhilHealth contribution cannot be negative"),
    pagIbigContribution: z.number().nonnegative("Pag-IBIG contribution cannot be negative"),
    sssContribution: z.number().nonnegative("SSS contribution cannot be negative"),
    incomeTax: z.number().nonnegative("Income tax cannot be negative"),
    philHealthSchedule: z.enum(["1st half", "2nd half"]),
    pagIbigSchedule: z.enum(["1st half", "2nd half"]),
    sssSchedule: z.enum(["1st half", "2nd half"]),
    incomeTaxSchedule: z.enum(["1st half", "2nd half"]),
    employeeTypeId: z.string()
        .max(50, "Employee ID must not exceed 50 characters")
        .regex(/^\d{4}\d{3}\d{4}$/, {
            message: "Invalid employee ID format. Should be YYYY-MMM-SSMS format"
        }),
})

export type EmployeeFormValues = z.infer<typeof employeeFormSchema>

export const editEmployeeSchema = z.object({
    firstName: z.string()
        .min(2, "First name must be at least 2 characters *")
        .max(50, "First name must not exceed 50 characters *")
        .regex(nameRegex, "First name must contain only letters, spaces, hyphens and apostrophes *"),
    middleName: z.optional(z.string().max(50, "Middle name must not exceed 50 characters *")),
    lastName: z.string()
        .min(2, "Last name must be at least 2 characters *")
        .max(50, "Last name must not exceed 50 characters *")
        .regex(nameRegex, "Last name must contain only letters, spaces, hyphens and apostrophes *"),
    image: z.string().max(50, "Image URL must not exceed 50 characters *").optional(),
    maritalStatus: z.enum(["single", "married", "widowed", "divorced", "separated"], {
        required_error: "Marital status is required *"
    }),
    department: z.string().min(2, "Department must be at least 2 characters *").max(50, "Department must not exceed 50 characters *"),
    position: z.string().min(2, "Position must be at least 2 characters *").max(50, "Position must not exceed 50 characters *"),
    hiredDate: z.string().min(1, "Hired date is required *").max(50, "Hired date must not exceed 50 characters *"),
    region: z.string().min(1, "Region is required *").max(50, "Region must not exceed 50 characters *"),
    province: z.string().min(1, "Province is required *").max(50, "Province must not exceed 50 characters *"),
    city: z.string().min(1, "City is required *").max(50, "City must not exceed 50 characters *"),
    barangay: z.string().min(1, "Barangay is required *").max(50, "Barangay must not exceed 50 characters *"),
    postalCode: z.string().min(1, "Postal code is required *").max(50, "Postal code must not exceed 50 characters *"),
    street: z.string().min(1, "Street is required *").max(50, "Street must not exceed 50 characters *"),
    houseNumber: z.string().min(1, "House number is required *").max(50, "House number must not exceed 50 characters *"),
    ratePerDay: z.number({
        required_error: "Rate per day is required *",
        invalid_type_error: "Rate per day must be a number *"
    })
        .min(300, "Rate per day must be at least ₱300 *")
        .max(5000, "Rate per day cannot exceed ₱5,000 *")
        .positive("Rate per day must be greater than 0 *"),
    philHealthNumber: z.string()
        .min(1, "PhilHealth number is required *")
        .max(50, "PhilHealth number must not exceed 50 characters *")
        .regex(/^\d{2}-\d{9}-\d{1}$/, {
            message: "Invalid PhilHealth number format. Should be XX-XXXXXXXXX-X *"
        }),
    pagIbigNumber: z.string()
        .min(1, "Pag-IBIG number is required *")
        .max(50, "Pag-IBIG number must not exceed 50 characters *")
        .regex(/^\d{4}-\d{4}-\d{4}$/, {
            message: "Invalid Pag-IBIG number format. Should be XXXX-XXXX-XXXX *"
        }),
    sssNumber: z.string()
        .min(1, "SSS number is required *")
        .max(50, "SSS number must not exceed 50 characters *")
        .regex(/^\d{2}-\d{7}-\d{1}$/, {
            message: "Invalid SSS number format. Should be XX-XXXXXXX-X *"
        }),
    birTin: z.string().min(1, "BIR TIN is required *").max(50, "BIR TIN must not exceed 50 characters *"),
    philHealthContribution: z.number({
        required_error: "PhilHealth contribution is required *",
        invalid_type_error: "PhilHealth contribution must be a number *"
    }).nonnegative("PhilHealth contribution cannot be negative *"),
    pagIbigContribution: z.number({
        required_error: "Pag-IBIG contribution is required *",
        invalid_type_error: "Pag-IBIG contribution must be a number *"
    }).nonnegative("Pag-IBIG contribution cannot be negative *"),
    sssContribution: z.number({
        required_error: "SSS contribution is required *",
        invalid_type_error: "SSS contribution must be a number *"
    }).nonnegative("SSS contribution cannot be negative *"),
    incomeTax: z.number({
        required_error: "Income tax is required *",
        invalid_type_error: "Income tax must be a number *"
    }).nonnegative("Income tax cannot be negative *"),
    philHealthSchedule: z.enum(["1st half", "2nd half"], {
        required_error: "PhilHealth schedule is required *"
    }),
    pagIbigSchedule: z.enum(["1st half", "2nd half"], {
        required_error: "Pag-IBIG schedule is required *"
    }),
    sssSchedule: z.enum(["1st half", "2nd half"], {
        required_error: "SSS schedule is required *"
    }),
    incomeTaxSchedule: z.enum(["1st half", "2nd half"], {
        required_error: "Income tax schedule is required *"
    }),
})

export type EditEmployeeValues = z.infer<typeof editEmployeeSchema>

export const userProfileSchema = z.object({
    firstName: z.string()
        .min(2, "First name must be at least 2 characters")
        .max(50, "First name must not exceed 50 characters")
        .regex(nameRegex, "First name must contain only letters, spaces, hyphens and apostrophes"),
    lastName: z.string()
        .min(2, "Last name must be at least 2 characters")
        .max(50, "Last name must not exceed 50 characters")
        .regex(nameRegex, "Last name must contain only letters, spaces, hyphens and apostrophes"),
    middleName: z.string()
        .regex(nameRegex, "Middle name must contain only letters, spaces, hyphens and apostrophes")
        .optional(),
    email: z.string().email("Invalid email address"),
    contactNumber: z.string().optional(),
    dateOfBirth: z.string(),
    gender: z.enum(["male", "female"]),
    maritalStatus: z.enum(["single", "married", "widowed", "divorced", "separated"]),
    contactType: z.enum(["mobile", "landline"]),
});

export type UserProfileFormValues = z.infer<typeof userProfileSchema>;
