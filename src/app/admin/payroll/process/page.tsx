
import { Suspense } from "react"
import PayrollReport from "./_components/PayrollReport"
 



export default function PayrollPage() {
    return (
        <div className=" px-10 container mx-auto py-10">
            <h1 className="text-2xl font-bold mb-6">Payroll Report</h1>
            <Suspense fallback={<div>Loading...</div>}>
                <PayrollReport />
            </Suspense>
        </div>
    )
}