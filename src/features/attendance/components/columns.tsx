"use client"

import { ColumnDef } from "@tanstack/react-table"
import { AttendanceWithUser } from "@/lib/types"
import { ArrowUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"

// Utility functions
function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric'
  })
}

function formatTime(date: Date): string {
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
          const timeIn = new Date(row.original.timeIn)
          return <div className="text-center">{formatTime(timeIn)}</div>
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
          const timeOut = row.original.timeOut ? new Date(row.original.timeOut) : null
          return <div className="text-center">{timeOut ? formatTime(timeOut) : '-'}</div>
        },
    },
    
    
    {
        id: "hoursWorked",
        accessorFn: row => calculateHours(new Date(row.timeIn), row.timeOut ? new Date(row.timeOut) : null),
        header: ({ column }) => (
          <div className="text-center">
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
              Hours Worked
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          </div>
        ),
        cell: ({ row }) => {
          const timeIn = new Date(row.original.timeIn)
          const timeOut = row.original.timeOut ? new Date(row.original.timeOut) : null
          
          let hours = 0
          if (timeOut) {
            // Calculate total hours
            hours = calculateHours(timeIn, timeOut)
            
            // Check if timeOut is after 1 PM to subtract break time
            
            if (timeOut.getHours() >= 13) {
              hours = Math.max(0, hours - 1) // Subtract 1 hour break time
            }
          }

          return <div className="text-center">{hours > 0 ? `${hours}h` : '-'}</div>
        },
    },
   
]