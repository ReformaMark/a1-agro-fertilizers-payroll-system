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
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation } from "convex/react"
import { UserPlus } from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { api } from "../../../../convex/_generated/api"
import { employeeFormSchema, EmployeeFormValues } from "../lib/schema"
import { AddressInfoForm } from "./forms/address-info-form"
import { EmploymentInfoForm } from "./forms/employment-info-form"
import { PayrollInfoForm } from "./forms/payroll-info-form"
import { PersonalInfoForm } from "./forms/personal-info-form"
import { ImageUpload } from "./image-upload"
import { Id } from "../../../../convex/_generated/dataModel"

export function EmployeeFormDialog() {
    const [open, setOpen] = useState(false)
    const [step, setStep] = useState(1)
    const [createdUserId, setCreatedUserId] = useState<Id<"users"> | null>(null)
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const createEmployee = useMutation(api.users.createEmployee)
    const generateUploadUrl = useMutation(api.users.generateUploadUrl)
    const updateProfileImage = useMutation(api.users.updateProfileImage)

    const form = useForm<EmployeeFormValues>({
        resolver: zodResolver(employeeFormSchema),
        defaultValues: {
            _id: undefined,
            image: undefined,
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
        try {
            const { _id, image, ...submitData } = data
            const result = await createEmployee(submitData)
            
            if (result) {
                const newUserId = result._id
                setCreatedUserId(newUserId)
                form.setValue("_id", newUserId as string)
                
                if (selectedFile) {
                    const postUrl = await generateUploadUrl()
                    const uploadResult = await fetch(postUrl, {
                        method: "POST",
                        headers: { "Content-Type": selectedFile.type },
                        body: selectedFile,
                    })
                    const { storageId } = await uploadResult.json()
                    
                    await updateProfileImage({
                        userId: newUserId,
                        storageId,
                    })
                }
                
                toast.success("Employee added successfully")
                setOpen(false)
                form.reset()
                setStep(1)
                setSelectedFile(null)
                setCreatedUserId(null)
            }
        } catch (error) {
            console.error("Detailed error:", error)
            toast.error(error instanceof Error ? error.message : "Failed to add employee")
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

    const handleOpenChange = (newOpen: boolean) => {
        setOpen(newOpen)
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <Button className="gap-2" onClick={() => setOpen(true)}>
                    <UserPlus className="h-4 w-4" />
                    Add Employee
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl">
                <DialogHeader>
                    <DialogTitle>Add New Employee</DialogTitle>
                </DialogHeader>

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
                                <div className="flex justify-center">
                                    <ImageUpload 
                                        previewMode={true}
                                        onFileSelect={setSelectedFile}
                                    />
                                </div>
                                <PersonalInfoForm form={form} />
                            </div>
                        )}
                        {step === 2 && <EmploymentInfoForm form={form} />}
                        {step === 3 && <AddressInfoForm form={form} />}
                        {step === 4 && <PayrollInfoForm form={form} />}

                        <div className="flex justify-end gap-2">
                            {step > 1 && (
                                <Button type="button" variant="outline" onClick={previousStep}>
                                    Previous
                                </Button>
                            )}
                            {step < 4 ? (
                                <Button type="button" onClick={nextStep}>
                                    Next
                                </Button>
                            ) : (
                                <Button type="submit">
                                    Create Employee Account
                                </Button>
                            )}
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
