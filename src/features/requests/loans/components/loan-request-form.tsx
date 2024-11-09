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
import { useCreateCompanyLoan } from "../api/loans"

// const companyLoanSchema = z.object({
//     type: z.enum(["VALE", "Partial A/R"]),
//     amount: z.number().min(1, "Amount must be greater than 0"),
//     amortization: z.number().min(1, "Amortization must be greater than 0"),
//     remarks: z.string().optional(),
// })

// const governmentLoanSchema = z.object({
//     applicationType: z.enum([
//         "SSS Salary Loan",
//         "SSS Calamity Loan",
//         "Pagibig Multi-purpose Loan",
//         "Pagibig Calamity Loan"
//     ]),
//     applicationNo: z.string().min(1, "Application number is required"),
//     amount: z.number().min(1, "Amount must be greater than 0"),
//     startDate: z.string().min(1, "Start date is required"),
//     endDate: z.string().min(1, "End date is required"),
//     monthlySchedule: z.enum(["1st Half", "2nd Half"]),
//     amortization: z.number().min(1, "Amortization must be greater than 0"),
//     additionalInfo: z.string().optional(),
// }).refine((data) => {
//     const start = new Date(data.startDate);
//     const end = new Date(data.endDate);
//     return end > start
// }, {
//     message: "End date must be after start date",
//     path: ["endDate"],
// })

const formSchema = z.object({
    type: z.enum(["VALE", "Partial A/R"]),
    amount: z.number().min(1, "Amount must be greater than 0"),
    amortization: z.number().min(1, "Amortization must be greater than 0"),
    remarks: z.string().optional(),
})

interface LoanRequestFormProps {
    onClose: () => void
}

export function LoanRequestForm({ onClose }: LoanRequestFormProps) {
    const createCompanyLoan = useCreateCompanyLoan()

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            await createCompanyLoan({
                ...values,
                totalAmount: values.amount,
            })
            toast.success("Loan request submitted successfully")
            onClose()
        } catch (error) {
            console.error(error)
            toast.error("Failed to submit loan request")
        }
    }

    return (
        <Dialog open onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>New Company Loan Request</DialogTitle>
                    <DialogDescription>
                        Submit a new company loan request
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="type"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Loan Type</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select loan type" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="VALE">VALE</SelectItem>
                                            <SelectItem value="Partial A/R">Partial A/R</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="amount"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Amount</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                placeholder="0.00"
                                                {...field}
                                                onChange={e => field.onChange(e.target.valueAsNumber)}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="amortization"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Monthly Amortization</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                placeholder="0.00"
                                                {...field}
                                                onChange={e => field.onChange(e.target.valueAsNumber)}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="remarks"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Remarks (Optional)</FormLabel>
                                    <FormControl>
                                        <Textarea {...field} />
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