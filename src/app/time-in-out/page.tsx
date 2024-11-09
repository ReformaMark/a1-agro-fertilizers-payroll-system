'use client'
import { useMutation } from "convex/react";
import FaceDetection from "./_components/FaceDetection";
import { api } from "../../../convex/_generated/api";
import { useEffect } from "react";
import { formatDate, getCurrentTimePeriod } from "@/lib/utils";


export default function TimeInOut() {
  const createPayrollPeriod = useMutation(api.payrollPeriods.create)
  const { start, end } = getCurrentTimePeriod(new Date()) // Explicitly pass current date
  
  useEffect(() => {
    
    createPayrollPeriod({
      startDate:  formatDate(start),
      endDate: formatDate(end),
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  
  return (
    <div>
      <FaceDetection />
    </div>
  )
}