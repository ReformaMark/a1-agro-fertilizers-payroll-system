"use client"

import { ColumnDef } from "@tanstack/react-table"
import { AttendanceWithUser } from "@/lib/types"
import { ArrowUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { timeStringToComponents } from "@/lib/utils"

// Utility functions
function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric'
  })
}

export function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  })
}

function calculateHours(timeIn: Date, timeOut: Date | null): number {
  if (!timeOut) return 0
  const diffMs = timeOut.getTime() - timeIn.getTime()
  return Math.round(diffMs / (1000 * 60 * 60) * 10) / 10
}

export const columns: ColumnDef<AttendanceWithUser>[] = [

    {
        id: "date",
        accessorKey: "date",
        header: ({ column }) => (
          <div className="text-center">
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
              Date
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          </div>
        ),
        cell: ({ row }) => {
          const date = new Date(row.original.date)
          return <div className="text-center">{formatDate(date)}</div>
        },
    },
    {
        id: "employeeTypeId",
        accessorKey: "employeeTypeId",
        header: ({ column }) => (
          <div className="text-center">
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
              Employee ID
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          </div>
        ),
        cell: ({ row }) => {
          const employeeId = row.original.employee.employeeTypeId
          return <div className="text-center">{employeeId}</div>
        },
    },
    {
        id: "timeIn",
        accessorKey: "timeIn",
        header: ({ column }) => (
          <div className="text-center">
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
              Time In
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          </div>
        ),
        cell: ({ row }) => {
   
          const timeIn = row.original.timeIn
          const {hours} = timeStringToComponents(timeIn)
          const isLate = hours > 8
          return <div className={`${isLate ? 'text-red-500' : ''} text-center`}>{timeIn}</div>
        },
    },
    {
        id: "timeOut",
        accessorKey: "timeOut",
        header: ({ column }) => (
          <div className="text-center">
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
              Time Out
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          </div>
        ),
        cell: ({ row }) => {
          const timeOut = row.original.timeOut ? row.original.timeOut : null
          if (!timeOut) return <div className="text-center">-</div>
          const {hours} = timeStringToComponents(timeOut)
        
          const isUnderTime = hours && hours < 17
          return <div className={`${isUnderTime ? 'text-red-500' : ''} text-center`}>{timeOut}</div>
        },
    },
    {
      id: "totalHours",
      accessorFn: row => calculateHours(new Date(row.timeIn), row.timeOut ? new Date(row.timeOut) : null),
      header: ({ column }) => (
        <div className="text-center">
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Total Hours
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        </div>
      ),
      cell: ({ row }) => {
        const timeIn = timeStringToComponents(row.original.timeIn)
        const timeOut = row.original.timeOut ? timeStringToComponents(row.original.timeOut) : null
        let hours = 0
        
        if (timeOut) {
          // Adjust timeIn to 8 AM if employee arrived earlier
          const adjustedTimeInHours = timeIn.hours < 8 ? 8 : timeIn.hours
          const adjustedTimeInMinutes = timeIn.hours < 8 ? 0 : timeIn.minutes

          // Cap timeOut at 5 PM (17:00) for regular hours calculation
          const cappedTimeOutHours = timeOut.hours > 17 ? 17 : timeOut.hours
          const cappedTimeOutMinutes = timeOut.hours > 17 ? 0 : timeOut.minutes

          // Calculate total minutes
          const totalMinutes = 
            ((cappedTimeOutHours * 60) + cappedTimeOutMinutes) - 
            ((adjustedTimeInHours * 60) + adjustedTimeInMinutes)

          // Subtract 1 hour (60 minutes) break time if timeOut is after 1 PM
          const breakDeduction = timeOut.hours > 13 ? 60 : 0
          
          hours = Math.max(0, (totalMinutes - breakDeduction) / 60)
        }

        return <div className="text-center">{hours > 0 ? `${hours.toFixed(1)} hours` : '-'}</div>
      },
  },
    {
        id: "overtimeHours",
        accessorFn: row => {
            if (!row.timeOut) return 0;
            const timeOut = timeStringToComponents(row.timeOut);
            if (!timeOut) return 0;

            const overtimeStartHour = 17;
            const overtimeHours = Math.max(0, timeOut.hours - overtimeStartHour);
            return overtimeHours;
        },
        header: ({ column }) => (
            <div className="text-center">
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Overtime Hours
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            </div>
        ),
        cell: ({ row }) => {
            const timeOut = row.original.timeOut ? timeStringToComponents(row.original.timeOut) : null;
            if (!timeOut) {
                return <div className="text-center">-</div>;
            }

            const overtimeStartHour = 17;
            const overtimeHours = Math.max(0, timeOut.hours - overtimeStartHour);

            return (
                <div className="text-center">
                    {overtimeHours > 0 ? `${overtimeHours} hours` : '-'}
                </div>
            );
        }
    },

    
   
]