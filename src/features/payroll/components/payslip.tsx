/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

import React from 'react'
import { useQuery } from 'convex/react'
import { api } from '../../../../convex/_generated/api'
import { Id } from '../../../../convex/_generated/dataModel'

import { formatDate, formatMoney } from '@/lib/utils'
import { User } from '@/lib/types'

function Payslip({ name, startDate, endDate, userId, user }: { name: string, startDate: string; endDate: string, userId: Id<"users">, user: User }) {
    const loans = useQuery(api.loans.getGovernmentLoans, {
        userId: userId,
        status: 'Approved'
    })
  const payrollData = useQuery(api.salaryComponents.getSalaryComponentsByPayrollPeriod, {
    startDate: formatDate(startDate),
    endDate: formatDate(endDate),
    userId: userId
  })
  // "SSS Salary", "SSS Calamity", "Pagibig Multi-purpose", "Pagibig Calamity"
const pagibigLoan = loans?.find((loan: any) => loan.applicationType === 'Pagibig Multi-purpose')
const pagibigCalamityLoan = loans?.find((loan: any) => loan.applicationType === 'Pagibig Calamity')
const sssSalaryLoan = loans?.find((loan: any) => loan.applicationType === 'SSS Salary')
const sssCalamityLoan = loans?.find((loan: any) => loan.applicationType === 'SSS Calamity')

  const isCurrentPeriod = (loan: any) => {
    const currentDate = new Date();
    const isFirstHalf = currentDate.getDate() <= 15;
    const cutOffSchedule = isFirstHalf ? '1st half' : '2nd half';
    return loan.monthlySchedule === cutOffSchedule;
  };

  const applicablePagibigLoan = pagibigLoan && isCurrentPeriod(pagibigLoan) ? pagibigLoan : null;
  const applicablePagibigCalamityLoan = pagibigCalamityLoan && isCurrentPeriod(pagibigCalamityLoan) ? pagibigCalamityLoan : null;
  const applicableSssSalaryLoan = sssSalaryLoan && isCurrentPeriod(sssSalaryLoan) ? sssSalaryLoan : null;
  const applicableSssCalamityLoan = sssCalamityLoan && isCurrentPeriod(sssCalamityLoan) ? sssCalamityLoan : null;

  const deductions = payrollData?.deductions.reduce((total, deduction) => total + deduction.amount, 0) ?? 0;



  const overtimeValues = payrollData?.overtime?.amount ?? 0;
  const overtimeHours = payrollData?.overtime?.hours ?? 0;

  const hoursWorked = (payrollData?.hoursWorked ?? 0) - overtimeHours;

  const currentDate = new Date();
  const isFirstHalf = currentDate.getDate() <= 15;
  const cutOffSchedule = isFirstHalf ? '1st half' : '2nd half';

  const isScheduled = payrollData?.employee?.pagIbigSchedule === cutOffSchedule;
  const isSSSScheduled = payrollData?.employee?.sssSchedule === cutOffSchedule;
  const isPhilHealthScheduled = payrollData?.employee?.philHealthSchedule === cutOffSchedule;

  const userPagibigContribution = isScheduled ? payrollData?.employee?.pagIbigContribution ?? 0 : 0;
  const userSSSContribution = isSSSScheduled ? payrollData?.governmentContributions.sss ?? 0 : 0;
  const userPhilHealthContribution = isPhilHealthScheduled ? payrollData?.governmentContributions.philHealth ?? 0 : 0;

  const totalDeduction = payrollData?.governmentContributions ? 
    deductions: 0;


  
  return (
    <div className='w-full'>
        <h1 className='text-2xl font-bold text-center'>Payslip</h1>
        <p className='text-4xl font-semibold text-left text-black'>{name}</p>
        <Card className='p-0'>
        <CardHeader>
            <CardTitle className='grid grid-cols-2 text-center'>
                <h1 className="border-r border-gray-200">Gross Income</h1>
                <h1 className="">Deduction</h1>
            </CardTitle>
        </CardHeader>
        <CardContent>
            <table className="w-full border-collapse">
                <tbody>
                    <tr>
                        <td className="w-1/2 border-r border-gray-200">
                            <table className="w-full">
                                <tbody>
                                    <tr className="border border-gray-200 h-12">
                                        <td className="p-2 w-1/3">Rate per day:</td>
                                        <td className="p-2 w-1/3 border-x border-gray-200 text-right">{formatMoney(user.ratePerDay ?? 0)}</td>
                                        <td className="p-2 w-1/3"></td>
                                    </tr>
                                    <tr className="border border-gray-200 h-12">
                                        <td className="p-2">Hours worked:</td>
                                        <td className="p-2 border-x border-gray-200 text-right">{hoursWorked.toFixed(1)} hours</td>
                                        <td className="p-2 text-right">{formatMoney(hoursWorked * ((user?.ratePerDay ?? 0) / 8))}</td>
                                    </tr>
                                  
                                    <tr className="border border-gray-200 h-12">
                                    <td className="p-2">Overtime</td>
                                        <td className="p-2 border-x border-gray-200 text-right">{overtimeHours ?? 0} hours</td>
                                        <td className="p-2 text-right">{formatMoney(overtimeValues)}</td>
                                    </tr>
                                    <tr className="border border-gray-200 h-12">
                                        <td colSpan={3} className="p-2 border-x border-gray-200"></td>
                                    </tr>
                                    <tr className="border border-gray-200 h-12">
                                        <td colSpan={3} className="p-2 border-x border-gray-200"></td>
                                    </tr>
                                    <tr className="border border-gray-200 h-12">
                                        <td colSpan={3} className="p-2 border-x border-gray-200"></td>
                                    </tr>
                                    <tr className="border border-gray-200 h-12">
                                        <td colSpan={3} className="p-2 border-x border-gray-200"></td>
                                    </tr>
                                    <tr className="border border-gray-200 h-12">
                                        <td colSpan={3} className="p-2 border-x border-gray-200"></td>
                                    </tr>
                                    <tr className="border border-gray-200 h-12">
                                        <td colSpan={3} className="p-2 border-x border-gray-200"></td>
                                    </tr>
                                    <tr className="border border-gray-200 h-12">
                                        <td colSpan={3} className="p-2 border-x border-gray-200"></td>
                                    </tr>
                                    <tr className="border border-gray-200 h-12">
                                        <td colSpan={3} className="p-2 border-x border-gray-200"></td>
                                    </tr>
                                    <tr className="border border-gray-200 h-12">
                                        <td colSpan={2} className="p-2 border-x border-gray-200">Total Gross Income</td>
                                        <td className="p-2 border-x border-gray-200 text-right">{formatMoney((payrollData?.basicPay || 0) + (overtimeValues) )}</td>
                                    </tr>
                                    
                                </tbody>
                            </table>
                        </td>
                        <td className="w-1/2">
                            <table className="w-full">
                                <tbody>
                                    <tr className="border border-gray-200 h-12">
                                        <td className="p-2">SSS Contribution:</td>
                                        <td className="p-2 border-x border-gray-200 text-right">{formatMoney(userSSSContribution)}</td>
                                    </tr>
                                    <tr className="border border-gray-200 h-12">
                                        <td className="p-2">PhilHealth:</td>
                                        <td className="p-2 border-x border-gray-200 text-right">{formatMoney(userPhilHealthContribution)}</td>
                                    </tr>
                                    <tr className="border border-gray-200 h-12">
                                        <td className="p-2">Pag-IBIG:</td>
                                        <td className="p-2 border-x border-gray-200 text-right">{formatMoney(userPagibigContribution)}</td>
                                    </tr>
                                    <tr className="border border-gray-200 h-12">
                                        <td colSpan={3} className="p-2 border-x border-gray-200"></td>
                                    </tr>
                                    <tr className="border border-gray-200 h-12">
                                        <td className="p-2">SSS Calamity Loan:</td>
                                        <td className="p-2 border-x border-gray-200 text-right">{formatMoney(applicableSssCalamityLoan?.amortization || 0)}</td>
                                    </tr>
                                    <tr className="border border-gray-200 h-12">
                                        <td className="p-2">SSS Salary Loan:</td>
                                        <td className="p-2 border-x border-gray-200 text-right">{formatMoney(applicableSssSalaryLoan?.amortization || 0)}</td>
                                    </tr>
                                    <tr className="border border-gray-200 h-12">
                                        <td className="p-2">Pag-IBIG Loan:</td>
                                        <td className="p-2 border-x border-gray-200 text-right">{formatMoney(applicablePagibigLoan?.amortization || 0)}</td>
                                    </tr>
                                    <tr className="border border-gray-200 h-12">
                                        <td className="p-2">Pag-IBIG Calamity Loan:</td>
                                        <td className="p-2 border-x border-gray-200 text-right">{formatMoney(applicablePagibigCalamityLoan?.amortization || 0)}</td>
                                    </tr>
                                    <tr className="border border-gray-200 h-12">
                                        <td colSpan={3} className="p-2 border-x border-gray-200"></td>
                                    </tr>
                                    <tr className="border border-gray-200 h-12">
                                        <td className="p-2 col-span-2 ">Lates and Undertime:</td>
                                        <td className="p-2 border-x border-gray-200 text-right">{formatMoney(deductions)}</td>
                                    </tr>
                                    <tr className="border border-gray-200 h-12">
                                        <td className="p-2 col-span-2">Total Deduction</td>
                                        <td className="p-2 border-x border-gray-200 text-right">{formatMoney(totalDeduction || 0)}</td>
                                    </tr>
                                    <tr className="border border-gray-200 h-12">
                                        <td className="p-2 col-span-2">Total Net Pay</td>
                                        <td className="p-2 border-x border-gray-200 text-right">{formatMoney((payrollData?.netPay || 0) - (totalDeduction || 0))}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </td>
                    </tr>
                </tbody>
            </table>
        </CardContent>
        </Card>
    </div>
  )
}

export default Payslip