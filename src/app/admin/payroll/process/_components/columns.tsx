/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/rules-of-hooks */
import { ColumnDef } from "@tanstack/react-table"
import { SalaryComponent } from "@/lib/types"
import { calculateTotalDeductions, formatMoney } from "@/lib/utils"
import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Payslip from "@/features/payroll/components/payslip";
import SmsBtn from "@/features/payroll/components/sms-btn";
import { Printer } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "../../../../../../convex/_generated/api";


function isCurrentPeriod(loan: any) {
    const currentDate = new Date();
    const isFirstHalf = currentDate.getDate() <= 15;
    const cutOffSchedule = isFirstHalf ? '1st half' : '2nd half';
    return loan.monthlySchedule === cutOffSchedule;
}

export const columns: ColumnDef<SalaryComponent>[] = [
    {
        id: "employeeId",
        header: () => <span className="text-center">Employee Id</span>,
        accessorKey: "employee.employeeTypeId",
        cell: ({ row }) => <span className="text-xs">{row.original.employee.employeeTypeId}</span>
    },
    {
        id: "name",
        accessorKey: "employee.lastName", 
        header: () => <span className="text-center">Name</span>,
        cell: ({ row }) => {
            const firstName = row.original.employee.firstName
            const lastName = row.original.employee.lastName
            const middleNameInitial = row.original.employee.middleName ? row.original.employee.middleName.charAt(0) : '';
            return <span className="text-xs">{lastName}, {firstName} {middleNameInitial}.</span>
        },
    },
    {
        id: "hoursWorked",
        header: () => <span className="text-center">Hours Worked</span>,
        cell: ({ row }) => <span className="text-xs">{(row.original.hoursWorked ?? 0).toFixed(1)}</span>
    },
     
    {
        id: "ratePerDay",
        header: () => <span className="text-center">Rate/Day</span>,
        cell: ({ row }) => <span className="text-xs">{formatMoney(row.original.employee?.ratePerDay ?? 0)}</span>
    },
    {
        id: "total",
        header: () => <span className="text-center">Total</span>,
        cell: ({ row }) => {
            const overtimeAmount = row.original.overtime?.amount ?? 0;
            const overtimeHours = row.original.overtime?.hours ?? 0;
            const regularHours = (row.original.hoursWorked ?? 0) - overtimeHours;
            const regularPay = regularHours * ((row.original.employee?.ratePerDay ?? 0) / 8);
            const total = regularPay + overtimeAmount;
            return <span className="text-xs">{formatMoney(total)}</span>
        }
    },
    {
        id: "sss",
        header: () => <span className="text-center">SSS</span>,
        cell: ({ row }) => {
            const currentDate = new Date();
            const isFirstHalf = currentDate.getDate() <= 15;
            const cutOffSchedule = isFirstHalf ? '1st half' : '2nd half';
            const isSSSScheduled = row.original.employee?.sssSchedule === cutOffSchedule;
            const sssContribution = isSSSScheduled ? row.original.governmentContributions.sss : 0;
            return <span className="text-xs">{formatMoney(sssContribution)}</span>
        }
    },
    {
        id: "philHealth",
        header: () => <span className="text-center">PhilHealth</span>,
        cell: ({ row }) => {
            const currentDate = new Date();
            const isFirstHalf = currentDate.getDate() <= 15;
            const cutOffSchedule = isFirstHalf ? '1st half' : '2nd half';
            const isPhilHealthScheduled = row.original.employee?.philHealthSchedule === cutOffSchedule;
            const philHealthContribution = isPhilHealthScheduled ? row.original.governmentContributions.philHealth : 0;
            return <span className="text-xs">{formatMoney(philHealthContribution)}</span>
        }
    },
    {
        id: "pagIbig",
        header: () => <span className="text-center">PagIBIG</span>,
        cell: ({ row }) => {
            const currentDate = new Date();
            const isFirstHalf = currentDate.getDate() <= 15;
            const cutOffSchedule = isFirstHalf ? '1st half' : '2nd half';
            const isPagIbigScheduled = row.original.employee?.pagIbigSchedule === cutOffSchedule;
            const pagIbigContribution = isPagIbigScheduled ? row.original.employee?.pagIbigContribution ?? 0 : 0;
            return <span className="text-xs">{formatMoney(pagIbigContribution)}</span>
        }
    },
    {
        id: "sssCalamityLoan",
        header: () => <span className="text-center">SSS Calamity Loan</span>,
        cell: ({ row }) => {
            const loans = useQuery(api.loans.getGovernmentLoans, {
                userId: row.original.userId,
                status: 'Approved'
            });
            const sssCalamityLoan = loans?.find(loan => loan.applicationType === 'SSS Calamity');
            const applicableLoan = sssCalamityLoan && isCurrentPeriod(sssCalamityLoan) ? sssCalamityLoan : null;
            return <span className="text-xs">{formatMoney(applicableLoan?.amortization || 0)}</span>
        }
    },
    {
        id: "sssSalaryLoan",
        header: () => <span className="text-center">SSS Salary Loan</span>,
        cell: ({ row }) => {
            const loans = useQuery(api.loans.getGovernmentLoans, {
                userId: row.original.userId,
                status: 'Approved'
            });
            const sssSalaryLoan = loans?.find(loan => loan.applicationType === 'SSS Salary');
            const applicableLoan = sssSalaryLoan && isCurrentPeriod(sssSalaryLoan) ? sssSalaryLoan : null;
            return <span className="text-xs">{formatMoney(applicableLoan?.amortization || 0)}</span>
        }
    },
    {
        id: "pagibigLoan",
        header: () => <span className="text-center">Pag-IBIG Loan</span>,
        cell: ({ row }) => {
            const loans = useQuery(api.loans.getGovernmentLoans, {
                userId: row.original.userId,
                status: 'Approved'
            });
            const pagibigLoan = loans?.find(loan => loan.applicationType === 'Pagibig Multi-purpose');
            const applicableLoan = pagibigLoan && isCurrentPeriod(pagibigLoan) ? pagibigLoan : null;
            return <span className="text-xs">{formatMoney(applicableLoan?.amortization || 0)}</span>
        }
    },
    {
        id: "pagibigCalamityLoan",
        header: () => <span className="text-center">Pag-IBIG Calamity Loan</span>,
        cell: ({ row }) => {
            const loans = useQuery(api.loans.getGovernmentLoans, {
                userId: row.original.userId,
                status: 'Approved'
            });
            const pagibigCalamityLoan = loans?.find(loan => loan.applicationType === 'Pagibig Calamity');
            const applicableLoan = pagibigCalamityLoan && isCurrentPeriod(pagibigCalamityLoan) ? pagibigCalamityLoan : null;
            return <span className="text-xs">{formatMoney(applicableLoan?.amortization || 0)}</span>
        }
    },
    {
        id: "deductions",
        header: () => <span className="text-center">Deductions</span>,
        cell: ({ row }) => <span className="text-xs">{formatMoney(row.original.deductions.reduce((total, d) => total + d.amount, 0))}</span>
    },
    {
        id: "netPay",
        header: () => <span className="text-center">Net Pay</span>,
        cell: ({ row }) => {
            // Reuse the totalDeductions calculation from above
            const payrollData = useQuery(api.salaryComponents.getSalaryComponentsByPayrollPeriod, {
                startDate: row.original.payrollPeriod?.startDate,
                endDate: row.original.payrollPeriod?.endDate,
                userId: row.original.userId
            });
            const loans = useQuery(api.loans.getGovernmentLoans, {
                userId: row.original.userId,
                status: 'Approved'
            });
            const totalDeductions = calculateTotalDeductions(payrollData as any, loans ?? []);
            console.log(totalDeductions)
           
            return <span className="text-xs">{formatMoney(row.original.netPay - totalDeductions)}</span>
        }
    },
    {
        id: "actions",
        header: () => <span className="text-center">Actions</span>,
        cell: ({ row }) => {
            const [open, setOpen] = useState(false);
            const name = `${row.original.employee.lastName}, ${row.original.employee.firstName} ${row.original.employee.middleName ? row.original.employee.middleName.charAt(0) + '.' : ''}`
            return (
                <Dialog open={open} onOpenChange={setOpen} >
                    <Button variant="ghost" size="sm" onClick={() => setOpen(true)}>Payslip</Button>
                    <DialogContent className="max-w-[70%] max-h-[80vh] overflow-y-auto">
                        <div className="space-y-4">
                            <Payslip name={name} startDate={row.original.payrollPeriod?.startDate} endDate={row.original.payrollPeriod?.endDate} userId={row.original.userId} user={row.original.employee as any} />
                            <div className="flex justify-end gap-2">
                                <Button variant="outline" size="sm" onClick={() => window.print()} className="flex items-center gap-x-2 bg-blue-500 text-white hover:bg-blue-600"><Printer className="mr-2 h-4 w-4" />Print</Button>
                                <SmsBtn row={row as any} setOpen={setOpen}/>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            )
        }
    }
]