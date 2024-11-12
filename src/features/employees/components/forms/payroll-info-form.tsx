"use client"

import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { UseFormReturn } from "react-hook-form"
import { EmployeeFormValues } from "../../lib/schema"

interface PayrollInfoFormProps {
  form: UseFormReturn<EmployeeFormValues>
}

const SCHEDULE_OPTIONS = [
  { value: "1st half", label: "1st Half" },
  { value: "2nd half", label: "2nd Half" },
]

export function PayrollInfoForm({ form }: PayrollInfoFormProps) {
  // Function to format PhilHealth number as user types
  const formatPhilHealthNumber = (value: string = "") => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');

    // Format as XX-XXXXXXXXX-X
    if (digits.length <= 2) {
      return digits;
    } else if (digits.length <= 11) {
      return `${digits.slice(0, 2)}-${digits.slice(2)}`;
    } else {
      return `${digits.slice(0, 2)}-${digits.slice(2, 11)}-${digits.slice(11, 12)}`;
    }
  };

  // Function to format Pag-IBIG number as user types
  const formatPagIbigNumber = (value: string = "") => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');
    
    // Format as XXXX-XXXX-XXXX
    if (digits.length <= 4) {
      return digits;
    } else if (digits.length <= 8) {
      return `${digits.slice(0, 4)}-${digits.slice(4)}`;
    } else {
      return `${digits.slice(0, 4)}-${digits.slice(4, 8)}-${digits.slice(8, 12)}`;
    }
  };

  // Function to format SSS number as user types
  const formatSSSNumber = (value: string = "") => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');
    
    // Format as XX-XXXXXXX-X
    if (digits.length <= 2) {
      return digits;
    } else if (digits.length <= 9) {
      return `${digits.slice(0, 2)}-${digits.slice(2)}`;
    } else {
      return `${digits.slice(0, 2)}-${digits.slice(2, 9)}-${digits.slice(9, 10)}`;
    }
  };

  return (
    <div className="grid gap-4 py-4">
      <FormField
        control={form.control}
        name="ratePerDay"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Rate Per Day <span className="text-red-500">*</span></FormLabel>
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

      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="philHealthNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>PhilHealth Number <span className="text-red-500">*</span></FormLabel>
              <FormControl>
                <Input
                  placeholder="XX-XXXXXXXXX-X"
                  {...field}
                  value={formatPhilHealthNumber(field.value || "")}
                  onChange={(e) => {
                    const formatted = formatPhilHealthNumber(e.target.value);
                    field.onChange(formatted);
                  }}
                  maxLength={14} // 12 digits + 2 hyphens
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
              <FormLabel>PhilHealth Schedule <span className="text-red-500">*</span></FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select schedule" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {SCHEDULE_OPTIONS.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="pagIbigNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Pag-IBIG Number <span className="text-red-500">*</span></FormLabel>
              <FormControl>
                <Input 
                  placeholder="XXXX-XXXX-XXXX"
                  {...field}
                  value={formatPagIbigNumber(field.value || "")}
                  onChange={(e) => {
                    const formatted = formatPagIbigNumber(e.target.value);
                    field.onChange(formatted);
                  }}
                  maxLength={14} // 12 digits + 2 hyphens
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
              <FormLabel>Pag-IBIG Schedule <span className="text-red-500">*</span></FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select schedule" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {SCHEDULE_OPTIONS.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="sssNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>SSS Number <span className="text-red-500">*</span></FormLabel>
              <FormControl>
                <Input 
                  placeholder="XX-XXXXXXX-X"
                  {...field}
                  value={formatSSSNumber(field.value || "")}
                  onChange={(e) => {
                    const formatted = formatSSSNumber(e.target.value);
                    field.onChange(formatted);
                  }}
                  maxLength={12} // 10 digits + 2 hyphens
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
              <FormLabel>SSS Schedule <span className="text-red-500">*</span></FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select schedule" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {SCHEDULE_OPTIONS.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="birTin"
          render={({ field }) => (
            <FormItem>
              <FormLabel>BIR TIN <span className="text-red-500">*</span></FormLabel>
              <FormControl>
                <Input placeholder="BIR TIN" {...field} />
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
              <FormLabel>Income Tax Schedule <span className="text-red-500">*</span></FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select schedule" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {SCHEDULE_OPTIONS.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="philHealthContribution"
          render={({ field }) => (
            <FormItem>
              <FormLabel>PhilHealth Contribution <span className="text-red-500">*</span></FormLabel>
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
          name="pagIbigContribution"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Pag-IBIG Contribution <span className="text-red-500">*</span></FormLabel>
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

      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="sssContribution"
          render={({ field }) => (
            <FormItem>
              <FormLabel>SSS Contribution <span className="text-red-500">*</span></FormLabel>
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
          name="incomeTax"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Income Tax <span className="text-red-500">*</span></FormLabel>
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
    </div>
  )
} 