'use client'
import { useMutation } from "convex/react";
import FaceDetection from "./_components/FaceDetection";
import { api } from "../../../convex/_generated/api";
import { useEffect } from "react";
import { getCurrentTimePeriod } from "@/lib/utils";


export default function TimeInOut() {
  const createPayrollPeriod = useMutation(api.payrollPeriods.create)
  const { start, end, } = getCurrentTimePeriod()
  useEffect(() => {
    const formattedStart = start.toISOString().split('T')[0];
    const formattedEnd = end.toISOString().split('T')[0];
    createPayrollPeriod({
      startDate: formattedStart,
      endDate: formattedEnd,
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  
  return (
    <div>
      <FaceDetection />
    </div>
  )
}