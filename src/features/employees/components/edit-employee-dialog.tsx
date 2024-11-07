"use client"

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form } from "@/components/ui/form"
import { useMutation } from "convex/react"
import { toast } from "sonner"
import { api } from "../../../../convex/_generated/api"
import { Doc } from "../../../../convex/_generated/dataModel"
import { completeProfileSchema, CompleteProfileValues } from "../lib/complete-profile-schema"
import { Progress } from "@/components/ui/progress"
import { EmploymentStep } from "./employment-step"
import { AddressStep } from "./address-step"
import { PayrollStep } from "./payroll-step"

interface EditEmployeeDialogProps {
    employee: Doc<"users">
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function EditEmployeeDialog({ employee, open, onOpenChange }: EditEmployeeDialogProps) {
    const [step, setStep] = useState(1)
    const updateEmployee = useMutation(api.users.updateEmployee)

    const form = useForm<CompleteProfileValues>({
        resolver: zodResolver(completeProfileSchema),
        defaultValues: {
            department: employee.department || "",
            position: employee.position || "",
            hiredDate: employee.hiredDate || "",
            region: employee.region || "",
            province: employee.province || "",
            city: employee.city || "",
            barangay: employee.barangay || "",
            postalCode: employee.postalCode || "",
            street: employee.street || "",
            houseNumber: employee.houseNumber || "",
            ratePerDay: employee.ratePerDay || 0,
            philHealthNumber: employee.philHealthNumber,
            pagIbigNumber: employee.pagIbigNumber,
            sssNumber: employee.sssNumber,
            birTin: employee.birTin,
            philHealthSchedule: employee.philHealthSchedule || "1st half",
            pagIbigSchedule: employee.pagIbigSchedule || "1st half",
            sssSchedule: employee.sssSchedule || "1st half",
            incomeTaxSchedule: employee.incomeTaxSchedule || "1st half",
            incomeTax: employee.incomeTax || 0,
            philHealthContribution: employee.philHealthContribution || 0,
            pagIbigContribution: employee.pagIbigContribution || 0,
            sssContribution: employee.sssContribution || 0,
        }
    })

    async function onSubmit(data: CompleteProfileValues) {
        try {
            await updateEmployee({
                userId: employee._id,
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
        e.preventDefault() // Prevent form submission
        const fields = getFieldsForStep(step)

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Edit Employee Profile</DialogTitle>
                </DialogHeader>

                <Progress value={progress} className="w-full" />

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <div className="min-h-[400px]">
                            {step === 1 && <EmploymentStep form={form} />}
                            {step === 2 && <AddressStep form={form} />}
                            {step === 3 && <PayrollStep form={form} />}
                        </div>

                        <div className="flex justify-between pt-4 border-t">
                            {step > 1 && (
                                <Button
                                    type="button" // Important: type="button"
                                    variant="outline"
                                    onClick={previousStep}
                                >
                                    Previous
                                </Button>
                            )}

                            <div className="flex gap-2 ml-auto">
                                <Button
                                    type="button" // Important: type="button"
                                    variant="outline"
                                    onClick={() => onOpenChange(false)}
                                >
                                    Cancel
                                </Button>

                                {step < 3 ? (
                                    <Button
                                        type="button" // Important: type="button"
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