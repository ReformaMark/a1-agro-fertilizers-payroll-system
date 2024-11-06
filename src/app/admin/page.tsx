import { Skeleton } from "@/components/ui/skeleton";

const AdminPage = () => {
    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Skeleton className="h-28 rounded-xl border bg-card p-6">
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-1/2" />
                        <Skeleton className="h-6 w-3/4" />
                    </div>
                </Skeleton>
                <Skeleton className="h-28 rounded-xl border bg-card p-6">
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-1/2" />
                        <Skeleton className="h-6 w-3/4" />
                    </div>
                </Skeleton>
                <Skeleton className="h-28 rounded-xl border bg-card p-6">
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-1/2" />
                        <Skeleton className="h-6 w-3/4" />
                    </div>
                </Skeleton>
                <Skeleton className="h-28 rounded-xl border bg-card p-6">
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-1/2" />
                        <Skeleton className="h-6 w-3/4" />
                    </div>
                </Skeleton>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Skeleton className="col-span-4 h-[400px] rounded-xl border bg-card" />
                <Skeleton className="col-span-3 h-[400px] rounded-xl border bg-card" />
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Skeleton className="col-span-4 h-[400px] rounded-xl border bg-card" />
                <Skeleton className="col-span-3 h-[400px] rounded-xl border bg-card" />
            </div>
        </div>
    )
};

export default AdminPage;