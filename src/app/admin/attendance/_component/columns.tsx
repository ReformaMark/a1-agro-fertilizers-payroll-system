"use client"

import { ColumnDef } from "@tanstack/react-table"
import { AttendanceWithUser } from "@/lib/types"

export const columns: ColumnDef<AttendanceWithUser>[] = [
    {
        id: "date",
        accessorKey: "timeIn",
        header: "Date",
        cell: ({ row }) => {
            const attendance = row.original;
            const date = new Date(attendance.timeIn);
            
            // Format date as MM/DD/YYYY
            const formattedDate = date.toLocaleDateString('en-US', {
                month: '2-digit',
                day: '2-digit', 
                year: 'numeric'
            });

            return (
                <div className="flex items-center justify-center">
                    <span className="text-xs">{formattedDate}</span>
                </div>
            )
        },
    },
    {
        accessorKey: "userId",
        header: "User ID",
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
      id: "timeIn",
      accessorKey: "TimeIn",
      header: "Time In",
      cell: ({ row }) => {
  
        const attendance = row.original;
        const timeIn = new Date(attendance.timeIn);
        
        // Format time as HH:MM
        const formattedTime = timeIn.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        });

            return (
                <div className="flex items-center justify-center">
                    <span className="text-xs">{formattedTime}</span>
                </div>
            )
        },
    },
    {
        id: "timeOut",
        accessorKey: "timeOut",
        header: "Time Out",
        cell: ({ row }) => {
            const attendance = row.original;
            const timeOut = attendance.timeOut ? new Date(attendance.timeOut) : null;
            
            if (!timeOut) return <span className="text-xs">-</span>;

            const formattedTime = timeOut.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            });

            return (
                <div className="flex items-center justify-center">
                    <span className="text-xs">{formattedTime}</span>
                </div>
            )
        },
    },
    {
        id: "hoursWorked",
        header: "Hours Worked",
        cell: ({ row }) => {
            const attendance = row.original;
            const timeIn = new Date(attendance.timeIn);
            const timeOut = attendance.timeOut ? new Date(attendance.timeOut) : null;
            
            let hoursWorked = 0;
            if (timeOut) {
                const diffMs = timeOut.getTime() - timeIn.getTime();
                hoursWorked = Math.round(diffMs / (1000 * 60 * 60) * 10) / 10;
            }

            return (
                <div className="flex items-center justify-center">
                    <span className="text-xs">{hoursWorked > 0 ? `${hoursWorked}h` : '-'}</span>
                </div>
            )
        }
    }
]