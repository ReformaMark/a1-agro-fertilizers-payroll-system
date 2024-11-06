"use client"

import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { UseFormReturn } from "react-hook-form"
import { CompleteProfileValues } from "../lib/complete-profile-schema"
import { CalendarIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns"

interface EmploymentStepProps {
    form: UseFormReturn<CompleteProfileValues>
}

export function EmploymentStep({ form }: EmploymentStepProps) {
    return (
        <div className="space-y-4">
            <div className="font-medium text-lg">Employment Information</div>
            <FormField
                control={form.control}
                name="department"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Department</FormLabel>
                        <FormControl>
                            <Input placeholder="e.g., Human Resources" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <FormField
                control={form.control}
                name="position"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Position</FormLabel>
                        <FormControl>
                            <Input placeholder="e.g., HR Manager" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <FormField
                control={form.control}
                name="hiredDate"
                render={({ field }) => (
                    <FormItem className="flex flex-col">
                        <FormLabel>Hire Date</FormLabel>
                        <Popover>
                            <PopoverTrigger asChild>
                                <FormControl>
                                    <Button
                                        variant={"outline"}
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
                                        date > new Date() || date < new Date("1900-01-01")
                                    }
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                        <FormMessage />
                    </FormItem>
                )}
            />
        </div>
    )
}