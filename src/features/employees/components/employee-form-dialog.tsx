/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Form } from "@/components/ui/form"
import { getConvexErrorMessage } from "@/lib/utils"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation } from "convex/react"
import { Loader2, UserPlus } from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { api } from "../../../../convex/_generated/api"
import { Id } from "../../../../convex/_generated/dataModel"
import { employeeFormSchema, EmployeeFormValues } from "../lib/schema"
import { AddressInfoForm } from "./forms/address-info-form"
import { EmploymentInfoForm } from "./forms/employment-info-form"
import { PayrollInfoForm } from "./forms/payroll-info-form"
import { PersonalInfoForm } from "./forms/personal-info-form"
import { ImageUpload } from "./image-upload"
import { generateEmployeeId } from "@/lib/utils"
import { ScrollArea } from "@/components/ui/scroll-area"

export function EmployeeFormDialog() {
    const [open, setOpen] = useState(false)
    const [step, setStep] = useState(1)
    const [, setCreatedUserId] = useState<Id<"users"> | null>(null)
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const createEmployee = useMutation(api.users.createEmployee)
    const generateUploadUrl = useMutation(api.users.generateUploadUrl)
    const updateProfileImage = useMutation(api.users.updateProfileImage)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isUploading, setIsUploading] = useState(false)

    const form = useForm<EmployeeFormValues>({
        resolver: zodResolver(employeeFormSchema),
        defaultValues: {
            _id: undefined,
            image: undefined,
            employeeTypeId: generateEmployeeId(),
            philHealthSchedule: "1st half",
            pagIbigSchedule: "1st half",
            sssSchedule: "1st half",
            incomeTaxSchedule: "1st half",
            philHealthContribution: 0,
            pagIbigContribution: 0,
            sssContribution: 0,
            incomeTax: 0,
            ratePerDay: 0,
        }
    })

    async function onSubmit(data: EmployeeFormValues) {
        if (isSubmitting) return;

        try {
            setIsSubmitting(true)
            const { _id, image, dateOfBirth, ...submitData } = data

            const formattedDate = {
                ...submitData,
                dateOfBirth: dateOfBirth.toISOString().split('T')[0],
            }

            const result = await createEmployee(formattedDate)

            if (!result) {
                toast.error("Failed to create employee", {
                    description: "The server did not return a valid response"
                })
                return;
            }

            const newUserId = result._id

            if (selectedFile) {
                setIsUploading(true)
                try {
                    const postUrl = await generateUploadUrl()

                    const uploadResult = await fetch(postUrl, {
                        method: "POST",
                        headers: { "Content-Type": selectedFile.type },
                        body: selectedFile,
                    })

                    if (!uploadResult.ok) {
                        throw new Error(`Upload failed with status: ${uploadResult.status}`)
                    }

                    const { storageId } = await uploadResult.json()

                    await updateProfileImage({
                        userId: newUserId,
                        storageId,
                    })
                } catch (uploadError) {
                    toast.error("Profile image upload failed", {
                        description: getConvexErrorMessage(uploadError as Error)
                    })
                } finally {
                    setIsUploading(false)
                }
            }

            toast.success("Employee added successfully", {
                description: "New employee account has been created"
            })

            setOpen(false)
            form.reset()
            setStep(1)
            setSelectedFile(null)
            setCreatedUserId(null)

        } catch (error) {
            toast.error("Failed to add employee", {
                description: getConvexErrorMessage(error as Error)
            })
        } finally {
            setIsSubmitting(false)
            setIsUploading(false)
        }
    }

    const nextStep = (e: React.MouseEvent) => {
        e.preventDefault()
        const fields = getFieldsForStep(step)
        form.trigger(fields as Array<keyof EmployeeFormValues>).then((isValid) => {
            if (isValid) {
                setStep(step + 1)
            } else {
                toast.error("Please fill in all required fields correctly")
            }
        })
    }

    const previousStep = () => {
        setStep(step - 1)
    }

    const getFieldsForStep = (currentStep: number): Array<keyof EmployeeFormValues> => {
        switch (currentStep) {
            case 1:
                return ["email", "password", "firstName", "middleName", "lastName", "dateOfBirth", "gender", "maritalStatus", "contactType", "contactNumber"]
            case 2:
                return ["department", "position", "hiredDate"]
            case 3:
                return ["region", "province", "city", "barangay", "postalCode", "street", "houseNumber"]
            case 4:
                return ["ratePerDay", "philHealthNumber", "pagIbigNumber", "sssNumber", "birTin", "philHealthContribution", "pagIbigContribution", "sssContribution", "incomeTax", "philHealthSchedule", "pagIbigSchedule", "sssSchedule", "incomeTaxSchedule"]
            default:
                return []
        }
    }

    const handleClose = () => {
        if (isSubmitting || isUploading) return;
        setOpen(false)
        form.reset()
        setStep(1)
        setSelectedFile(null)
        setCreatedUserId(null)
        setIsSubmitting(false)
        setIsUploading(false)
    }

    const handleOpenChange = (newOpen: boolean) => {
        if (!newOpen) {
            handleClose()
        } else {
            setOpen(true)
        }
    }

    return (
        <Dialog
            open={open}
            onOpenChange={handleOpenChange}
        >
            <DialogTrigger asChild>
                <Button
                    className="gap-2"
                    onClick={() => setOpen(true)}
                    disabled={isSubmitting || isUploading}
                >
                    <UserPlus className="h-4 w-4" />
                    Add Employee
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh]">
                <DialogHeader>
                    <DialogTitle>Add New Employee</DialogTitle>
                </DialogHeader>

                <ScrollArea className="h-[calc(90vh-120px)]">
                    <div className="pr-4">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                <div className="mb-6 flex justify-between">
                                    {[1, 2, 3, 4].map((stepNumber) => (
                                        <div
                                            key={stepNumber}
                                            className={`flex h-8 w-8 items-center justify-center rounded-full ${step >= stepNumber ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'}`}
                                        >
                                            {stepNumber}
                                        </div>
                                    ))}
                                </div>

                                {step === 1 && (
                                    <div className="space-y-6">
                                        <div className="flex justify-center mb-6">
                                            <ImageUpload
                                                previewMode={true}
                                                onFileSelect={setSelectedFile}
                                            />
                                        </div>
                                        <div className="max-w-3xl mx-auto">
                                            <PersonalInfoForm form={form} />
                                        </div>
                                    </div>
                                )}
                                {step === 2 && (
                                    <div className="max-w-3xl mx-auto">
                                        <EmploymentInfoForm form={form} />
                                    </div>
                                )}
                                {step === 3 && (
                                    <div className="max-w-3xl mx-auto">
                                        <AddressInfoForm form={form} />
                                    </div>
                                )}
                                {step === 4 && (
                                    <div className="max-w-3xl mx-auto">
                                        <PayrollInfoForm form={form} />
                                    </div>
                                )}

                                <div className="flex justify-end gap-2 sticky bottom-0 bg-background py-4 border-t">
                                    {step > 1 && (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={previousStep}
                                            disabled={isSubmitting}
                                        >
                                            Previous
                                        </Button>
                                    )}
                                    {step < 4 ? (
                                        <Button
                                            type="button"
                                            onClick={nextStep}
                                            disabled={isSubmitting}
                                        >
                                            Next
                                        </Button>
                                    ) : (
                                        <Button
                                            type="submit"
                                            disabled={isSubmitting || isUploading}
                                        >
                                            {isSubmitting || isUploading ? (
                                                <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    {isUploading ? 'Uploading...' : 'Creating...'}
                                                </>
                                            ) : (
                                                'Create Employee Account'
                                            )}
                                        </Button>
                                    )}
                                </div>
                            </form>
                        </Form>
                    </div>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    )
}
