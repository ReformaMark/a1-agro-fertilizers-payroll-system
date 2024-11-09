"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useUsers } from "@/features/users/api/users"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation } from "convex/react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"
import { api } from "../../../../../convex/_generated/api"

const formSchema = z.object({
    userId: z.string().min(1, "Please select an employee"),
    applicationType: z.string().min(1, "Please select loan type"),
    applicationNo: z.string().min(1, "Application number is required"),
    amount: z.number().min(1, "Amount is required"),
    amortization: z.number().min(1, "Monthly amortization is required"),
    totalAmount: z.number().min(1, "Total amount is required"),
    startDate: z.string().min(1, "Start date is required"),
    endDate: z.string().min(1, "End date is required"), // Add this
    monthlySchedule: z.union([
        z.literal("1st Half"),
        z.literal("2nd Half")
    ], {
        required_error: "Please select a monthly schedule",
    }),
    additionalInfo: z.string().optional(),
})

interface IssueGovernmentLoanFormProps {
    onClose: () => void
}

const LOAN_TYPES = [
    "SSS Salary Loan",
    "SSS Calamity Loan",
    "PAG-IBIG Multi-Purpose Loan",
    "PAG-IBIG Calamity Loan",
    "GSIS Salary Loan",
    "GSIS Emergency Loan"
]

export function IssueGovernmentLoanForm({ onClose }: IssueGovernmentLoanFormProps) {
    const users = useUsers()
    const issueGovernmentLoan = useMutation(api.loans.issueGovernmentLoan)

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            // @ts-expect-error slight typing issue
            await issueGovernmentLoan(values)
            toast.success("Government loan issued successfully")
            onClose()
        } catch (error) {
            console.error(error)
            toast.error("Failed to issue government loan")
        }
    }

    return (
        <Dialog open onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Issue Government Loan</DialogTitle>
                    <DialogDescription>
                        Issue a new government loan to an employee
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="userId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Employee</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select employee" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {users?.map((user) => (
                                                <SelectItem key={user._id} value={user._id}>
                                                    {user.firstName} {user.lastName}
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
                            name="applicationType"
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
                                            {LOAN_TYPES.map((type) => (
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
                            name="applicationNo"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Application Number</FormLabel>
                                    <FormControl>
                                        <Input {...field} />
                                    </FormControl>
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
                            name="totalAmount"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Total Amount</FormLabel>
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
                            name="startDate"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Start Date</FormLabel>
                                    <FormControl>
                                        <Input type="date" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="endDate"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>End Date</FormLabel>
                                    <FormControl>
                                        <Input type="date" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="monthlySchedule"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Monthly Schedule</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select schedule" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="1st Half">1st Half</SelectItem>
                                            <SelectItem value="2nd Half">2nd Half</SelectItem>
                                        </SelectContent>
                                    </Select>
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
                                Issue Loan
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}