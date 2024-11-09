
import AttendanceList from "@/features/attendance/components/attendance-list"

export default function Attendance() {
    return(
        <div className="w-full container  ">
              <div className="mb-6 w-full p-4 bg-white shadow-lg rounded-lg">
                <h1 className="text-3xl font-bold"> My Attendance</h1>
                <p className="text-muted-foreground">
                    View your attendance history and records 
                </p>
            </div>
            <div className="w-full p-4">
                <AttendanceList />
            </div>
        </div>
    ) 
}