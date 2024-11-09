'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useCurrentUser } from '@/hooks/use-current-user'
import React from 'react'
import { usePayrollList } from '../api/use-payroll'

function Payslip({ startDate, endDate }: { startDate: string; endDate: string }) {
    const { data } = useCurrentUser()
    if (!data) return null
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const payroll = usePayrollList({ startDate, endDate, userId: data?._id })

    if (!payroll || payroll === null) return null


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
        <CardContent className='grid grid-cols-2'>
            <div className='border-r border-gray-200 '>
                <p>Rate per day:</p>
                <p>{data.ratePerDay}</p>
            </div>
            <div className='flex flex-col gap-2'>
                <p>{}</p>
                <p>10000</p>
            </div>
        </CardContent>
        </Card>
    </div>
  )
}

export default Payslip