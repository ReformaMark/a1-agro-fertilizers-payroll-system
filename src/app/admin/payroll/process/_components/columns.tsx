/* eslint-disable react-hooks/rules-of-hooks */
import { ColumnDef } from "@tanstack/react-table"
import { SalaryComponent } from "@/lib/types"
import { formatMoney } from "@/lib/utils"
import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Payslip from "@/features/payroll/components/payslip";
import { MessageSquare, Printer } from "lucide-react";
import client from "@/features/payroll/api/twilio-sms";

export const columns: ColumnDef<SalaryComponent>[] = [
    {
        id: "employeeId",
        header: "Employee Id",
        accessorKey: "employee.employeeTypeId",
        cell: ({ row }) => {
            const employeeId = row.original.employee.employeeTypeId;
            return (
                <div className="flex items-center justify-center">
                    <span className="text-xs">{employeeId}</span>
                </div>
            );
        }
    },
    {
        id: "Name",
        accessorKey: "firstName",
        header: "Name",
        cell: ({ row }) => {
            const firstName = row.original.employee.firstName
            const lastName = row.original.employee.lastName
            const middleNameInitial = row.original.employee.middleName ? row.original.employee.middleName.charAt(0) : '';
     
            return (
                <div className="flex items-start gap-x-2">
                    <div>
                        <h1 className="text-xs">{lastName}, {firstName} {middleNameInitial}.</h1>
                    </div>
                </div>
            )
        },
    },
    {
        id: "daysWorked",
        header: "Days Worked",
        cell: ({ row }) => {
            const hoursWorked = row.original.hoursWorked ?? 0;
            return (
                <div className="flex items-center justify-center">
                    <span className="text-xs">{(hoursWorked / 24).toFixed(1)}</span>
                </div>
            );
        }
    },
    {
        id: "ratePerDay",
        header: "Rate/Day", 
        cell: ({ row }) => {
            const ratePerDay = row.original.employee?.ratePerDay ?? 0;
            return (
                <div className="flex items-center justify-center">
                    <span className="text-xs">{formatMoney(ratePerDay)}</span>
                </div>
            )
        }
    },
    {
        id: "total",
        header: "Total",
        cell: ({ row }) => {
            const ratePerDay = row.original.employee?.ratePerDay ?? 0;
            const hoursWorked = row.original.hoursWorked ?? 0;
            const total = formatMoney(ratePerDay * (hoursWorked / 24));
            return (
                <div className="flex items-center justify-center">
                    <span className="text-xs">{total}</span>
                </div>
            );
        }
    },
    {
        id: "sss",
        header: "SSS",
        cell: ({ row }) => {
            const sss = formatMoney(row.original.governmentContributions.sss)
            return (
                <div className="flex items-center justify-center">
                    <span className="text-xs">{sss}</span>
                </div>
            )
        }
    },
    {
        id: "philHealth",
        header: "PhilHealth",
        cell: ({ row }) => {
            const philHealth = formatMoney(row.original.governmentContributions.philHealth)
            return (
                <div className="flex items-center justify-center">
                    <span className="text-xs">{philHealth}</span>
                </div>
            )
        }
    },
    {
        id: "pagIbig", 
        header: "PagIBIG",
        cell: ({ row }) => {
            const pagIbig = formatMoney(row.original.governmentContributions.pagIbig)
            return (
                <div className="flex items-center justify-center">
                    <span className="text-xs">{pagIbig}</span>
                </div>
            )
        }
    },
    {
        id: "deductions",
        header: "Deductions",
        cell: ({ row }) => {
            const deductions = row.original.deductions
                .reduce((total, deduction) => total + deduction.amount, 0)
            return (
                <div className="flex items-center justify-center">
                    <span className="text-xs">{formatMoney(deductions)}</span>
                </div>
            )
        }
    },
    {
        id: "netPay",
        header: "Net Pay",
        cell: ({ row }) => {
            return (
                <div className="flex items-center justify-center">
                    <span className="text-xs">{formatMoney(row.original.netPay)}</span>
                </div>
            )
        }
    },
    {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
            const [open, setOpen] = useState(false)
           
            return (
                <>
                    <Dialog open={open} onOpenChange={setOpen}>
                        <div className="flex items-center justify-center">
                            <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => setOpen(true)}
                            >
                                Payslip
                            </Button>
                        </div>
                        <DialogContent className="max-w-4xl">
                            
                            <div className="space-y-4">
                                <Payslip
                                    startDate={row.original.payrollPeriod?.startDate}
                                    endDate={row.original.payrollPeriod?.endDate}
                                    userId={row.original.userId}
                                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                                    // @ts-ignore
                                    user={row.original.employee}
                                />
                                <div className="flex justify-end gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => window.print()}
                                        className="flex items-center gap-x-2"
                                    >
                                        <Printer className="mr-2 h-4 w-4" />
                                        Print
                                    </Button>
                                    <Button
                                        variant="outline" 
                                        size="sm"
                                        onClick={async () => {
                                            try {
                                                await client.messages.create({
                                                    body: `Your payslip for period ${row.original.payrollPeriod?.startDate} to ${row.original.payrollPeriod?.endDate} is ready. Net pay: ${formatMoney(row.original.netPay)}`,
                                                    from: '+13099486328', // Replace with your Twilio number
                                                    to: row.original.employee.contactNumber || ''
                                                });
                                            } catch (error) {
                                                console.error('Error sending SMS:', error);
                                                alert('Failed to send SMS. Please try again later.');
                                            }
                                        }}
                                        className="flex items-center gap-x-2"
                                    >
                                        <MessageSquare className="mr-2 h-4 w-4" />
                                        Send SMS
                                    </Button>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>
                </>
            )
        }
    }
]