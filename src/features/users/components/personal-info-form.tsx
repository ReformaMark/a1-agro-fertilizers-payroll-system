"use client"

import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { UserProfileFormValues } from "@/features/employees/lib/schema"
import { UseFormReturn } from "react-hook-form"

interface PersonalInfoFormProps {
    form: UseFormReturn<UserProfileFormValues>
}

const GENDER_OPTIONS = [
    { value: "male", label: "Male" },
    { value: "female", label: "Female" },
]

const MARITAL_STATUS_OPTIONS = [
    { value: "single", label: "Single" },
    { value: "married", label: "Married" },
    { value: "widowed", label: "Widowed" },
    { value: "divorced", label: "Divorced" },
    { value: "separated", label: "Separated" },
]

const CONTACT_TYPE_OPTIONS = [
    { value: "mobile", label: "Mobile" },
    { value: "landline", label: "Landline" },
]

const PHONE_PATTERNS = {
    mobile: /^\+63[0-9]{10}$/, // +63 followed by 10 digits
    landline: /^\+63[0-9]{1,2}[0-9]{7,8}$/, // +63 + 1-2 digit area code + 7-8 digits
}

const PHONE_PLACEHOLDERS = {
    mobile: "+63 9XX XXX XXXX",
    landline: "+63 2 XXXX XXXX",
}

export function PersonalInfoForm({ form }: PersonalInfoFormProps) {
    return (
        <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
                <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>First Name</FormLabel>
                            <FormControl>
                                <Input {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Last Name</FormLabel>
                            <FormControl>
                                <Input {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>

            <FormField
                control={form.control}
                name="middleName"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Middle Name</FormLabel>
                        <FormControl>
                            <Input placeholder="(Optional)" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                            <Input type="email" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <div className="grid grid-cols-2 gap-4">
                <FormField
                    control={form.control}
                    name="contactType"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Contact Type</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select contact type" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {CONTACT_TYPE_OPTIONS.map(option => (
                                        <SelectItem key={option.value} value={option.value}>
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="contactNumber"
                    render={({ field }) => {
                        const watchContactType = form.watch("contactType")
                        return (
                            <FormItem>
                                <FormLabel>Contact Number</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder={PHONE_PLACEHOLDERS[watchContactType as keyof typeof PHONE_PLACEHOLDERS] || "Enter contact number"}
                                        pattern={PHONE_PATTERNS[watchContactType as keyof typeof PHONE_PATTERNS]?.source}
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )
                    }}
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <FormField
                    control={form.control}
                    name="dateOfBirth"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Date of Birth</FormLabel>
                            <FormControl>
                                <Input
                                    type="date"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="gender"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Gender</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select gender" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {GENDER_OPTIONS.map(option => (
                                        <SelectItem key={option.value} value={option.value}>
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>

            <FormField
                control={form.control}
                name="maritalStatus"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Marital Status</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select marital status" />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                {MARITAL_STATUS_OPTIONS.map(option => (
                                    <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                )}
            />
        </div>
    )
}