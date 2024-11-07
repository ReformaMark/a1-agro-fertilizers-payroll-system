"use client"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"
import { useCreateCompanyLoan, useCreateGovernmentLoan } from "../api/loans"

const companyLoanSchema = z.object({
    type: z.enum(["VALE", "Partial A/R"]),
    amount: z.number().min(1, "Amount must be greater than 0"),
    amortization: z.number().min(1, "Amortization must be greater than 0"),
    remarks: z.string().optional(),
})

const governmentLoanSchema = z.object({
    applicationType: z.enum([
        "SSS Salary Loan",
        "SSS Calamity Loan",
        "Pagibig Multi-purpose Loan",
        "Pagibig Calamity Loan"
    ]),
    applicationNo: z.string().min(1, "Application number is required"),
    amount: z.number().min(1, "Amount must be greater than 0"),
    startDate: z.string().min(1, "Start date is required"),
    monthlySchedule: z.enum(["1st Half", "2nd Half"]),
    amortization: z.number().min(1, "Amortization must be greater than 0"),
    additionalInfo: z.string().optional(),
})

interface LoanRequestFormProps {
    onClose: () => void
}

export function LoanRequestForm({ onClose }: LoanRequestFormProps) {
    const createCompanyLoan = useCreateCompanyLoan()
    const createGovernmentLoan = useCreateGovernmentLoan()

    const companyLoanForm = useForm<z.infer<typeof companyLoanSchema>>({
        resolver: zodResolver(companyLoanSchema),
    })

    const governmentLoanForm = useForm<z.infer<typeof governmentLoanSchema>>({
        resolver: zodResolver(governmentLoanSchema),
        defaultValues: {
            startDate: new Date().toISOString(),
        },
    })

    async function onSubmitCompanyLoan(values: z.infer<typeof companyLoanSchema>) {
        try {
            await createCompanyLoan({
                ...values,
                totalAmount: values.amount + (values.amount * 0.05), // 5% interest example
            })
            toast.success("Company loan request submitted successfully")
            onClose()
        } catch (error) {
            toast.error("Failed to submit loan request")
            console.error(error)
        }
    }

    async function onSubmitGovernmentLoan(values: z.infer<typeof governmentLoanSchema>) {
        try {
            await createGovernmentLoan({
                ...values,
                totalAmount: values.amount + (values.amount * 0.12), // 12% interest example
            })
            toast.success("Government loan request submitted successfully")
            onClose()
        } catch (error) {
            toast.error("Failed to submit loan request")
            console.error(error)
        }
    }

    return (
        <Dialog open onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Submit Loan Request</DialogTitle>
                    <DialogDescription>
                        Submit a new loan request for approval.
                    </DialogDescription>
                </DialogHeader>

                <Tabs defaultValue="company">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="company">Company Loan</TabsTrigger>
                        <TabsTrigger value="government">Government Loan</TabsTrigger>
                    </TabsList>

                    <TabsContent value="company">
                        <Form {...companyLoanForm}>
                            <form onSubmit={companyLoanForm.handleSubmit(onSubmitCompanyLoan)} className="space-y-4">
                                <FormField
                                    control={companyLoanForm.control}
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
                                                    <SelectItem value="Partial A/R">Partial to A/R</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={companyLoanForm.control}
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
                                        control={companyLoanForm.control}
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
                                    control={companyLoanForm.control}
                                    name="remarks"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Remarks</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="Additional remarks..."
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
                                        disabled={!companyLoanForm.formState.isValid}
                                    >
                                        Submit Request
                                    </Button>
                                </div>
                            </form>
                        </Form>
                    </TabsContent>

                    <TabsContent value="government">
                        <Form {...governmentLoanForm}>
                            <form onSubmit={governmentLoanForm.handleSubmit(onSubmitGovernmentLoan)} className="space-y-4">
                                <FormField
                                    control={governmentLoanForm.control}
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
                                                    <SelectItem value="SSS Salary Loan">SSS Salary Loan</SelectItem>
                                                    <SelectItem value="SSS Calamity Loan">SSS Calamity Loan</SelectItem>
                                                    <SelectItem value="Pagibig Multi-purpose Loan">Pagibig Multi-purpose Loan</SelectItem>
                                                    <SelectItem value="Pagibig Calamity Loan">Pagibig Calamity Loan</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={governmentLoanForm.control}
                                    name="applicationNo"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Application Number</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Enter application number" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={governmentLoanForm.control}
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
                                        control={governmentLoanForm.control}
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
                                    control={governmentLoanForm.control}
                                    name="startDate"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Start Date</FormLabel>
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
                                                        disabled={(date) => date < new Date()}
                                                        initialFocus
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={governmentLoanForm.control}
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

                                <FormField
                                    control={governmentLoanForm.control}
                                    name="additionalInfo"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Additional Information</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="Any additional information..."
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
                                        disabled={!governmentLoanForm.formState.isValid || governmentLoanForm.formState.isSubmitting}
                                    >
                                        Submit Request
                                    </Button>
                                </div>
                            </form>
                        </Form>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    )
} 