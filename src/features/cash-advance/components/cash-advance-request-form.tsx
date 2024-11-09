"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"
import { useCreateCashAdvanceRequest } from "@/features/cash-advance/api/cash-advance"

const formSchema = z.object({
    type: z.enum(["Salary", "Emergency", "Other"], {
        required_error: "Please select a cash advance type",
    }),
    amount: z.number()
        .min(1, "Amount must be greater than 0")
        .max(50000, "Amount cannot exceed ₱50,000"),
    paymentTerm: z.enum(["1 Month", "2 Months", "3 Months"], {
        required_error: "Please select a payment term",
    }),
    reason: z.string().min(10, "Please provide a detailed reason (minimum 10 characters)"),
})

const CASH_ADVANCE_TYPES = [
    "Salary",
    "Emergency",
    "Other"
] as const

const PAYMENT_TERMS = [
    "1 Month",
    "2 Months",
    "3 Months"
] as const

interface CashAdvanceRequestFormProps {
    onClose: () => void
}

export function CashAdvanceRequestForm({ onClose }: CashAdvanceRequestFormProps) {
    const createCashAdvanceRequest = useCreateCashAdvanceRequest()

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            amount: 0,
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            await createCashAdvanceRequest(values)
            toast.success("Cash advance request submitted successfully")
            onClose()
        } catch (error) {
            toast.error("Failed to submit VALE request")
            console.error(error)
        }
    }

    return (
        <Dialog open onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Submit VALE Request</DialogTitle>
                    <DialogDescription>
                        Submit a new VALE request for approval.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="type"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Type</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select cash advance type" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {CASH_ADVANCE_TYPES.map((type) => (
                                                <SelectItem key={type} value={type}>
                                                    {type}
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
                            name="amount"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Amount</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            placeholder="Enter amount"
                                            {...field}
                                            onChange={e => field.onChange(Number(e.target.value))}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="paymentTerm"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Payment Term</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select payment term" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {PAYMENT_TERMS.map((term) => (
                                                <SelectItem key={term} value={term}>
                                                    {term}
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
                            name="reason"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Reason</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Please provide a detailed reason for your cash advance request"
                                            className="resize-none"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="flex justify-end space-x-2">
                            <Button variant="outline" onClick={onClose}>
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={!form.formState.isValid || form.formState.isSubmitting}
                            >
                                Submit Request
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
} 