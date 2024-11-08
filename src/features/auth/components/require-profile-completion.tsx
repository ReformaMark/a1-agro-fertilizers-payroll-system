"use client"

import { useCurrentUser } from "@/hooks/use-current-user"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, LogOut, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuthActions } from "@convex-dev/auth/react"
import { useRouter } from "next/navigation"


interface RequireProfileCompletionProps {
    children: React.ReactNode
}

export function RequireProfileCompletion({ children }: RequireProfileCompletionProps) {
    const { data: currentUser, isLoading: isCurrentUserLoading } = useCurrentUser()
    const { signOut } = useAuthActions()
    const router = useRouter()

    if (isCurrentUserLoading) {
        return null
    }

    if (currentUser?.isDeclinedByAdmin) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Card className="border-destructive max-w-md w-full">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-destructive">
                            <XCircle className="h-5 w-5" />
                            Registration Declined
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground mb-2">
                            Your registration has been declined by the administrator.
                        </p>
                        {currentUser.declinedReason && (
                            <div className="text-sm">
                                <strong>Reason:</strong>
                                <p className="mt-1 text-muted-foreground">{currentUser.declinedReason}</p>
                            </div>
                        )}
                        <Button
                            variant="destructive"
                            className="mt-4"
                            onClick={() => {
                                signOut()
                                router.replace("/auth")
                            }}
                        >
                            <LogOut className="h-4 w-4 mr-2" />
                            Sign Out
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    if (!currentUser?.filledUpByAdmin) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Card className="border-yellow-500 max-w-md w-full">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-yellow-600">
                            <AlertCircle className="h-5 w-5" />
                            Profile Under Review
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">
                            Your profile is currently under review by the HR team. Some features will be limited until your profile is completed.
                        </p>
                        <Button
                            variant="outline"
                            className="mt-4"
                            onClick={() => {
                                signOut()
                                router.replace("/auth")
                            }}
                        >
                            <LogOut className="h-4 w-4 mr-2" />
                            Sign Out
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return children
}