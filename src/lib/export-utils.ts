import { saveAs } from 'file-saver'
import * as XLSX from 'xlsx'

interface ExportOptions {
    fileName: string
    sheetName: string
}

export function exportToExcel<T>(data: T[], options: ExportOptions) {
    const worksheet = XLSX.utils.json_to_sheet(data)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, options.sheetName)
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
    const fileData = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' })
    saveAs(fileData, `${options.fileName}.xlsx`)
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function formatLoanDataForExport(loans: any[], type: 'company' | 'government') {
    return loans.map(loan => {
        const baseData = {
            "Employee Name": `${loan.user?.firstName} ${loan.user?.lastName}`,
            "Status": loan.status,
            "Amount": loan.amount,
            "Monthly Amortization": loan.amortization,
            "Total Amount": loan.totalAmount,
            "Date Requested": new Date(loan.createdAt).toLocaleDateString(),
            "Date Approved": loan.approvedAt ? new Date(loan.approvedAt).toLocaleDateString() : 'N/A',
            "Approved By": loan.approvedBy ? "Admin" : 'N/A',
            "Rejection Reason": loan.rejectionReason || 'N/A',
        }

        if (type === 'company') {
            return {
                ...baseData,
                "Loan Type": loan.type,
                "Remarks": loan.remarks || 'N/A',
            }
        }

        return {
            ...baseData,
            "Application Type": loan.applicationType,
            "Application No.": loan.applicationNo,
            "Start Date": new Date(loan.startDate).toLocaleDateString(),
            "Monthly Schedule": loan.monthlySchedule,
            "Additional Info": loan.additionalInfo || 'N/A',
        }
    })
} 