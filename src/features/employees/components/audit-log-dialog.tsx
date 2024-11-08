"use client"

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useQuery } from "convex/react"
import { History } from "lucide-react"
import { api } from "../../../../convex/_generated/api"
import { formatDistanceToNow } from "date-fns"

interface AuditLogEntry {
    action: string
    performedAt: string
    performedByUser: {
        firstName: string
        lastName: string
    }
    details?: string
}

export function AuditLogDialog() {
    const logs = useQuery(api.auditLogs.list) as AuditLogEntry[] | undefined

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                    <History className="h-4 w-4" />
                    View History
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
                <DialogHeader>
                    <DialogTitle className="text-2xl">Employee Management History</DialogTitle>
                </DialogHeader>
                <ScrollArea className="h-[600px] pr-4">
                    <div className="space-y-6">
                        {logs?.map((log, index) => (
                            <div
                                key={index}
                                className="relative pl-6 pb-6 last:pb-0 before:absolute before:left-2 before:top-2 before:h-full before:w-[2px] before:bg-muted last:before:hidden"
                            >
                                <div className="absolute left-0 top-2 h-4 w-4 rounded-full border-2 border-primary bg-background" />
                                <div className="flex flex-col space-y-2 rounded-lg border bg-muted/10 p-4">
                                    <div className="flex items-center justify-between">
                                        <span className="font-semibold text-primary">{log.action}</span>
                                        <span className="text-sm text-muted-foreground">
                                            {formatDistanceToNow(new Date(log.performedAt), { addSuffix: true })}
                                        </span>
                                    </div>
                                    <span className="text-sm text-muted-foreground">
                                        Performed by <span className="font-medium text-foreground">{log.performedByUser.firstName} {log.performedByUser.lastName}</span>
                                    </span>
                                    {log.details && (
                                        <p className="text-sm mt-2 text-foreground/80 bg-muted/50 p-3 rounded-md">
                                            {log.details}
                                        </p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    )
}