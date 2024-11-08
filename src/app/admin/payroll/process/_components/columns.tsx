import { ColumnDef } from "@tanstack/react-table"
import { SalaryComponent } from "@/lib/types"
import { api } from "../../../../../../convex/_generated/api"
import { useQuery } from "convex/react"

export const columns: ColumnDef<SalaryComponent>[] = [
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
                <div className="flex items-start gap-x-2">
                    <div>
                        <h1 className="text-xs">{lastName}, {firstName} {middleNameInitial}.</h1>
                    </div>
                </div>
            )
        },
    },
    {
        id: "daysWorked",
        header: "Days Worked",
        cell: ({ row }) => {
            const DaysWorkedCell = () => {
                const attendanceRecords = useQuery(api.attendance.listByUserAndDateRange, {
                    userId: row.original.userId,
                    startDate: row.original.payrollPeriod.startDate,
                    endDate: row.original.payrollPeriod.endDate
                });

                const daysWorked = attendanceRecords?.filter(record => 
                    record.status === "Present" || record.status === "Late"
                ).length ?? 0;

                return (
                    <div className="flex items-center justify-center">
                        <span className="text-xs">{daysWorked}</span>
                    </div>
                );
            };

            return <DaysWorkedCell />;
        }
    },
    // {
    //     id: "ratePerDay", 
    //     header: "Rate/Day",
    //     cell: ({ row }) => {
    //         const ratePerDay = row.original.ratePerDay;
            
    //         return (
    //             <div className="flex items-center justify-center">
    //                 <span className="text-xs">₱{ratePerDay.toLocaleString()}</span>
    //             </div>
    //         )
    //     }
    // },
]