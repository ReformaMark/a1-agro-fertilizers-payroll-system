import { ColumnDef } from "@tanstack/react-table"
import { AttendanceWithUser } from "@/lib/types"

export const monthlyColumns: ColumnDef<AttendanceWithUser>[] = [
    {
        id: "userId",
        accessorKey: "userId",
        header: "Employee ID",
    },
    {
        id: "Name",
        accessorKey: "firstName",
        header: "Name",
        cell: ({ row }) => {
    
          const firstName = row.original.employee.firstName
          const lastName = row.original.employee.lastName
          const middleNameInitial = row.original.employee.middleName ? row.original.employee.middleName.charAt(0) : '';
     
          return (
            <div className="flex items-start gap-x-2 ">
               
                <div className="">
                  <h1 className="text-xs">{lastName}, {firstName} {middleNameInitial}.</h1>

                </div>
            </div>
        )
        },
    },
    {
        id: "totalHours",
        header: "Total Hours",
        cell: ({ row }) => {
            const attendance = row.original;
            const timeIn = new Date(attendance.timeIn);
            const timeOut = attendance.timeOut ? new Date(attendance.timeOut) : null;
            
            let totalHours = 0;
            if (timeOut) {
                const diffMs = timeOut.getTime() - timeIn.getTime();
                totalHours = Math.round(diffMs / (1000 * 60 * 60) * 10) / 10;
            }

            return (
                <div className="flex items-center justify-center">
                    <span className="text-xs">{totalHours}h</span>
                </div>
            )
        }
    },
    {
        id: "expectedHours",
        header: "Expected Hours",
        cell: ({  }) => {
            // Assuming 8 hours per working day in a month (approx 22 working days)
            const expectedHours = 176;
            
            return (
                <div className="flex items-center justify-center">
                    <span className="text-xs">{expectedHours}h</span>
                </div>
            )
        }
    },
    {
        id: "overtime",
        header: "Overtime",
        cell: ({ row }) => {
            const attendance = row.original;
            const timeIn = new Date(attendance.timeIn);
            const timeOut = attendance.timeOut ? new Date(attendance.timeOut) : null;
            
            let overtime = 0;
            if (timeOut) {
                const diffMs = timeOut.getTime() - timeIn.getTime();
                const hoursWorked = diffMs / (1000 * 60 * 60);
                overtime = hoursWorked > 8 ? Math.round((hoursWorked - 8) * 10) / 10 : 0;
            }

            return (
                <div className="flex items-center justify-center">
                    <span className="text-xs">{overtime}h</span>
                </div>
            )
        }
    },
    {
        id: "absences",
        header: "Absences",
        cell: ({ row }) => {
            const attendance = row.original;
            const isAbsent = attendance.status === "Absent";
            
            return (
                <div className="flex items-center justify-center">
                    <span className="text-xs">{isAbsent ? "1" : "0"}</span>
                </div>
            )
        }
    },
    {
        id: "lates",
        header: "Lates",
        cell: ({ row }) => {
            const attendance = row.original;
            const isLate = attendance.status === "Late";
            
            return (
                <div className="flex items-center justify-center">
                    <span className="text-xs">{isLate ? "1" : "0"}</span>
                </div>
            )
        }
    },
    {
        id: "leaves",
        header: "Leaves",
        cell: ({ row }) => {
            const attendance = row.original;
            const isLeave = attendance.type === "Leave";
            
            return (
                <div className="flex items-center justify-center">
                    <span className="text-xs">{isLeave ? "1" : "0"}</span>
                </div>
            )
        }
    }
]