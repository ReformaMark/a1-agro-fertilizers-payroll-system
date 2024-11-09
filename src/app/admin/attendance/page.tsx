
import { Suspense } from "react"

import AttendanceReport from "./_component/attendanceReport"

function AttendancePage() {
  return (
    <div className=" px-10 container mx-auto ">
      <h1 className="text-2xl font-bold mb-6">Attendance Report</h1>
      <Suspense fallback={<div>Loading...</div>}>
        <AttendanceReport />
      </Suspense>
    </div>
  )
}


export default AttendancePage