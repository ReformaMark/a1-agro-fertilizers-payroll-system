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
import { useBenefitRequests } from "@/features/benefits/api/benefits"
import { useCompensationTypes } from "@/features/compensation/api/compensation"
import { toast } from "sonner"
import { useEffect } from "react"

const formSchema = z.object({
    type: z.string().min(1, "Please select a voucher type"),
    description: z.string().min(10, "Please provide a detailed description"),
    amount: z.number().optional(),
})

interface BenefitRequestFormProps {
    onClose: () => void
}

export function BenefitRequestForm({ onClose }: BenefitRequestFormProps) {
    // const createRequest = useCreateBenefitRequest()
    const compensationTypes = useCompensationTypes()

    // Filter compensation types to only show benefits and allowances
    const availableBenefits = compensationTypes?.filter(type =>
        type.category === "Allowance" || type.category === "Benefit"
    )

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
    })

    // Watch the selected type to update default amount
    const selectedType = form.watch("type")

    // Update amount when type changes
    useEffect(() => {
        if (selectedType) {
            const type = availableBenefits?.find(t => t.name === selectedType)
            if (type?.defaultAmount) {
                form.setValue("amount", type.defaultAmount)
            }
        }
    }, [selectedType, availableBenefits, form])

    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            // await createRequest(values)
            toast.success("Voucher request submitted successfully")
            onClose()
        } catch (error) {
            console.error(error)
            toast.error("Failed to submit voucher request")
        }
    }

    return (
        <Dialog open onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Request Voucher</DialogTitle>
                    <DialogDescription>
                        Submit a new voucher or allowance request
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                                            {availableBenefits?.map((type) => (
                                                <SelectItem key={type._id} value={type.name}>
                                                    {type.name}
                                                    {type.defaultAmount && (
                                                        <span className="text-muted-foreground ml-2">
                                                            (₱{type.defaultAmount.toLocaleString()})
                                                        </span>
                                                    )}
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
                                            placeholder="0.00"
                                            {...field}
                                            onChange={e => field.onChange(e.target.valueAsNumber)}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                    {selectedType && (
                                        <p className="text-sm text-muted-foreground">
                                            {availableBenefits?.find(t => t.name === selectedType)?.description}
                                        </p>
                                    )}
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Please provide details about your voucher request"
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