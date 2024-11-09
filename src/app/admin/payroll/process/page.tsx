
import { Suspense } from "react"
import PayrollReport from "./_components/PayrollReport"
 



export default function PayrollPage() {
    return (
        <div className=" px-10">
            <Suspense fallback={<div>Loading...</div>}>
                <PayrollReport />
            </Suspense>
        </div>
    )
}