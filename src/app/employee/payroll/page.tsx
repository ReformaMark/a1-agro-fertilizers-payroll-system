import PayrollList from "@/features/payroll/components/payroll-list";

export default function PayrollPage() {
    
    return (
        <div className="w-full container  ">
            <div className="mb-6 w-full p-4 bg-white shadow-lg rounded-lg">
                <h1 className="text-3xl font-bold"> My Payslips</h1>
                <p className="text-muted-foreground">
                    View your payslips and salary information
                </p>
            </div> 
            <div className="w-full p-4">    
                <PayrollList />
            </div>
        </div>
    )
}