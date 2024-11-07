"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useMutation, useQuery } from "convex/react"
import { api } from "../../../../convex/_generated/api"
import { toast } from "sonner"
import { Id } from "../../../../convex/_generated/dataModel"
import { useEffect } from "react"
import { SSSRange } from "@/lib/types"

const rangeSchema = z.object({
    rangeStart: z.number().min(0),
    rangeEnd: z.number(),
    regularSS: z.number().min(0),
    wisp: z.number().min(0),
    totalMonthlySalaryCredit: z.number().min(0),
    regularSSER: z.number().min(0),
    regularSSEE: z.number().min(0),
    regularSSTotal: z.number().min(0),
    ecER: z.number().min(0),
    ecEE: z.number().min(0),
    ecTotal: z.number().min(0),
    wispER: z.number().min(0),
    wispEE: z.number().min(0),
    wispTotal: z.number().min(0),
    totalER: z.number().min(0),
    totalEE: z.number().min(0),
    grandTotal: z.number().min(0)
})

const formSchema = z.object({
    type: z.string(),
    effectiveDate: z.string(),
    ranges: z.array(rangeSchema),
    isActive: z.boolean(),
})

type FormValues = z.infer<typeof formSchema>

interface EditContributionTableDialogProps {
    open: boolean
    tableId: Id<"contributionTables"> | null
    onClose: () => void
}

export function EditContributionTableDialog({ open, tableId, onClose }: EditContributionTableDialogProps) {
    const table = useQuery(api.contributionTables.get, tableId ? { id: tableId } : "skip")
    const createTable = useMutation(api.contributionTables.create)
    const updateTable = useMutation(api.contributionTables.update)

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            type: "SSS",
            effectiveDate: new Date().toISOString().split('T')[0],
            ranges: [],
            isActive: true,
        },
    })

    useEffect(() => {
        if (table) {
            form.reset({
                type: table.type,
                effectiveDate: table.effectiveDate,
                ranges: table.ranges as SSSRange[],
                isActive: table.isActive,
            })
        }
    }, [table, form])

    const onSubmit = async (values: FormValues) => {
        try {
            if (tableId) {
                await updateTable({
                    id: tableId,
                    type: values.type,
                    effectiveDate: values.effectiveDate,
                    ranges: values.ranges,
                    isActive: values.isActive
                })
                toast.success("Contribution table updated successfully")
            } else {
                await createTable({
                    type: values.type,
                    effectiveDate: values.effectiveDate,
                    ranges: values.ranges,
                    isActive: values.isActive
                })
                toast.success("Contribution table created successfully")
            }
            onClose()
        } catch (error) {
            toast.error("Failed to save contribution table")
            console.error(error)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl">
                <DialogHeader>
                    <DialogTitle>
                        {tableId ? "Edit Contribution Table" : "New Contribution Table"}
                    </DialogTitle>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="type"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Type</FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select type" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="SSS">SSS</SelectItem>
                                                <SelectItem value="PhilHealth">PhilHealth</SelectItem>
                                                <SelectItem value="PagIbig">Pag-IBIG</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="effectiveDate"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Effective Date</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="date"
                                                value={field.value}
                                                onChange={field.onChange}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="isActive"
                            render={({ field }) => (
                                <FormItem className="flex items-center gap-2">
                                    <FormControl>
                                        <input
                                            type="checkbox"
                                            checked={field.value}
                                            onChange={field.onChange}
                                        />
                                    </FormControl>
                                    <FormLabel className="!mt-0">Set as Active Table</FormLabel>
                                </FormItem>
                            )}
                        />

                        <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={onClose} type="button">
                                Cancel
                            </Button>
                            <Button type="submit">
                                {tableId ? "Update" : "Create"}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}