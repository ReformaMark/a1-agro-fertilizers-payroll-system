import { Button } from "@/components/ui/button";
import { formatMoney } from "@/lib/utils";
import { MessageSquare } from "lucide-react";
import { sendSms } from "@/../actions/twilio";
import { toast } from "sonner";

export default function SmsBtn({ row, setOpen }: { row: { original: { payrollPeriod?: { startDate: string; endDate: string }; netPay: number; employee: { phone: string } } }, setOpen: (open: boolean) => void }) {
   const message = `Your payslip for period ${row.original.payrollPeriod?.startDate} to ${row.original.payrollPeriod?.endDate} is ready. Net pay: ${formatMoney(row.original.netPay)}`

   console.log(row.original.employee.phone)
    return (
        <Button
            variant="outline"
            size="sm" 
            onClick={() => {  
                if (row.original.employee.phone) {
                    toast.promise(sendSms(row.original.employee.phone, message), {
                        loading: 'Sending SMS...',
                        success: 'SMS sent successfully',
                        error: 'Failed to send SMS'
                    })
                    setOpen(false)
                }
            }}  
            className="flex items-center gap-x-2 bg-green-500 text-white hover:bg-green-600" 
       
        >
            <MessageSquare className="mr-2 h-4 w-4" />
            Send SMS
        </Button>
    )
}