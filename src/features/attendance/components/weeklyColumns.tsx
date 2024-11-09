import { ColumnDef } from "@tanstack/react-table"
import { AttendanceWithUser } from "@/lib/types"
import { ArrowUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"

// Utility functions
function formatName(firstName: string, lastName: string, middleName?: string): string {
  const middleInitial = middleName ? `${middleName.charAt(0)}.` : ''
  return `${lastName}, ${firstName} ${middleInitial}`
}

function calculateDayHours(timeIn: Date, timeOut: Date | null, targetDay: number): number {
  if (!timeOut || timeIn.getDay() !== targetDay) return 0
  const diffMs = timeOut.getTime() - timeIn.getTime()
  return Math.round(diffMs / (1000 * 60 * 60) * 10) / 10
}

interface DayColumnProps {
  day: number
  header: string
}

// Reusable cell components
function CellWrapper({ children, className = "" }: { children: React.ReactNode, className?: string }) {
  return (
    <div className="flex items-center justify-center">
      <span className={`text-xs ${className}`}>{children}</span>
    </div>
  )
}

function createDayColumn({ day, header }: DayColumnProps): ColumnDef<AttendanceWithUser> {
  return {
    id: header,
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="w-full"
      >
        {header}
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const attendance = row.original
      const timeIn = new Date(attendance.timeIn)
      const timeOut = attendance.timeOut ? new Date(attendance.timeOut) : null
      const hoursWorked = calculateDayHours(timeIn, timeOut, day)
      
      return <CellWrapper>{hoursWorked > 0 ? `${hoursWorked}h` : '-'}</CellWrapper>
    }
  }
}

export const weeklyColumns: ColumnDef<AttendanceWithUser>[] = [
    {
        id: "name",
        accessorFn: row => formatName(row.employee.firstName, row.employee.lastName, row.employee.middleName),
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="w-full"
          >
            Name
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => {
          const { firstName, lastName, middleName } = row.original.employee
          return (
            <div className="flex items-start">
              <span className="text-xs">{formatName(firstName, lastName, middleName)}</span>
            </div>
          )
        },
    },
    createDayColumn({ day: 1, header: "Mon" }),
    createDayColumn({ day: 2, header: "Tue" }),
    createDayColumn({ day: 3, header: "Wed" }),
    createDayColumn({ day: 4, header: "Thu" }),
    createDayColumn({ day: 5, header: "Fri" }),
    createDayColumn({ day: 6, header: "Sat" }),
    createDayColumn({ day: 0, header: "Sun" }),
    {
        id: "totalHours",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="w-full"
          >
            Total Hours
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        accessorFn: row => {
          const timeIn = new Date(row.timeIn)
          const timeOut = row.timeOut ? new Date(row.timeOut) : null
          return timeOut ? (timeOut.getTime() - timeIn.getTime()) / (1000 * 60 * 60) : 0
        },
        cell: ({ row }) => {
          const timeIn = new Date(row.original.timeIn)
          const timeOut = row.original.timeOut ? new Date(row.original.timeOut) : null
          const totalHours = timeOut ? Math.round((timeOut.getTime() - timeIn.getTime()) / (1000 * 60 * 60) * 10) / 10 : 0
          
          return <CellWrapper className="font-medium">{`${totalHours}h`}</CellWrapper>
        },
    },
    {
        id: "overtime",
        header: "Overtime",
        accessorFn: row => {
          const timeIn = new Date(row.timeIn)
          const timeOut = row.timeOut ? new Date(row.timeOut) : null
          if (!timeOut) return 0
          const hoursWorked = (timeOut.getTime() - timeIn.getTime()) / (1000 * 60 * 60)
          return hoursWorked > 8 ? hoursWorked - 8 : 0
        },
        cell: ({ row }) => {
          const timeIn = new Date(row.original.timeIn)
          const timeOut = row.original.timeOut ? new Date(row.original.timeOut) : null
          let overtime = 0
          
          if (timeOut) {
            const hoursWorked = (timeOut.getTime() - timeIn.getTime()) / (1000 * 60 * 60)
            overtime = hoursWorked > 8 ? Math.round((hoursWorked - 8) * 10) / 10 : 0
          }

          return (
            <CellWrapper className="text-orange-600 font-medium">
              {overtime > 0 ? `${overtime}h` : '-'}
            </CellWrapper>
          )
        },
    },
    {
        id: "absences",
        header: "Absences",
        cell: ({ row }) => {
          const timeIn = new Date(row.original.timeIn)
          const isWeekday = timeIn.getDay() !== 0 && timeIn.getDay() !== 6
          const isAbsent = isWeekday && !row.original.timeIn
          
          return (
            <CellWrapper className="text-red-600 font-medium">
              {isAbsent ? 'Absent' : '-'}
            </CellWrapper>
          )
        },
    }
]