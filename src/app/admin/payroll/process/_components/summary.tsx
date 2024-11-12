/* eslint-disable @typescript-eslint/no-explicit-any */

import React from 'react'

import { SalaryComponent } from '@/lib/types';
import { api } from '../../../../../../convex/_generated/api';
import { useQuery } from 'convex/react';
import { formatMoney, isCurrentPeriod } from '@/lib/utils';

function Summary({data}:{data:SalaryComponent[]}) {
    const loans = useQuery(api.loans.getGovernmentLoans, {
        status: 'Approved'
    })

    const totalHoursWorked = data.reduce((acc, curr) => acc + (curr.hoursWorked ?? 0), 0)
    const totalRatePerDay = data.reduce((acc, curr) => acc + (curr.employee.ratePerDay ?? 0), 0)
    const totalGrossIncome = data.reduce((acc, curr) => acc + ((curr.hoursWorked ?? 0) * (curr.employee.ratePerDay ?? 0) / 8), 0)
   
    const sssContribution = data.reduce((acc, curr) => acc + (curr.governmentContributions.sss ?? 0), 0)
    const philHealthContribution = data.reduce((acc, curr) => acc + (curr.governmentContributions.philHealth ?? 0), 0)
    const pagibigContribution = data.reduce((acc, curr) => acc + (curr.governmentContributions.pagIbig ?? 0), 0)
   
    const sssCalamityLoan = loans?.find(loan => loan.applicationType === 'SSS Calamity' && isCurrentPeriod(loan))?.amortization ?? 0
    const sssSalaryLoan = loans?.find(loan => loan.applicationType === 'SSS Salary' && isCurrentPeriod(loan))?.amortization ?? 0
    const pagibigLoan = loans?.find(loan => loan.applicationType === 'Pagibig Multi-purpose' && isCurrentPeriod(loan))?.amortization ?? 0
    const pagibigCalamityLoan = loans?.find(loan => loan.applicationType === 'Pagibig Calamity' && isCurrentPeriod(loan))?.amortization ?? 0

    const totalDeductions = data.reduce((acc, curr) => acc + (curr.deductions?.reduce((acc, curr) => acc + curr.amount, 0) ?? 0), 0)
    const totalNetPay = totalGrossIncome - totalDeductions - (sssCalamityLoan + sssSalaryLoan + pagibigLoan + pagibigCalamityLoan)
    if(!data) return null
  return (
    <tfoot>
    <tr >
        <td colSpan={2} className="px-6 py-3 text-left text-nowrap text-xs font-extrabold uppercase tracking-wider">TOTAL</td>
        <td className="px-6 py-3 text-left text-nowrap text-xs font-extrabold uppercase tracking-wider">{totalHoursWorked.toFixed(1)}</td>
        <td className="px-6 py-3 text-left text-nowrap text-xs font-extrabold uppercase tracking-wider">{formatMoney(totalRatePerDay)}</td>
        <td className="px-6 py-3 text-left text-nowrap text-xs font-extrabold uppercase tracking-wider">{formatMoney(totalGrossIncome)}</td>
        <td className="px-6 py-3 text-left text-nowrap text-xs font-extrabold uppercase tracking-wider">{formatMoney(sssContribution)}</td>
        <td className="px-6 py-3 text-left text-nowrap text-xs font-extrabold uppercase tracking-wider">{formatMoney(philHealthContribution)}</td>
        <td className="px-6 py-3 text-left text-nowrap text-xs font-extrabold uppercase tracking-wider">{formatMoney(pagibigContribution)}</td>
        <td className="px-6 py-3 text-left text-nowrap text-xs font-extrabold uppercase tracking-wider">{formatMoney(sssCalamityLoan)}</td>
        <td className="px-6 py-3 text-left text-nowrap text-xs font-extrabold uppercase tracking-wider">{formatMoney(sssSalaryLoan)}</td>
        <td className="px-6 py-3 text-left text-nowrap text-xs font-extrabold uppercase tracking-wider">{formatMoney(pagibigLoan)}</td>
        <td className="px-6 py-3 text-left text-nowrap text-xs font-extrabold uppercase tracking-wider">{formatMoney(pagibigCalamityLoan)}</td>
        <td className="px-6 py-3 text-left text-nowrap text-xs font-extrabold uppercase tracking-wider">{formatMoney(totalDeductions)}</td>
        <td className="px-6 py-3 text-left text-nowrap text-xs font-extrabold uppercase tracking-wider">{formatMoney(totalNetPay)}</td>
        <td className="px-6 py-3 text-left text-nowrap text-xs font-extrabold uppercase tracking-wider"></td>
    </tr>
    </tfoot>
  )
}

export default Summary