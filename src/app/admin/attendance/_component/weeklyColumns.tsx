import { ColumnDef } from "@tanstack/react-table"
import {  AttendanceWithUser } from "@/lib/types"


export const weeklyColumns: ColumnDef<AttendanceWithUser>[] = [
   
    {
        header: "Employee Id",
        accessorKey: "userId",
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
        id: "Mon",
      
        header: "Mon",
        cell: ({ row }) => {
    
          const attendance = row.original;
          const timeIn = new Date(attendance.timeIn);
          const timeOut = attendance.timeOut ? new Date(attendance.timeOut) : null;
          
          // Check if the date is a Monday
          const isMonday = timeIn.getDay() === 1;
          
          let hoursWorked = 0;
          if (isMonday && timeOut) {
            const diffMs = timeOut.getTime() - timeIn.getTime();
            hoursWorked = Math.round(diffMs / (1000 * 60 * 60) * 10) / 10;
          }

          return (
            <div className="flex items-center justify-center">
              <span className="text-xs">{hoursWorked > 0 ? `${hoursWorked}h` : '-'}</span>
            </div>
        )
        },
    },
    {
        id: "Tue",
    
        header: "Tue",
        cell: ({ row }) => {
    
          const attendance = row.original;
          const timeIn = new Date(attendance.timeIn);
          const timeOut = attendance.timeOut ? new Date(attendance.timeOut) : null;
          
          // Check if the date is a Tuesday
          const isTuesday = timeIn.getDay() === 2;
          
          let hoursWorked = 0;
          if (isTuesday && timeOut) {
            const diffMs = timeOut.getTime() - timeIn.getTime();
            hoursWorked = Math.round(diffMs / (1000 * 60 * 60) * 10) / 10;
          }

          return (
            <div className="flex items-center justify-center">
              <span className="text-xs">{hoursWorked > 0 ? `${hoursWorked}h` : '-'}</span>
            </div>
          )
        },
    },
    {
        id: "Wed",
   
        header: "Wed",
        cell: ({ row }) => {
    
          const attendance = row.original;
          const timeIn = new Date(attendance.timeIn);
          const timeOut = attendance.timeOut ? new Date(attendance.timeOut) : null;
          
          // Check if the date is a Wednesday
          const isWednesday = timeIn.getDay() === 3;
          
          let hoursWorked = 0;
          if (isWednesday && timeOut) {
            const diffMs = timeOut.getTime() - timeIn.getTime();
            hoursWorked = Math.round(diffMs / (1000 * 60 * 60) * 10) / 10;
          }

          return (
            <div className="flex items-center justify-center">
              <span className="text-xs">{hoursWorked > 0 ? `${hoursWorked}h` : '-'}</span>
            </div>
          )
        },
    },
    {
        id: "Thu",
     
        header: "Thu", 
        cell: ({ row }) => {
    
          const attendance = row.original;
          const timeIn = new Date(attendance.timeIn);
          const timeOut = attendance.timeOut ? new Date(attendance.timeOut) : null;
          
          // Check if the date is a Thursday
          const isThursday = timeIn.getDay() === 4;
          
          let hoursWorked = 0;
          if (isThursday && timeOut) {
            const diffMs = timeOut.getTime() - timeIn.getTime();
            hoursWorked = Math.round(diffMs / (1000 * 60 * 60) * 10) / 10;
          }

          return (
            <div className="flex items-center justify-center">
              <span className="text-xs">{hoursWorked > 0 ? `${hoursWorked}h` : '-'}</span>
            </div>
          )
        },
    },
    {
        id: "Fri",
     
        header: "Fri",
        cell: ({ row }) => {
    
          const attendance = row.original;
          const timeIn = new Date(attendance.timeIn);
          const timeOut = attendance.timeOut ? new Date(attendance.timeOut) : null;
          
          // Check if the date is a Friday
          const isFriday = timeIn.getDay() === 5;
          
          let hoursWorked = 0;
          if (isFriday && timeOut) {
            const diffMs = timeOut.getTime() - timeIn.getTime();
            hoursWorked = Math.round(diffMs / (1000 * 60 * 60) * 10) / 10;
          }

          return (
            <div className="flex items-center justify-center">
              <span className="text-xs">{hoursWorked > 0 ? `${hoursWorked}h` : '-'}</span>
            </div>
          )
        },
    },
    {
        id: "Sat",

        header: "Sat",
        cell: ({ row }) => {
    
          const attendance = row.original;
          const timeIn = new Date(attendance.timeIn);
          const timeOut = attendance.timeOut ? new Date(attendance.timeOut) : null;
          
          // Check if the date is a Saturday
          const isSaturday = timeIn.getDay() === 6;
          
          let hoursWorked = 0;
          if (isSaturday && timeOut) {
            const diffMs = timeOut.getTime() - timeIn.getTime();
            hoursWorked = Math.round(diffMs / (1000 * 60 * 60) * 10) / 10;
          }

          return (
            <div className="flex items-center justify-center">
              <span className="text-xs">{hoursWorked > 0 ? `${hoursWorked}h` : '-'}</span>
            </div>
          )
        },
    },
    {
        id: "Sun",
  
        header: "Sun",
        cell: ({ row }) => {
    
          const attendance = row.original;
          const timeIn = new Date(attendance.timeIn);
          const timeOut = attendance.timeOut ? new Date(attendance.timeOut) : null;
          
          // Check if the date is a Sunday
          const isSunday = timeIn.getDay() === 0;
          
          let hoursWorked = 0;
          if (isSunday && timeOut) {
            const diffMs = timeOut.getTime() - timeIn.getTime();
            hoursWorked = Math.round(diffMs / (1000 * 60 * 60) * 10) / 10;
          }

          return (
            <div className="flex items-center justify-center">
              <span className="text-xs">{hoursWorked > 0 ? `${hoursWorked}h` : '-'}</span>
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
              <span className="text-xs font-medium">{totalHours}h</span>
            </div>
          )
        },
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
            // Calculate overtime (hours worked beyond 8 hours)
            overtime = hoursWorked > 8 ? Math.round((hoursWorked - 8) * 10) / 10 : 0;
          }

          return (
            <div className="flex items-center justify-center">
              <span className="text-xs text-orange-600 font-medium">
                {overtime > 0 ? `${overtime}h` : '-'}
              </span>
            </div>
          )
        },
    },
    {
        id: "absences",

        header: "Absences",
        cell: ({ row }) => {
          const attendance = row.original;
          const timeIn = new Date(attendance.timeIn);
          
          // Assuming work week is Monday-Friday
          const isWeekday = timeIn.getDay() !== 0 && timeIn.getDay() !== 6;
          const isAbsent = isWeekday && !attendance.timeIn;
          
          return (
            <div className="flex items-center justify-center">
              <span className="text-xs text-red-600 font-medium">
                {isAbsent ? 'Absent' : '-'}
              </span>
            </div>
          )
        },
    }
]