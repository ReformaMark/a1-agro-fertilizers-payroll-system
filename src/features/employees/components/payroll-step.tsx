"use client";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { Input } from "@/components/ui/input";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { FormStepProps } from "../lib/types";

const SCHEDULE_OPTIONS = ["1st half", "2nd half"] as const;

export function PayrollStep({ form }: FormStepProps) {
  // Function to format PhilHealth number as user types

  const formatPhilHealthNumber = (value: string = "") => {
    // Remove all non-digits

    const digits = value.replace(/\D/g, "");

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

    const digits = value.replace(/\D/g, "");

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

    const digits = value.replace(/\D/g, "");

    // Format as XX-XXXXXXX-X

    if (digits.length <= 2) {
      return digits;
    } else if (digits.length <= 9) {
      return `${digits.slice(0, 2)}-${digits.slice(2)}`;
    } else {
      return `${digits.slice(0, 2)}-${digits.slice(2, 9)}-${digits.slice(9, 10)}`;
    }
  };

  // Add validation feedback

  const formErrors = form.formState.errors;

  console.log("PayrollStep form errors:", formErrors); // Debug log

  // Log form values on change

  const handleFieldChange = (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    field: any,

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    value: any,

    formatter?: (value: string) => string
  ) => {
    if (formatter) {
      const formatted = formatter(value);

      field.onChange(formatted);
    } else {
      field.onChange(value);
    }
  };

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
                onChange={(e) => field.onChange(Number(e.target.value))}
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
                <FormLabel>
                  PhilHealth Number <span className="text-red-500">*</span>
                </FormLabel>

                <FormControl>
                  <Input
                    placeholder="XX-XXXXXXXXX-X"
                    {...field}
                    value={formatPhilHealthNumber(field.value || "")}
                    onChange={(e) => {
                      handleFieldChange(
                        field,

                        e.target.value,

                        formatPhilHealthNumber
                      );
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
            name="philHealthContribution"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Contribution <span className="text-red-500">*</span>
                </FormLabel>

                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
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

                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
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
                <FormLabel>
                  Pag-IBIG Number <span className="text-red-500">*</span>
                </FormLabel>

                <FormControl>
                  <Input
                    placeholder="XXXX-XXXX-XXXX"
                    {...field}
                    value={formatPagIbigNumber(field.value || "")}
                    onChange={(e) => {
                      handleFieldChange(
                        field,

                        e.target.value,

                        formatPagIbigNumber
                      );
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
            name="pagIbigContribution"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Contribution <span className="text-red-500">*</span>
                </FormLabel>

                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
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

                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
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
                <FormLabel>
                  SSS Number <span className="text-red-500">*</span>
                </FormLabel>

                <FormControl>
                  <Input
                    placeholder="XX-XXXXXXX-X"
                    {...field}
                    value={formatSSSNumber(field.value || "")}
                    onChange={(e) => {
                      handleFieldChange(field, e.target.value, formatSSSNumber);
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
            name="sssContribution"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Contribution <span className="text-red-500">*</span>
                </FormLabel>

                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
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

                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
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
                <FormLabel>
                  BIR TIN <span className="text-red-500">*</span>
                </FormLabel>

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
                <FormLabel>
                  Income Tax <span className="text-red-500">*</span>
                </FormLabel>

                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
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

                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
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
  );
}
