"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form } from "@/components/ui/form"
import { useMutation, useQuery } from "convex/react"
import { toast } from "sonner"
import { api } from "../../../../convex/_generated/api"
import { Doc, Id } from "../../../../convex/_generated/dataModel"
import { completeProfileSchema, CompleteProfileValues } from "../lib/complete-profile-schema"
import { Progress } from "@/components/ui/progress"
import { EmploymentStep } from "./employment-step"
import { AddressStep } from "./address-step"
import { PayrollStep } from "./payroll-step"
import { ImageUpload } from "./image-upload"

interface EditEmployeeDialogProps {
    employee: Doc<"users"> & { imageUrl?: string | null }
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function EditEmployeeDialog({ employee, open, onOpenChange }: EditEmployeeDialogProps) {

    const [step, setStep] = useState(1)
    const updateEmployee = useMutation(api.users.updateEmployee)

    // Get the latest employee data
    const { data: employeeData } = useQuery(api.users.getEmployee, {
        userId: employee._id
    }) || { data: null }

    // Use the updated data if available, otherwise fall back to the prop data
    const currentEmployee = employeeData?.data || employee

    // Reset form when employee changes
    const form = useForm<CompleteProfileValues>({
        resolver: zodResolver(completeProfileSchema),
        defaultValues: {
            department: currentEmployee.department || "",
            position: currentEmployee.position || "",
            hiredDate: currentEmployee.hiredDate || "",
            region: currentEmployee.region || "",
            province: currentEmployee.province || "",
            city: currentEmployee.city || "",
            barangay: currentEmployee.barangay || "",
            postalCode: currentEmployee.postalCode || "",
            street: currentEmployee.street || "",
            houseNumber: currentEmployee.houseNumber || "",
            ratePerDay: currentEmployee.ratePerDay || 0,
            philHealthNumber: currentEmployee.philHealthNumber,
            pagIbigNumber: currentEmployee.pagIbigNumber,
            sssNumber: currentEmployee.sssNumber,
            birTin: currentEmployee.birTin,
            philHealthSchedule: currentEmployee.philHealthSchedule || "1st half",
            pagIbigSchedule: currentEmployee.pagIbigSchedule || "1st half",
            sssSchedule: currentEmployee.sssSchedule || "1st half",
            incomeTaxSchedule: currentEmployee.incomeTaxSchedule || "1st half",
            incomeTax: currentEmployee.incomeTax || 0,
            philHealthContribution: currentEmployee.philHealthContribution || 0,
            pagIbigContribution: currentEmployee.pagIbigContribution || 0,
            sssContribution: currentEmployee.sssContribution || 0,
        }
    })

    // Reset form values when employee changes
    useEffect(() => {
        if (currentEmployee) {
            form.reset({
                department: currentEmployee.department || "",
                position: currentEmployee.position || "",
                hiredDate: currentEmployee.hiredDate || "",
                region: currentEmployee.region || "",
                province: currentEmployee.province || "",
                city: currentEmployee.city || "",
                barangay: currentEmployee.barangay || "",
                postalCode: currentEmployee.postalCode || "",
                street: currentEmployee.street || "",
                houseNumber: currentEmployee.houseNumber || "",
                ratePerDay: currentEmployee.ratePerDay || 0,
                philHealthNumber: currentEmployee.philHealthNumber,
                pagIbigNumber: currentEmployee.pagIbigNumber,
                sssNumber: currentEmployee.sssNumber,
                birTin: currentEmployee.birTin,
                philHealthSchedule: currentEmployee.philHealthSchedule || "1st half",
                pagIbigSchedule: currentEmployee.pagIbigSchedule || "1st half",
                sssSchedule: currentEmployee.sssSchedule || "1st half",
                incomeTaxSchedule: currentEmployee.incomeTaxSchedule || "1st half",
                incomeTax: currentEmployee.incomeTax || 0,
                philHealthContribution: currentEmployee.philHealthContribution || 0,
                pagIbigContribution: currentEmployee.pagIbigContribution || 0,
                sssContribution: currentEmployee.sssContribution || 0,
            })
        }
    }, [currentEmployee._id, form, currentEmployee])

    async function onSubmit(data: CompleteProfileValues) {
        try {
            await updateEmployee({
                userId: currentEmployee._id, // Use currentEmployee instead of employee
                ...data,
                ratePerDay: Number(data.ratePerDay)
            })
            toast.success("Employee profile updated successfully")
            onOpenChange(false)
            form.reset()
        } catch (error) {
            console.error(error)
            toast.error("Failed to update employee profile")
        }
    }

    const nextStep = (e: React.MouseEvent) => {
        e.preventDefault()
        const fields = getFieldsForStep(step)

        form.trigger(fields as any[]).then((isValid) => {
            if (isValid) {
                setStep(step + 1)
            } else {
                toast.error("Please fill in all required fields correctly")
            }
        })
    }

    const previousStep = (e: React.MouseEvent) => {
        e.preventDefault()
        setStep(step - 1)
    }

    const getFieldsForStep = (currentStep: number) => {
        switch (currentStep) {
            case 1:
                return ["department", "position", "hiredDate"]
            case 2:
                return ["region", "province", "city", "barangay", "postalCode", "street", "houseNumber"]
            case 3:
                return ["ratePerDay", "philHealthSchedule", "pagIbigSchedule", "sssSchedule", "incomeTaxSchedule"]
            default:
                return []
        }
    }

    const progress = ((step - 1) / 2) * 100
    // const dialogKey = `employee-dialog-${currentEmployee._id}`

    return (
        <Dialog
            key={`dialog-${employee._id}`}
            open={open}
            onOpenChange={(newOpen) => {
                onOpenChange(newOpen);
            }}
        >
            <DialogContent className="max-w-2xl">




                <Form {...form}>

                    <DialogHeader>
                        <DialogTitle>
                            Edit Employee Profile: {currentEmployee.firstName} {currentEmployee.lastName}
                        </DialogTitle>
                    </DialogHeader>

                    <div className="flex justify-center mb-6">
                        <ImageUpload
                            key={`image-upload-${currentEmployee._id}`}
                            userId={currentEmployee._id}
                            imageStorageId={currentEmployee.image as Id<"_storage"> | undefined}
                            imageUrl={currentEmployee.imageUrl}
                            onUploadComplete={() => {
                                // The real-time query will automatically update the UI
                            }}
                        />
                    </div>

                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <div className="min-h-[400px]">
                            {step === 1 && <EmploymentStep form={form} />}
                            {step === 2 && <AddressStep form={form} />}
                            {step === 3 && <PayrollStep form={form} />}
                        </div>

                        <Progress value={progress} className="w-full" />

                        <div className="flex justify-between pt-4 border-t">
                            {step > 1 && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={previousStep}
                                >
                                    Previous
                                </Button>
                            )}

                            <div className="flex gap-2 ml-auto">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => onOpenChange(false)}
                                >
                                    Cancel
                                </Button>

                                {step < 3 ? (
                                    <Button
                                        type="button"
                                        onClick={nextStep}
                                    >
                                        Next
                                    </Button>
                                ) : (
                                    <Button type="submit">
                                        Save Changes
                                    </Button>
                                )}
                            </div>
                        </div>
                    </form>

                </Form>
            </DialogContent>
        </Dialog>
    )
}
