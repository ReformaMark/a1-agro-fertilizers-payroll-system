"use client"

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form } from "@/components/ui/form"
import { useMutation } from "convex/react"
import { toast } from "sonner"
import { api } from "../../../../convex/_generated/api"
import { UserCog } from "lucide-react"
import { Doc } from "../../../../convex/_generated/dataModel"
import { EmploymentStep } from "./employment-step"
import { AddressStep } from "./address-step"
import { PayrollStep } from "./payroll-step"
import { completeProfileSchema, CompleteProfileValues } from "../lib/complete-profile-schema"

interface CompleteProfileDialogProps {
    employee: Doc<"users">
}

export function CompleteProfileDialog({ employee }: CompleteProfileDialogProps) {
    const [open, setOpen] = useState(false)
    const [step, setStep] = useState(1)
    const updateEmployee = useMutation(api.users.updateEmployee)

    const form = useForm<CompleteProfileValues>({
        resolver: zodResolver(completeProfileSchema),
        defaultValues: {
            philHealthSchedule: "1st half",
            pagIbigSchedule: "1st half",
            sssSchedule: "1st half",
            incomeTaxSchedule: "1st half",
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
            setOpen(false)
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

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" title="Complete Profile">
                    <UserCog className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Complete Employee Profile</DialogTitle>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        {step === 1 && <EmploymentStep form={form} />}
                        {step === 2 && <AddressStep form={form} />}
                        {step === 3 && <PayrollStep form={form} />}

                        <div className="flex justify-end gap-2">
                            {step > 1 && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setStep(step - 1)}
                                >
                                    Previous
                                </Button>
                            )}
                            {step < 3 ? (
                                <Button type="button" onClick={nextStep}>
                                    Next
                                </Button>
                            ) : (
                                <Button type="submit">
                                    Complete Profile
                                </Button>
                            )}
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}