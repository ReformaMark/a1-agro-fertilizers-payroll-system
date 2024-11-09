"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useIssueVoucher, useBenefitRequests } from "../api/benefits"
import { useCompensationTypes } from "@/features/compensation/api/compensation"
import { toast } from "sonner"
import { useEffect } from "react"
import { useUsers } from "@/features/users/api/users"
import { Id } from "../../../../convex/_generated/dataModel"

const formSchema = z.object({
    userId: z.string().min(1, "Please select an employee"),
    type: z.string().min(1, "Please select a voucher type"),
    description: z.string().optional(),
    amount: z.number().optional(),
})

interface IssueVoucherFormProps {
    onClose: () => void
}

export function IssueVoucherForm({ onClose }: IssueVoucherFormProps) {
    const issueVoucher = useIssueVoucher()
    const compensationTypes = useCompensationTypes()
    const users = useUsers()

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
    })

    // Watch the selected type to update default amount
    const selectedUserId = form.watch("userId")
    const selectedType = form.watch("type")

    const userBenefits = useBenefitRequests(
        selectedUserId ? selectedUserId as Id<"users"> : undefined,
        "Approved"
    )

    // Update amount when type changes
    useEffect(() => {
        if (selectedType) {
            const type = compensationTypes?.find(t => t.name === selectedType)
            if (type?.defaultAmount) {
                form.setValue("amount", type.defaultAmount)
            }
        }
    }, [selectedType, compensationTypes, form])

    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            // Check if user already has an active voucher of this type
            const existingVoucher = userBenefits?.find(
                benefit => benefit.type === values.type && benefit.status === "Approved"
            )

            if (existingVoucher) {
                toast.error(`User already has an active ${values.type} voucher`)
                return
            }

            await issueVoucher(values)
            toast.success("Voucher issued successfully")
            onClose()
        } catch (error) {
            console.error(error)
            toast.error("Failed to issue voucher")
        }
    }

    // Helper function to check if a voucher type is already active
    const isVoucherTypeActive = (type: string) => {
        return userBenefits?.some(
            benefit => benefit.type === type && benefit.status === "Approved"
        )
    }

    return (
        <Dialog open onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Issue Voucher</DialogTitle>
                    <DialogDescription>
                        Issue a new voucher to an employee
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
                                            {users?.map((user: { _id: string, firstName: string, lastName: string }) => (
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
                            name="type"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Voucher Type</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select voucher type" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {compensationTypes?.filter(type =>
                                                type.category === "Allowance" || type.category === "Benefit"
                                            ).map((type) => {
                                                const isActive = isVoucherTypeActive(type.name)
                                                return (
                                                    <SelectItem
                                                        key={type._id}
                                                        value={type.name}
                                                        disabled={isActive}
                                                    >
                                                        <div className="flex items-center justify-between w-full">
                                                            <span>{type.name}</span>
                                                            {isActive && (
                                                                <span className="text-red-500 text-xs ml-2">
                                                                    (Active)
                                                                </span>
                                                            )}
                                                            {type.defaultAmount && (
                                                                <span className="text-muted-foreground ml-2">
                                                                    (₱{type.defaultAmount.toLocaleString()})
                                                                </span>
                                                            )}
                                                        </div>
                                                    </SelectItem>
                                                )
                                            })}
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
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description (Optional)</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Add any additional details about this voucher"
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
                                Issue Voucher
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
} 