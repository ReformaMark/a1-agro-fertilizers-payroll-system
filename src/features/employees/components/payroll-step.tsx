"use client"

import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FormStepProps } from "../lib/complete-profile-schema"

const SCHEDULE_OPTIONS = ["1st half", "2nd half"] as const

export function PayrollStep({ form }: FormStepProps) {
    return (
        <div className="space-y-6">
            <div className="font-medium text-lg">Payroll Information</div>

            <FormField
                control={form.control}
                name="ratePerDay"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Rate Per Day</FormLabel>
                        <FormControl>
                            <Input
                                type="number"
                                {...field}
                                onChange={e => field.onChange(Number(e.target.value))}
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            {/* PhilHealth Section */}
            <div className="space-y-4">
                <div className="font-medium">PhilHealth Information</div>
                <div className="grid grid-cols-3 gap-4">
                    <FormField
                        control={form.control}
                        name="philHealthNumber"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>PhilHealth Number <span className="text-red-500">*</span></FormLabel>
                                <FormControl>
                                    <Input {...field} placeholder="Enter PhilHealth number" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="philHealthContribution"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Contribution <span className="text-red-500">*</span></FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        {...field}
                                        onChange={e => field.onChange(Number(e.target.value))}
                                        placeholder="Enter amount"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="philHealthSchedule"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Schedule</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select schedule" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {SCHEDULE_OPTIONS.map((schedule) => (
                                            <SelectItem key={schedule} value={schedule}>
                                                {schedule}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
            </div>

            {/* Pag-IBIG Section */}
            <div className="space-y-4">
                <div className="font-medium">Pag-IBIG Information</div>
                <div className="grid grid-cols-3 gap-4">
                    <FormField
                        control={form.control}
                        name="pagIbigNumber"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Pag-IBIG Number <span className="text-red-500">*</span></FormLabel>
                                <FormControl>
                                    <Input {...field} placeholder="Enter Pag-IBIG number" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="pagIbigContribution"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Contribution <span className="text-red-500">*</span></FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        {...field}
                                        onChange={e => field.onChange(Number(e.target.value))}
                                        placeholder="Enter amount"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="pagIbigSchedule"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Schedule</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select schedule" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {SCHEDULE_OPTIONS.map((schedule) => (
                                            <SelectItem key={schedule} value={schedule}>
                                                {schedule}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
            </div>

            {/* SSS Section */}
            <div className="space-y-4">
                <div className="font-medium">SSS Information</div>
                <div className="grid grid-cols-3 gap-4">
                    <FormField
                        control={form.control}
                        name="sssNumber"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>SSS Number <span className="text-red-500">*</span></FormLabel>
                                <FormControl>
                                    <Input {...field} placeholder="Enter SSS number" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="sssContribution"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Contribution <span className="text-red-500">*</span></FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        {...field}
                                        onChange={e => field.onChange(Number(e.target.value))}
                                        placeholder="Enter amount"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="sssSchedule"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Schedule</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select schedule" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {SCHEDULE_OPTIONS.map((schedule) => (
                                            <SelectItem key={schedule} value={schedule}>
                                                {schedule}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
            </div>

            {/* Income Tax Section */}
            <div className="space-y-4">
                <div className="font-medium">Income Tax Information</div>
                <div className="grid grid-cols-3 gap-4">
                    <FormField
                        control={form.control}
                        name="birTin"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>BIR TIN <span className="text-red-500">*</span></FormLabel>
                                <FormControl>
                                    <Input {...field} placeholder="Enter BIR TIN" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="incomeTax"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Income Tax <span className="text-red-500">*</span></FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        {...field}
                                        onChange={e => field.onChange(Number(e.target.value))}
                                        placeholder="Enter amount"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="incomeTaxSchedule"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Schedule</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select schedule" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {SCHEDULE_OPTIONS.map((schedule) => (
                                            <SelectItem key={schedule} value={schedule}>
                                                {schedule}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
            </div>
        </div>
    )
}