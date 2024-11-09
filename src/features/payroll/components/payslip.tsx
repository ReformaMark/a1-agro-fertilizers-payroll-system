'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

import React from 'react'
import { useQuery } from 'convex/react'
import { api } from '../../../../convex/_generated/api'
import { Id } from '../../../../convex/_generated/dataModel'

import { formatDate, formatMoney } from '@/lib/utils'
import { User } from '@/lib/types'

function Payslip({ startDate, endDate, userId, user }: { startDate: string; endDate: string, userId: Id<"users">, user: User }) {

    const payrollData = useQuery(api.salaryComponents.getSalaryComponentsByPayrollPeriod, {
        startDate: formatDate(startDate),
        endDate: formatDate(endDate),
        userId: userId
    })

    const totalDeduction = payrollData?.governmentContributions ?
        payrollData.governmentContributions.sss +
        payrollData.governmentContributions.philHealth +
        payrollData.governmentContributions.pagIbig : 0



    return (
        <div className='w-full'>
            <h1 className='text-2xl font-bold text-center'>Payslip</h1>
            <p className='text-muted-foreground text-center'></p>
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
                                                <td className="p-2 w-1/3 border-x border-gray-200">{formatMoney(user.ratePerDay ?? 0)}</td>
                                                <td className="p-2 w-1/3"></td>
                                            </tr>
                                            <tr className="border border-gray-200 h-12">
                                                <td className="p-2">Hours worked:</td>
                                                <td className="p-2 border-x border-gray-200">{payrollData?.daysWorked ?? 0} hours</td>
                                                <td className="p-2">{formatMoney(((payrollData?.daysWorked ?? 0) / 24) * (user?.ratePerDay ?? 0))}</td>
                                            </tr>
                                            <tr className="border border-gray-200 h-12">
                                                <td className="p-2"></td>
                                                <td className="p-2 border-x border-gray-200"></td>
                                                <td className="p-2"></td>
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
                                                <td className="p-2 border-x border-gray-200">{formatMoney(payrollData?.basicPay || 0)}</td>
                                            </tr>
                                            <tr className="border border-gray-200 h-12">
                                                <td colSpan={3} className="p-2 border-x border-gray-200">Total Gross Income</td>

                                            </tr>

                                        </tbody>
                                    </table>
                                </td>
                                <td className="w-1/2">
                                    <table className="w-full">
                                        <tbody>
                                            <tr className="border border-gray-200 h-12">
                                                <td className="p-2">SSS Contribution:</td>
                                                <td className="p-2 border-x border-gray-200">{formatMoney(payrollData?.governmentContributions.sss || 0)}</td>
                                            </tr>
                                            <tr className="border border-gray-200 h-12">
                                                <td className="p-2">PhilHealth:</td>
                                                <td className="p-2 border-x border-gray-200">{formatMoney(payrollData?.governmentContributions.philHealth || 0)}</td>
                                            </tr>
                                            <tr className="border border-gray-200 h-12">
                                                <td className="p-2">Pag-IBIG:</td>
                                                <td className="p-2 border-x border-gray-200">{formatMoney(payrollData?.governmentContributions.pagIbig || 0)}</td>
                                            </tr>
                                            <tr className="border border-gray-200 h-12">
                                                <td className="p-2"></td>
                                                <td className="p-2 border-x border-gray-200"></td>
                                            </tr>
                                            <tr className="border border-gray-200 h-12">
                                                <td className="p-2"></td>
                                                <td className="p-2 border-x border-gray-200"></td>
                                            </tr>
                                            <tr className="border border-gray-200 h-12">
                                                <td className="p-2"></td>
                                                <td className="p-2 border-x border-gray-200"></td>
                                            </tr>
                                            <tr className="border border-gray-200 h-12">
                                                <td className="p-2"></td>
                                                <td className="p-2 border-x border-gray-200"></td>
                                            </tr>
                                            <tr className="border border-gray-200 h-12">
                                                <td className="p-2 col-span-2"></td>

                                            </tr>
                                            <tr className="border border-gray-200 h-12">
                                                <td className="p-2 col-span-2">Total Deduction</td>
                                                <td className="p-2 border-x border-gray-200">{formatMoney(totalDeduction || 0)}</td>

                                            </tr>
                                            <tr className="border border-gray-200 h-12">
                                                <td className="p-2 col-span-2">Total Net Pay</td>
                                                <td className="p-2 border-x border-gray-200">{formatMoney(payrollData?.netPay || 0)}</td>

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