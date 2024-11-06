"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { useCreateAdjustment, useEmployeeCompensations, useValidateAdjustment } from "../api/compensation"
import { useEffect } from "react"
import { toast } from "sonner"
import { format } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Id } from "../../../../convex/_generated/dataModel"

type FormValues = z.infer<typeof formSchema>

const formSchema = z.object({
    employeeCompensationId: z.string()
        .transform((val) => val as Id<"employeeCompensation">),
    adjustmentType: z.string({
        required_error: "Please select an adjustment type",
    }),
    reason: z.string()
        .min(10, "Reason must be at least 10 characters")
        .max(500, "Reason must not exceed 500 characters"),
    previousAmount: z.number(),
    newAmount: z.number()
        .positive("Amount must be greater than 0")
        .refine((val) => val !== 0, "Amount cannot be zero"),
    effectiveDate: z.string()
        .refine((date) => {
            const parsed = new Date(date)
            return parsed >= new Date()
        }, "Effective date must be in the future"),
})

const ADJUSTMENT_TYPES = ["Increase", "Decrease", "Suspension"]

export function CompensationAdjustmentForm({ onClose }: { onClose: () => void }) {
    const validateAdjustment = useValidateAdjustment()
    const employeeCompensations = useEmployeeCompensations()
    const createAdjustment = useCreateAdjustment()

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            reason: "",
            previousAmount: 0,
            newAmount: 0,
            effectiveDate: new Date().toISOString(),
        },
    })

    const newAmount = form.watch("newAmount")
    const previousAmount = form.watch("previousAmount")
    const adjustmentType = form.watch("adjustmentType")

    useEffect(() => {
        if (newAmount && previousAmount && adjustmentType) {
            const validateAmount = async () => {
                try {
                    await validateAdjustment({
                        previousAmount,
                        newAmount,
                        adjustmentType,
                    })
                } catch (error) {
                    form.setError("newAmount", {
                        message: (error as Error).message,
                    })
                }
            }
            validateAmount()
        }
    }, [newAmount, previousAmount, adjustmentType, form, validateAdjustment])

    const handleCompensationChange = (compensationId: string) => {
        const compensation = employeeCompensations?.find(comp => comp._id === compensationId)
        if (compensation) {
            form.setValue("previousAmount", compensation.amount)
        }
    }

    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            await createAdjustment(values)
            toast.success("Adjustment created successfully")
            form.reset()
            onClose()
        } catch (error) {
            toast.error((error as Error).message)
        }
    }

    return (
        <Dialog open onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>New Compensation Adjustment</DialogTitle>
                    <DialogDescription>
                        Create a new adjustment for employee compensation.
                        All adjustments require approval before taking effect.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="employeeCompensationId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Employee Compensation</FormLabel>
                                    <Select onValueChange={(value) => {
                                        field.onChange(value)
                                        handleCompensationChange(value)
                                    }} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select compensation" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {employeeCompensations?.map((comp) => (
                                                <SelectItem key={comp._id} value={comp._id}>
                                                    {`${comp.user?.firstName} ${comp.user?.lastName} - ${comp.compensationType?.name}`}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="adjustmentType"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Adjustment Type</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select type" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {ADJUSTMENT_TYPES.map((type) => (
                                                <SelectItem key={type} value={type}>
                                                    {type}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="previousAmount"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Previous Amount</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            placeholder="0.00"
                                            {...field}
                                            onChange={e => field.onChange(e.target.valueAsNumber)}
                                            disabled
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="newAmount"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>New Amount</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            placeholder="0.00"
                                            {...field}
                                            onChange={e => field.onChange(e.target.valueAsNumber)}
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="effectiveDate"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Effective Date</FormLabel>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button
                                                    variant="outline"
                                                    className={cn(
                                                        "w-full pl-3 text-left font-normal",
                                                        !field.value && "text-muted-foreground"
                                                    )}
                                                >
                                                    {field.value ? (
                                                        format(new Date(field.value), "PPP")
                                                    ) : (
                                                        <span>Pick a date</span>
                                                    )}
                                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                </Button>
                                            </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={field.value ? new Date(field.value) : undefined}
                                                onSelect={(date) => field.onChange(date?.toISOString())}
                                                disabled={(date) =>
                                                    date < new Date()
                                                }
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="reason"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Reason</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Enter reason for adjustment"
                                            className="resize-none"
                                            {...field}
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />

                        {form.formState.errors.root && (
                            <div className="text-sm font-medium text-destructive">
                                {form.formState.errors.root.message}
                            </div>
                        )}

                        {newAmount && previousAmount && (
                            <div className="rounded-lg border p-3 space-y-2">
                                <h4 className="font-medium">Adjustment Preview</h4>
                                <div className="text-sm text-muted-foreground">
                                    <p>Previous: ₱{previousAmount.toLocaleString()}</p>
                                    <p>New: ₱{newAmount.toLocaleString()}</p>
                                    <p>Difference: ₱{(newAmount - previousAmount).toLocaleString()}</p>
                                    <p>Change: {((newAmount - previousAmount) / previousAmount * 100).toFixed(2)}%</p>
                                </div>
                            </div>
                        )}

                        <div className="flex justify-end space-x-2">
                            <Button variant="outline" onClick={onClose}>
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={!form.formState.isValid || form.formState.isSubmitting}
                            >
                                Create
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}