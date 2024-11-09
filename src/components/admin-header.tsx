"use client"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useCurrentUser } from "@/hooks/use-current-user"

export function AdminHeader() {
    const { data: user } = useCurrentUser()

    return (
        <header className="w-full bg-white border-b">
            <div className="container flex flex-col sm:flex-row justify-between items-center py-4 px-4 sm:px-8 space-y-4 sm:space-y-0">
                <h1 className="text-2xl md:text-3xl font-semibold">Dashboard</h1>
                <div className="flex items-center gap-4 sm:gap-6 ml-auto">
                    <div className="flex items-center gap-3 sm:gap-4">
                        <Avatar className="h-10 w-10 sm:h-12 sm:w-12 border-2 border-primary rounded-full">
                            <AvatarImage
                                src={user?.imageUrl ?? undefined}
                                alt={`${user?.firstName ?? ''} ${user?.lastName ?? ''}`}
                                className="object-cover"
                            />
                            <AvatarFallback className="bg-primary/10 text-primary font-medium">
                                {user?.firstName?.[0]}
                                {user?.lastName?.[0]}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                            <span className="font-medium text-gray-900">
                                {user?.firstName} {user?.lastName}
                            </span>
                            <span className="text-sm text-gray-500">Administrator</span>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    )
}
