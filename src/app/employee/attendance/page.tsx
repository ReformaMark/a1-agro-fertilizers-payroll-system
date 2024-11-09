'use client'
import AttendanceList from "@/features/attendance/components/attendance-list"
import { useCurrentUser } from "@/hooks/use-current-user"

export default function Attendance() {
    const {data} = useCurrentUser()
    return(
        <div className="w-full container  ">
              <div className="mb-6 w-full p-4 bg-white shadow-lg rounded-lg">
                <h1 className="text-3xl font-bold"> My Attendance</h1>
                <p className="text-muted-foreground">
                    View your attendance history and records 
                </p>
            </div>
            <div className="w-full p-4">
                {data && <AttendanceList userId={data?._id} />}
               
            </div>
        </div>
    ) 
}