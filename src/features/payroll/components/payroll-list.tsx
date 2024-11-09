'use client'
import TimePeriod from '@/features/attendance/components/time-period'
import React, { useState } from 'react'
import Payslip from './payslip'
import { getCurrentTimePeriod } from '@/lib/utils'

function PayrollList() {
  const getCurrentDate = () => {
      const date = new Date()
      return date.toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric'
      })
  }  
  const [selectedDate, setSelectedDate] = useState<string>(getCurrentDate())

  return (

      <div className="space-y-4 bg-white p-5">
        {TimePeriod(selectedDate, setSelectedDate)}
        <div className="w-full">
          <Payslip startDate={getCurrentTimePeriod(new Date(selectedDate)).start.toISOString()} endDate={getCurrentTimePeriod(new Date(selectedDate)).end.toISOString()} />
        </div>
      </div>
  
  )
}

export default PayrollList