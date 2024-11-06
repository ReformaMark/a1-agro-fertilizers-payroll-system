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
import { Shield } from "lucide-react"
import { useMutation } from "convex/react"
import { api } from "../../../../convex/_generated/api"
import { toast } from "sonner"
import { useState } from "react"
import { Id } from "../../../../convex/_generated/dataModel"

interface ConfirmMakeAdminDialogProps {
    userId: Id<"users">
    userName: string
}

export function ConfirmMakeAdminDialog({ userId, userName }: ConfirmMakeAdminDialogProps) {
    const [open, setOpen] = useState(false)
    const makeAdmin = useMutation(api.users.makeAdmin)

    const handleMakeAdmin = async () => {
        try {
            await makeAdmin({ userId })
            toast.success("Successfully made user an admin")
            setOpen(false)
        } catch (error) {
            toast.error("Failed to make user an admin")
        }
    }

    return (
        <>
            <Button
                variant="ghost"
                size="icon"
                onClick={() => setOpen(true)}
                title="Make Admin"
            >
                <Shield className="h-4 w-4" />
            </Button>

            <AlertDialog open={open} onOpenChange={setOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Make {userName} an Admin?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action will give {userName} full administrative privileges.
                            This cannot be easily undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleMakeAdmin}>
                            Confirm
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}