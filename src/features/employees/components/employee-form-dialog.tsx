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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { UserPlus } from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form } from "@/components/ui/form"
import { useConvexMutation } from "@convex-dev/react-query"
import { useMutation } from "@tanstack/react-query"
import { toast } from "sonner"
import { employeeFormSchema, EmployeeFormValues } from "../lib/schema"
import { api } from "../../../../convex/_generated/api"
import { PersonalInfoForm } from "./forms/personal-info-form"
import { EmploymentInfoForm } from "./forms/employment-info-form"
import { AddressInfoForm } from "./forms/address-info-form"
import { PayrollInfoForm } from "./forms/payroll-info-form"

export function EmployeeFormDialog() {
    const [open, setOpen] = useState(false)

    const { mutate: createEmployee, isPending } = useMutation({
        mutationFn: useConvexMutation(api.users.createEmployee)
    })

    const form = useForm<EmployeeFormValues>({
        resolver: zodResolver(employeeFormSchema),
        defaultValues: {
            role: "employee",
            philHealthSchedule: "1st",
            pagIbigSchedule: "1st",
            sssSchedule: "1st",
            incomeTaxSchedule: "1st",
        }
    })

    async function onSubmit(data: any) {
        createEmployee(data, {
            onSuccess: () => {
                toast.success("Employee added successfully")
                setOpen(false)
                form.reset()
            },
            onError: (error) => {
                toast.error("Failed to add employee")
            }
        })
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="gap-2">
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
                        <Tabs defaultValue="personal" className="w-full">
                            <TabsList className="grid w-full grid-cols-4">
                                <TabsTrigger value="personal">Personal</TabsTrigger>
                                <TabsTrigger value="employment">Employment</TabsTrigger>
                                <TabsTrigger value="address">Address</TabsTrigger>
                                <TabsTrigger value="payroll">Payroll</TabsTrigger>
                            </TabsList>

                            <TabsContent value="personal">
                                <PersonalInfoForm form={form} />
                            </TabsContent>

                            <TabsContent value="employment">
                                <EmploymentInfoForm form={form} />
                            </TabsContent>

                            <TabsContent value="address">
                                <AddressInfoForm form={form} />
                            </TabsContent>

                            <TabsContent value="payroll">
                                <PayrollInfoForm form={form} />
                            </TabsContent>
                        </Tabs>

                        <div className="flex justify-end gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isPending}>
                                {isPending ? "Adding..." : "Add Employee"}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
} 