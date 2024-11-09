import { ColumnDef } from "@tanstack/react-table"
import { AttendanceWithUser } from "@/lib/types"
import { ArrowUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

// Constants
const EXPECTED_MONTHLY_HOURS = 176 // 8 hours * 22 working days

// Utility functions
function formatName(firstName: string, lastName: string, middleName?: string): string {
  const middleInitial = middleName ? `${middleName.charAt(0)}.` : ''
  return `${lastName}, ${firstName} ${middleInitial}`
}

function calculateHours(timeIn: Date, timeOut: Date | null): number {
  if (!timeOut) return 0
  const diffMs = timeOut.getTime() - timeIn.getTime()
  return Math.round(diffMs / (1000 * 60 * 60) * 10) / 10
}

function calculateOvertime(hoursWorked: number): number {
  return hoursWorked > 8 ? Math.round((hoursWorked - 8) * 10) / 10 : 0
}

// Reusable cell components
function CellWrapper({ 
  children, 
  className = "" 
}: { 
  children: React.ReactNode
  className?: string 
}) {
  return (
    <div className={cn("flex items-center justify-center", className)}>
      <span className="text-xs">{children}</span>
    </div>
  )
}

function StatBadge({ 
  value, 
  
}: { 
  value: string | number
  variant?: "default" | "warning" | "success" | "destructive" 
}) {
  return (
    <Badge variant={'default'} className="font-medium">
      {value}
    </Badge>
  )
}

export const monthlyColumns: ColumnDef<AttendanceWithUser>[] = [
    {
        id: "name",
        accessorFn: row => formatName(row.employee.firstName, row.employee.lastName, row.employee.middleName),
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="w-full"
          >
            Employee Name
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => {
          const { firstName, lastName, middleName } = row.original.employee
          return (
            <div className="flex items-start">
              <span className="text-xs font-medium">
                {formatName(firstName, lastName, middleName)}
              </span>
            </div>
          )
        },
    },
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
          return calculateHours(timeIn, timeOut)
        },
        cell: ({ row }) => {
          const timeIn = new Date(row.original.timeIn)
          const timeOut = row.original.timeOut ? new Date(row.original.timeOut) : null
          const hours = calculateHours(timeIn, timeOut)
          
          const variant = hours >= EXPECTED_MONTHLY_HOURS ? "success" : "warning"
          
          return (
            <CellWrapper>
              <StatBadge value={`${hours}h`} variant={variant} />
            </CellWrapper>
          )
        },
    },
    {
        id: "expectedHours",
        header: "Expected Hours",
        cell: () => (
          <CellWrapper>
            <StatBadge value={`${EXPECTED_MONTHLY_HOURS}h`} />
          </CellWrapper>
        ),
    },
    {
        id: "overtime",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="w-full"
          >
            Overtime
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        accessorFn: row => {
          const timeIn = new Date(row.timeIn)
          const timeOut = row.timeOut ? new Date(row.timeOut) : null
          const hours = calculateHours(timeIn, timeOut)
          return calculateOvertime(hours)
        },
        cell: ({ row }) => {
          const timeIn = new Date(row.original.timeIn)
          const timeOut = row.original.timeOut ? new Date(row.original.timeOut) : null
          const hours = calculateHours(timeIn, timeOut)
          const overtime = calculateOvertime(hours)
          
          return (
            <CellWrapper>
              {overtime > 0 ? (
                <StatBadge value={`${overtime}h`} variant="warning" />
              ) : (
                <span className="text-xs">-</span>
              )}
            </CellWrapper>
          )
        },
    },
    {
        id: "attendance",
        header: "Attendance Summary",
        cell: ({ row }) => {
          const { status, type } = row.original
          
          return (
            <div className="flex items-center gap-2 justify-center">
              {status === "Absent" && (
                <StatBadge value="Absent" variant="destructive" />
              )}
              {status === "Late" && (
                <StatBadge value="Late" variant="warning" />
              )}
              {type === "Leave" && (
                <StatBadge value="Leave" variant="default" />
              )}
              {status === "Present" && type !== "Leave" && (
                <StatBadge value="Present" variant="success" />
              )}
            </div>
          )
        },
    }
]