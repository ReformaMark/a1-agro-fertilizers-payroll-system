"use client"

import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { UseFormReturn } from "react-hook-form"
import { EmployeeFormValues } from "../../lib/schema"

interface EmploymentInfoFormProps {
  form: UseFormReturn<EmployeeFormValues>
}

export function EmploymentInfoForm({ form }: EmploymentInfoFormProps) {
  return (
    <div className="grid gap-4 py-4">
      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="department"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Department <span className="text-red-500">*</span></FormLabel>
              <FormControl>
                <Input placeholder="Human Resources" {...field} />
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
              <FormLabel>Position <span className="text-red-500">*</span></FormLabel>
              <FormControl>
                <Input placeholder="HR Manager" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="hiredDate"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Date Hired <span className="text-red-500">*</span></FormLabel>
            <FormControl>
              <Input
                type="date"
                max={new Date().toISOString().split('T')[0]}
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
} 