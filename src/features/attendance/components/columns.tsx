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
        // Adjust timeIn to 8 AM if employee arrived earlier
        const adjustedTimeIn = timeIn.hours < 8 ? 8 : timeIn.hours
        let hours = 0
        if (timeOut) {
          // Calculate total hours, preserving minutes only before 5 PM
          let cappedTimeOut = timeOut.hours
          if (timeOut.hours >= 17) {
            // Keep the hours but zero out minutes if after 5 PM
            cappedTimeOut = 0
          }
          hours = adjustedTimeIn + (cappedTimeOut / 60)
          
          // Subtract 1 hour break time if timeOut is after 1 PM

          if (timeOut.hours > 13) {
            hours = Math.max(0, hours - 1)
          }
        }

        return <div className="text-center">{hours > 0 ? `${hours.toFixed(1)} hours` : '-'}</div>
      },
  },
    {
        id: "overtimeHours",
        accessorFn: row => {
            const timeOut = row.timeOut ? new Date(row.timeOut) : null
            if (!timeOut || timeOut.getHours() <= 17) return 0
            
            // Calculate whole hours after 5 PM
            const overtimeHours = timeOut.getHours() - 17
            return overtimeHours
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
            const timeOut = row.original.timeOut ? new Date(row.original.timeOut) : null
            if (!timeOut || timeOut.getHours() <= 17) {
                return <div className="text-center">-</div>
            }

            // Calculate whole hours after 5 PM
            const overtimeHours = timeOut.getHours() - 17
            
            return (
                <div className="text-center">
                    {overtimeHours > 0 ? `${overtimeHours} hours` : '-'}
                </div>
            )
        }
    },

    
   
]