"use client";

import { Button } from "@/components/ui/button";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

import { useEffect, useState } from "react";

import { useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";

import { Form } from "@/components/ui/form";

import { useMutation, useQuery } from "convex/react";

import { toast } from "sonner";

import { api } from "../../../../convex/_generated/api";

import { Doc, Id } from "../../../../convex/_generated/dataModel";

import { editEmployeeSchema, EditEmployeeValues } from "../lib/schema";

import { EmploymentStep } from "./employment-step";

import { AddressStep } from "./address-step";

import { PayrollStep } from "./payroll-step";

import { ImageUpload } from "./image-upload";

import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";

import { Input } from "@/components/ui/input";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

import { ScrollArea } from "@/components/ui/scroll-area";

interface EditEmployeeDialogProps {
    employee: Doc<"users"> & { imageUrl?: string | null };

    open: boolean;

    onOpenChange: (open: boolean) => void;
}

const MARITAL_STATUS_OPTIONS = [
    { value: "single", label: "Single" },

    { value: "married", label: "Married" },

    { value: "widowed", label: "Widowed" },

    { value: "divorced", label: "Divorced" },

    { value: "separated", label: "Separated" },
];

export function EditEmployeeDialog({
    employee,

    open,

    onOpenChange,
}: EditEmployeeDialogProps) {
    const [step, setStep] = useState(1);

    const updateEmployee = useMutation(api.users.updateEmployee);

    const updatePersonalInfo = useMutation(api.users.updatePersonalInfo);

    const { data: employeeData } = useQuery(api.users.getEmployee, {
        userId: employee._id,
    }) || { data: null };

    const currentEmployee = employeeData || employee;

    const form = useForm<EditEmployeeValues>({
        resolver: zodResolver(editEmployeeSchema),

        defaultValues: {
            firstName: currentEmployee.firstName || "",

            middleName: currentEmployee.middleName || "",

            lastName: currentEmployee.lastName || "",

            maritalStatus: currentEmployee.maritalStatus || "single",

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
        },
    });

    useEffect(() => {
        if (currentEmployee) {
            form.reset({
                firstName: currentEmployee.firstName || "",

                middleName: currentEmployee.middleName || "",

                lastName: currentEmployee.lastName || "",

                maritalStatus: currentEmployee.maritalStatus || "single",

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
            });
        }
    }, [currentEmployee._id, form, currentEmployee]);

    async function onSubmit(data: EditEmployeeValues) {
        try {
            // Update personal info

            await updatePersonalInfo({
                userId: currentEmployee._id,

                firstName: data.firstName,

                middleName: data.middleName,

                lastName: data.lastName,

                maritalStatus: data.maritalStatus,
            });

            // Update other employee info - exclude personal info fields

            const {
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                firstName,

                // eslint-disable-next-line @typescript-eslint/no-unused-vars   
                middleName,

                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                lastName,

                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                maritalStatus,

                ...employeeData
            } = data;

            await updateEmployee({
                userId: currentEmployee._id,

                ...employeeData,
            });

            toast.success("Employee information updated successfully");

            onOpenChange(false);

            form.reset();
        } catch (error) {
            toast.error("Failed to update employee information");
            console.error(error);
        }
    }

    const nextStep = (e: React.MouseEvent) => {
        e.preventDefault();

        const fields = getFieldsForStep(step);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        form.trigger(fields as any[]).then((isValid) => {
            if (isValid) {
                setStep(step + 1);
            } else {
                toast.error("Please fill in all required fields correctly");
            }
        });
    };

    const previousStep = (e: React.MouseEvent) => {
        e.preventDefault();

        setStep(step - 1);
    };

    const getFieldsForStep = (currentStep: number) => {
        switch (currentStep) {
            case 1:
                return [
                    "firstName",

                    "middleName",

                    "lastName",

                    "maritalStatus",

                    "department",

                    "position",

                    "hiredDate",
                ];

            case 2:
                return [
                    "region",

                    "province",

                    "city",

                    "barangay",

                    "postalCode",

                    "street",

                    "houseNumber",
                ];

            case 3:
                return [
                    "ratePerDay",

                    "philHealthNumber",

                    "pagIbigNumber",

                    "sssNumber",

                    "birTin",

                    "philHealthContribution",

                    "pagIbigContribution",

                    "sssContribution",

                    "incomeTax",

                    "philHealthSchedule",

                    "pagIbigSchedule",

                    "sssSchedule",

                    "incomeTaxSchedule",
                ];

            default:
                return [];
        }
    };


    // const progress = ((step - 1) / 2) * 100;

    return (
        <Dialog
            key={`dialog-${employee._id}`}
            open={open}
            onOpenChange={onOpenChange}
        >
            <DialogContent className="max-w-4xl max-h-[90vh]">
                <DialogHeader>
                    <DialogTitle>
                        Edit Employee Profile: {currentEmployee.firstName}{" "}
                        {currentEmployee.lastName}
                    </DialogTitle>
                </DialogHeader>

                <ScrollArea className="h-[calc(90vh-120px)]">
                    <div className="pr-4">
                        <div className="mb-6 flex justify-between">
                            {[1, 2, 3].map((stepNumber) => (
                                <div
                                    key={stepNumber}
                                    className={`flex h-8 w-8 items-center justify-center rounded-full ${step >= stepNumber
                                        ? "bg-primary text-white"
                                        : "bg-gray-200 text-gray-500"
                                        }`}
                                >
                                    {stepNumber}
                                </div>
                            ))}
                        </div>

                        <div className="flex justify-center mb-6">
                            <ImageUpload
                                key={`image-upload-${currentEmployee._id}`}
                                userId={currentEmployee._id}
                                imageStorageId={
                                    currentEmployee.image as Id<"_storage"> | undefined
                                }
                                imageUrl={currentEmployee.imageUrl}
                                previewMode={true}
                                onUploadComplete={() => {
                                    // The real-time query will automatically update the UI
                                }}
                            />
                        </div>

                        <Form {...form}>
                            <form
                                onSubmit={form.handleSubmit(onSubmit)}
                                className="space-y-6"
                            >
                                {step === 1 && (
                                    <div className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                                                name="middleName"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Middle Name</FormLabel>
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
                                            name="maritalStatus"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Marital Status</FormLabel>
                                                    <Select
                                                        onValueChange={field.onChange}
                                                        defaultValue={field.value}
                                                    >
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Select marital status" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            {MARITAL_STATUS_OPTIONS.map((option) => (
                                                                <SelectItem
                                                                    key={option.value}
                                                                    value={option.value}
                                                                >
                                                                    {option.label}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                        <EmploymentStep form={form as any} />
                                    </div>
                                )}

                                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                {step === 2 && <AddressStep form={form as any} />}

                                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                {step === 3 && <PayrollStep form={form as any} />}

                                <div className="flex justify-end gap-2 sticky bottom-0 bg-background py-4 border-t">
                                    {step > 1 && (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={previousStep}
                                        >
                                            Previous
                                        </Button>
                                    )}
                                    {/* <Button
                    type="button"
                    variant="outline"
                    onClick={() => onOpenChange(false)}
                  >
                    Cancel
                  </Button> */}
                                    {step < 3 ? (
                                        <Button type="button" onClick={nextStep}>
                                            Next
                                        </Button>
                                    ) : (
                                        <Button type="submit">Save Changes</Button>
                                    )}
                                </div>
                            </form>
                        </Form>
                    </div>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
}
