/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { useConvexMutation } from "@convex-dev/react-query"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation } from "@tanstack/react-query"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"
import { api } from "../../../../convex/_generated/api"
import { Doc } from "../../../../convex/_generated/dataModel"

const formSchema = z.object({
    name: z.string().min(1, "Please enter a name for this compensation type"),
    description: z.string().min(1, "Please provide a description explaining this compensation type"),
    category: z.string().min(1, "Please select a category for this compensation type"),
    taxable: z.boolean(),
    frequency: z.string().min(1, "Please select how often this compensation is paid"),
    defaultAmount: z.number().min(0, "Default amount must be a positive number"),
})

const CATEGORIES = ["Allowance", "Bonus", "Benefit", "Other"]
const FREQUENCIES = ["Monthly", "Quarterly", "Annual", "One-time"]

interface CompensationTypeFormProps {
    onClose: () => void
    editingType?: Doc<"compensationTypes"> | null
}

export function CompensationTypeForm({ onClose, editingType }: CompensationTypeFormProps) {
    const { mutate: createType, isPending: isCreating } = useMutation({
        mutationFn: useConvexMutation(api.compensation.createType)
    })

    const { mutate: updateType, isPending: isUpdating } = useMutation({
        mutationFn: useConvexMutation(api.compensation.updateType)
    })

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: editingType?.name || "",
            description: editingType?.description || "",
            category: editingType?.category || "",
            taxable: editingType?.taxable || false,
            frequency: editingType?.frequency || "",
            defaultAmount: editingType?.defaultAmount || 0,
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        if (editingType) {
            updateType(
                { id: editingType._id, ...values },
                {
                    onSuccess: () => {
                        toast.success("Compensation type updated successfully")
                        form.reset()
                        onClose()
                    },
                    onError: (error) => {
                        console.error(error)
                        toast.error("Failed to update compensation type")
                    }
                }
            )
        } else {
            createType(values, {
                onSuccess: () => {
                    toast.success("Compensation type created successfully")
                    form.reset()
                    onClose()
                },
                onError: (error) => {
                    console.error(error)
                    toast.error("Failed to create compensation type")
                }
            })
        }
    }

    return (
        <Dialog open onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>
                        {editingType ? "Edit" : "Add New"} Voucher Type
                    </DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Transportation Allowance" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="category"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Category</FormLabel>
                                    <FormControl>
                                        <Select
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select category" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {CATEGORIES.map((category) => (
                                                    <SelectItem key={category} value={category}>
                                                        {category}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="frequency"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Frequency</FormLabel>
                                    <FormControl>
                                        <Select
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select frequency" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {FREQUENCIES.map((frequency) => (
                                                    <SelectItem key={frequency} value={frequency}>
                                                        {frequency}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="defaultAmount"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Default Amount</FormLabel>
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
                            name="taxable"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                                    <div className="space-y-0.5">
                                        <FormLabel>Taxable</FormLabel>
                                    </div>
                                    <FormControl>
                                        <Switch
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
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
                                            placeholder="Enter description"
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
                                disabled={!form.formState.isValid || isCreating || isUpdating}
                            >
                                {editingType ? "Update" : "Create"}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
