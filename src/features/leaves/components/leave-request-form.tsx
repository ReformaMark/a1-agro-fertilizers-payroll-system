"use client";

import { Button } from "@/components/ui/button";

import { Calendar } from "@/components/ui/calendar";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Textarea } from "@/components/ui/textarea";

import { cn } from "@/lib/utils";

import { zodResolver } from "@hookform/resolvers/zod";

import { format } from "date-fns";

import { CalendarIcon } from "lucide-react";

import { useForm } from "react-hook-form";

import { toast } from "sonner";

import { z } from "zod";

import { useCreateLeaveRequest } from "../api/leaves";

import { api } from "../../../../convex/_generated/api";

import { differenceInDays } from "date-fns";

import { Card } from "@/components/ui/card";

import { useQuery } from "convex/react";

import { useCurrentUser } from "@/hooks/use-current-user";

const formSchema = z.object({
  type: z.string().min(1, "Please select a leave type"),

  startDate: z.string().min(1, "Start date is required"),

  endDate: z.string().min(1, "End date is required"),

  reason: z
    .string()
    .min(10, "Please provide a detailed reason (minimum 10 characters)"),
});

const LEAVE_TYPES = [
  "Annual Leave",

  "Sick Leave",

  "Maternity Leave",

  "Paternity Leave",

  "Emergency Leave",

  "Other",
];

interface LeaveRequestFormProps {
  onClose: () => void;
}

export function LeaveRequestForm({ onClose }: LeaveRequestFormProps) {
  const createLeaveRequest = useCreateLeaveRequest();

  const { data: currentUser } = useCurrentUser();

  const leaveBalance = useQuery(api.leaves.getLeaveBalance, {
    userId: currentUser?._id,
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),

    defaultValues: {
      startDate: new Date().toISOString(),

      endDate: new Date().toISOString(),
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      await createLeaveRequest(values);

      toast.success("Leave request submitted successfully");

      onClose();
    } catch (error) {
      toast.error("Failed to submit leave request");

      console.error(error);
    }
  }

  const startDate = form.watch("startDate");

  const endDate = form.watch("endDate");

  const leaveType = form.watch("type");

  const leaveDuration =
    startDate && endDate
      ? differenceInDays(new Date(endDate), new Date(startDate)) + 1
      : 0;

  // Show warning if insufficient balance

  const isAnnualLeave = leaveType === "Annual Leave";

  const hasInsufficientBalance =
    isAnnualLeave && leaveBalance !== undefined && leaveDuration > leaveBalance;

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Submit Leave Request</DialogTitle>

          <DialogDescription>
            Submit a new leave request for approval.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Leave Type</FormLabel>

                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select leave type" />
                      </SelectTrigger>
                    </FormControl>

                    <SelectContent>
                      {LEAVE_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
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
                          selected={
                            field.value ? new Date(field.value) : undefined
                          }
                          onSelect={(date) =>
                            field.onChange(date?.toISOString())
                          }
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
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Date</FormLabel>

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
                          selected={
                            field.value ? new Date(field.value) : undefined
                          }
                          onSelect={(date) =>
                            field.onChange(date?.toISOString())
                          }
                          disabled={(date) =>
                            date < new Date(form.getValues("startDate"))
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

            {startDate && endDate && (
              <Card className="p-3">
                <p className="text-sm text-muted-foreground">
                  Duration:{" "}
                  <span className="font-medium">
                    {leaveDuration} day{leaveDuration > 1 ? "s" : ""}
                  </span>
                </p>

                {isAnnualLeave && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Leave Balance:{" "}
                    <span className="font-medium">
                      {leaveBalance ?? "..."} days
                    </span>
                    {hasInsufficientBalance && (
                      <span className="text-destructive ml-2">
                        Insufficient balance
                      </span>
                    )}
                  </p>
                )}
              </Card>
            )}

            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reason</FormLabel>

                  <FormControl>
                    <Textarea
                      placeholder="Please provide a detailed reason for your leave request"
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
                disabled={
                  !form.formState.isValid ||
                  form.formState.isSubmitting ||
                  hasInsufficientBalance
                }
              >
                Submit Request
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
