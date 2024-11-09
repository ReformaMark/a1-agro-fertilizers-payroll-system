"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form } from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { useMutation, useQuery } from "convex/react"
import { api } from "../../../../convex/_generated/api"
import { toast } from "sonner"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { UserProfileFormValues, userProfileSchema } from "@/features/employees/lib/schema"
import { PersonalInfoForm } from "./personal-info-form"

export function ProfileForm() {
    const userProfile = useQuery(api.users.getUserProfile)
    const updateProfile = useMutation(api.users.updateUserProfile)

    const form = useForm<UserProfileFormValues>({
        resolver: zodResolver(userProfileSchema),
        // Set default values from userProfile
        values: userProfile ? {
            firstName: userProfile.firstName,
            lastName: userProfile.lastName,
            middleName: userProfile.middleName ?? "",
            email: userProfile.email,
            contactNumber: userProfile.contactNumber ?? "",
            dateOfBirth: userProfile.dateOfBirth,
            gender: userProfile.gender,
            maritalStatus: userProfile.maritalStatus,
            contactType: userProfile.contactType,
        } : undefined,
    })

    async function onSubmit(data: UserProfileFormValues) {
        try {
            await updateProfile(data)
            toast.success("Profile updated successfully")
        } catch (error) {
            toast.error("Failed to update profile")
            console.error(error)
        }
    }

    if (!userProfile) {
        return (
            <div className="flex items-center justify-center h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        )
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Personal Information</CardTitle>
                        <CardDescription>
                            Update your personal information here.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <PersonalInfoForm form={form} />
                    </CardContent>
                    <CardFooter>
                        <Button
                            type="submit"
                            disabled={!form.formState.isDirty || form.formState.isSubmitting}
                            className="ml-auto"
                        >
                            {form.formState.isSubmitting && (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            Save Changes
                        </Button>
                    </CardFooter>
                </Card>
            </form>
        </Form>
    )
}