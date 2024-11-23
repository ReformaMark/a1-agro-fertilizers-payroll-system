/* eslint-disable @typescript-eslint/no-explicit-any */
import { SalaryComponent } from '@/lib/types'
import React, { useState } from 'react'
import { Dialog, DialogContent } from "@/components/ui/dialog";
import SmsBtn from '@/features/payroll/components/sms-btn';
import { Button } from '@/components/ui/button';
import { calculateTotalDeductions, formatMoney } from '@/lib/utils';
import { useQuery } from 'convex/react';
import { api } from '../../../../../../convex/_generated/api';
import Payslip from '@/features/payroll/components/payslip';
import { Printer } from 'lucide-react';
import Summary from './summary';
function PayrollTable({
    datas
}:{
    datas: SalaryComponent[]
}) {
    const [open, setOpen] = useState<boolean>(false)
    const loans = useQuery(api.loans.getGovernmentLoans,{})

    function isCurrentPeriod(loan: any, date: Date) {
        const isFirstHalf = date.getDate() <= 15;
        const cutOffSchedule = isFirstHalf ? '1st half' : '2nd half';
        return loan.monthlySchedule === cutOffSchedule;
    }


  return (
    <table className=''>
         <thead className="bg-gray-50">
                <tr>
                    <th className="px-6 py-3 text-left text-nowrap text-xs font-medium text-gray-500 uppercase tracking-wider">Employee Id</th>
                    <th className="px-6 py-3 text-left text-nowrap text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-nowrap text-xs font-medium text-gray-500 uppercase tracking-wider">Hours Worked</th>
                    <th className="px-6 py-3 text-left text-nowrap text-xs font-medium text-gray-500 uppercase tracking-wider">Rate/Day</th>
                    <th className="px-6 py-3 text-left text-nowrap text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                    <th className="px-6 py-3 text-left text-nowrap text-xs font-medium text-gray-500 uppercase tracking-wider">SSS</th>
                    <th className="px-6 py-3 text-left text-nowrap text-xs font-medium text-gray-500 uppercase tracking-wider">PhilHealth</th>
                    <th className="px-6 py-3 text-left text-nowrap text-xs font-medium text-gray-500 uppercase tracking-wider">PagIBIG</th>
                    <th className="px-6 py-3 text-left text-nowrap text-xs font-medium text-gray-500 uppercase tracking-wider">SSS Calamity Loan</th>
                    <th className="px-6 py-3 text-left text-nowrap text-xs font-medium text-gray-500 uppercase tracking-wider">SSS Salary Loan</th>
                    <th className="px-6 py-3 text-left text-nowrap text-xs font-medium text-gray-500 uppercase tracking-wider">Pag-IBIG Loan</th>
                    <th className="px-6 py-3 text-left text-nowrap text-xs font-medium text-gray-500 uppercase tracking-wider">Pag-IBIG Calamity Loan</th>
                    <th className="px-6 py-3 text-left text-nowrap text-xs font-medium text-gray-500 uppercase tracking-wider">Deductions</th>
                    <th className="px-6 py-3 text-left text-nowrap text-xs font-medium text-gray-500 uppercase tracking-wider">Net Pay</th>
                    <th className="px-6 py-3 text-left text-nowrap text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
                {!datas ? <tr><td colSpan={13} className="px-6 py-4 whitespace-nowrap text-xs text-center">No data found</td></tr> : datas?.map((data)=>{
                     const convexDate = new Date(data._creationTime)
                     console.log(convexDate)
                    const sssCalamityLoan = loans?.find(loan => loan.userId === data.userId && loan.applicationType === 'SSS Calamity' && isCurrentPeriod(loan, convexDate))?.amortization ?? 0
                    const sssSalaryLoan = loans?.find(loan => loan.userId === data.userId && loan.applicationType === 'SSS Salary' && isCurrentPeriod(loan, convexDate))?.amortization ?? 0
                    const pagibigLoan = loans?.find(loan => loan.userId === data.userId &&  loan.applicationType === 'Pagibig Multi-purpose' && isCurrentPeriod(loan, convexDate))?.amortization ?? 0
                    const pagibigCalamityLoan = loans?.find(loan => loan.userId === data.userId && loan.applicationType === 'Pagibig Calamity' && isCurrentPeriod(loan, convexDate))?.amortization ?? 0

                    return (
                        <tr key={data.employee.employeeTypeId}>
                            <td className="px-6 py-4 whitespace-nowrap text-xs">{data.employee.employeeTypeId}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-xs">{`${data.employee.lastName}, ${data.employee.firstName} ${data.employee.middleName ? data.employee.middleName.charAt(0) + '.' : ''}`}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-xs">{(data.hoursWorked ?? 0).toFixed(1)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-xs">{formatMoney(data.employee?.ratePerDay ?? 0)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-xs">{formatMoney((data.hoursWorked ?? 0) * ((data.employee?.ratePerDay ?? 0) / 8))}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-xs">{formatMoney(data.governmentContributions.sss)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-xs">{formatMoney(data.governmentContributions.philHealth)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-xs">{formatMoney(data.governmentContributions.pagIbig)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-xs">{formatMoney(sssCalamityLoan)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-xs">{formatMoney(sssSalaryLoan)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-xs">{formatMoney(pagibigLoan)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-xs">{formatMoney(pagibigCalamityLoan)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-xs">{formatMoney(data.deductions.reduce((total, d) => total + d.amount, 0))}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-xs">{formatMoney((data.netPay - calculateTotalDeductions(data as any, loans ?? [])) - (data.governmentContributions.sss + data.governmentContributions.philHealth + data.governmentContributions.pagIbig))}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-xs">
                                <Dialog open={open} onOpenChange={setOpen}>
                                    <Button variant="ghost" size="sm" onClick={() => setOpen(true)}>Payslip</Button>
                                    <DialogContent className="max-w-[70%] max-h-[80vh] overflow-y-auto">
                                        <div className="space-y-4">
                                            <Payslip name={`${data.employee.lastName}, ${data.employee.firstName} ${data.employee.middleName ? data.employee.middleName.charAt(0) + '.' : ''}`} startDate={data.payrollPeriod?.startDate} endDate={data.payrollPeriod?.endDate} userId={data.userId} user={data.employee as any} />
                                            <div className="flex justify-end gap-2">
                                                <Button variant="outline" size="sm" onClick={() => window.print()} className="flex items-center gap-x-2 bg-blue-500 text-white hover:bg-blue-600"><Printer className="mr-2 h-4 w-4" />Print</Button>
                                                <SmsBtn row={data as any} setOpen={setOpen} />
                                            </div>
                                        </div>
                                    </DialogContent>
                                </Dialog>
                            </td>
                        </tr>
                    )
                })}
            </tbody>
            <Summary data={datas as SalaryComponent[]} />
            
    </table>
  )
}

export default PayrollTable