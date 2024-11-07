import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"

interface RejectedLoanDetailsProps {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    loan: any
    type: "company" | "government"
}

export function RejectedLoanDetails({ loan, type }: RejectedLoanDetailsProps) {
    if (loan.status !== "Rejected") return null

    return (
        <Card className="bg-destructive/5 border-destructive/20">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium">
                        Rejected {type === "company" ? "Company" : "Government"} Loan
                    </CardTitle>
                    <Badge variant="destructive">Rejected</Badge>
                </div>
            </CardHeader>
            <CardContent className="space-y-2">
                <div className="text-sm">
                    <span className="font-medium">Rejection Date:</span>{" "}
                    {format(new Date(loan.modifiedAt), "PPP")}
                </div>
                <div className="text-sm">
                    <span className="font-medium">Reason for Rejection:</span>
                    <p className="mt-1 text-destructive">
                        {loan.rejectionReason}
                    </p>
                </div>
                <div className="text-sm">
                    <span className="font-medium">Requested Amount:</span>{" "}
                    ₱{loan.amount.toLocaleString()}
                </div>
                {type === "government" && (
                    <>
                        <div className="text-sm">
                            <span className="font-medium">Application Type:</span>{" "}
                            {loan.applicationType}
                        </div>
                        <div className="text-sm">
                            <span className="font-medium">Application No:</span>{" "}
                            {loan.applicationNo}
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    )
} 