"use client"

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { useState } from "react"
import { toast } from "sonner"
import { Doc } from "../../../../convex/_generated/dataModel"
import { XCircle } from "lucide-react"
import { useDeclineRegistration } from "@/features/employees/api/employees"

interface DeclineRegistrationDialogProps {
    employee: Doc<"users">
}

export function DeclineRegistrationDialog({ employee }: DeclineRegistrationDialogProps) {
    const [open, setOpen] = useState(false)
    const [reason, setReason] = useState("")
    const decline = useDeclineRegistration()

    async function handleDecline() {
        try {
            await decline({
                userId: employee._id,
                reason,
            })
            toast.success("Registration declined successfully")
            setOpen(false)
        } catch (error) {
            toast.error("Failed to decline registration")
            console.error(error)
        }
    }

    return (
        <>
            <Button
                variant="ghost"
                size="icon"
                onClick={() => setOpen(true)}
                className="text-destructive hover:text-destructive"
                title="Decline Registration"
            >
                <XCircle className="h-4 w-4" />
            </Button>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Decline Registration</DialogTitle>
                        <DialogDescription>
                            This will prevent {employee.firstName} {employee.lastName} from accessing the employee portal.
                            This action can be reversed later.
                        </DialogDescription>
                    </DialogHeader>

                    <Textarea
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="Please provide a reason for declining the registration"
                        className="min-h-[100px]"
                    />

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDecline}
                            disabled={!reason}
                        >
                            Decline Registration
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}