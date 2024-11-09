"use client"

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { useMutation } from "convex/react"
import { UserMinus } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { api } from "../../../../convex/_generated/api"
import { Id } from "../../../../convex/_generated/dataModel"

interface ConfirmDemoteAdminDialogProps {
    userId: Id<"users">
    userName: string
}

export function ConfirmDemoteAdminDialog({ userId, userName }: ConfirmDemoteAdminDialogProps) {
    const [open, setOpen] = useState(false)
    const demoteAdmin = useMutation(api.users.demoteAdmin)

    const handleDemoteAdmin = async () => {
        try {
            await demoteAdmin({ userId })
            toast.success("Successfully demoted admin to employee")
            setOpen(false)
        } catch (error) {
            console.error(error)
            toast.error("Failed to demote admin")
        }
    }

    return (
        <>
            <Button
                variant="ghost"
                size="icon"
                onClick={() => setOpen(true)}
                title="Demote to Employee"
            >
                <UserMinus className="h-4 w-4" />
            </Button>

            <AlertDialog open={open} onOpenChange={setOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Demote {userName} to Employee?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action will remove administrative privileges from {userName}.
                            They will become a regular employee.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDemoteAdmin}>
                            Confirm
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}