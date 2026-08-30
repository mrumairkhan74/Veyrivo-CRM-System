import { cn } from "../../utils/cn";

export const CardSkeleton = ({ className }) => (
    <div className={cn("rounded-xl border border-slate-200 bg-white p-5 shadow-sm animate-pulse", className)}>
        <div className="h-4 w-3/4 bg-slate-200 rounded mb-4" />
        <div className="h-8 w-1/2 bg-slate-200 rounded mb-2" />
        <div className="h-4 w-1/3 bg-slate-200 rounded" />
    </div>
);

export const TableSkeleton = ({ rows = 5, columns = 7 }) => (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm animate-pulse">
        <table className="w-full min-w-[1000px]">
            <thead className="border-b border-slate-200 bg-slate-50">
                <tr>
                    {Array.from({ length: columns }).map((_, i) => (
                        <th key={i} className="px-5 py-4">
                            <div className="h-4 w-20 bg-slate-200 rounded" />
                        </th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {Array.from({ length: rows }).map((_, row) => (
                    <tr key={row} className="border-b border-slate-100">
                        {Array.from({ length: columns }).map((_, col) => (
                            <td key={col} className="px-5 py-4">
                                <div className="h-4 w-24 bg-slate-200 rounded" />
                            </td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);

export const StatsGridSkeleton = ({ count = 4 }) => (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 animate-pulse">
        {Array.from({ length: count }).map((_, i) => (
            <div key={i} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-slate-200 rounded-lg" />
                    <div>
                        <div className="h-3 w-20 bg-slate-200 rounded mb-2" />
                        <div className="h-6 w-16 bg-slate-200 rounded" />
                    </div>
                </div>
            </div>
        ))}
    </div>
);

export const FormSkeleton = ({ sections = 4 }) => (
    <div className="space-y-6 animate-pulse">
        {Array.from({ length: sections }).map((_, i) => (
            <div key={i} className="space-y-4">
                <div className="h-5 w-40 bg-slate-200 rounded" />
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {Array.from({ length: 4 }).map((_, j) => (
                        <div key={j} className="space-y-1">
                            <div className="h-3 w-20 bg-slate-200 rounded" />
                            <div className="h-10 w-full bg-slate-200 rounded-lg" />
                        </div>
                    ))}
                </div>
            </div>
        ))}
    </div>
);

export const ListSkeleton = ({ items = 4 }) => (
    <div className="space-y-3 animate-pulse">
        {Array.from({ length: items }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-xl border border-slate-100">
                <div className="h-10 w-10 bg-slate-200 rounded-xl" />
                <div className="flex-1 space-y-2">
                    <div className="h-4 w-3/4 bg-slate-200 rounded" />
                    <div className="h-3 w-1/2 bg-slate-200 rounded" />
                </div>
                <div className="h-5 w-20 bg-slate-200 rounded-full" />
            </div>
        ))}
    </div>
);

export const DashboardSkeleton = () => (
    <div className="min-h-screen w-full rounded-md border border-slate-200 bg-gradient-to-br from-cyan-200/20 to-purple-200/20 p-2 shadow-md md:p-4 animate-pulse">
        <div className="m-2 sticky flex flex-col gap-4 rounded-xl bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between md:p-6">
            <div>
                <div className="h-6 w-48 bg-slate-200 rounded mb-2" />
                <div className="h-4 w-64 bg-slate-200 rounded" />
            </div>
            <div className="flex flex-wrap items-center gap-3">
                <div className="flex rounded-lg border border-slate-200 bg-slate-50 p-1">
                    <div className="h-8 w-20 bg-slate-200 rounded-md" />
                    <div className="h-8 w-20 bg-slate-200 rounded-md" />
                    <div className="h-8 w-20 bg-slate-200 rounded-md" />
                </div>
                <div className="h-10 w-32 bg-slate-200 rounded-lg" />
            </div>
        </div>

        <StatsGridSkeleton count={4} />

        <div className="m-2 mt-3">
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="h-5 w-40 bg-slate-200 rounded mb-4" />
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                            <div className="h-3 w-20 bg-slate-200 rounded mb-2" />
                            <div className="h-8 w-16 bg-slate-200 rounded" />
                            <div className="mt-2 h-3 w-24 bg-slate-200 rounded" />
                        </div>
                    ))}
                </div>
            </div>
        </div>

        <div className="m-2 mt-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
            <ListSkeleton items={4} />
            <ListSkeleton items={4} />
        </div>

        <div className="m-2 mt-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="h-5 w-40 bg-slate-200 rounded mb-4" />
                {[45, 72, 38].map((width, i) => (
                    <div key={i} className="space-y-2">
                        <div className="h-3 w-24 bg-slate-200 rounded" />
                        <div className="h-2 w-full bg-slate-100 rounded-full">
                            <div className="h-full bg-slate-200 rounded-full" style={{ width: `${width}%` }} />
                        </div>
                    </div>
                ))}
            </div>
            <div className="rounded-xl border border-purple-100 bg-white p-5 shadow-sm">
                <div className="h-5 w-40 bg-slate-200 rounded mb-4" />
                {Array.from({ length: 2 }).map((_, i) => (
                    <div key={i} className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                        <div className="flex items-start gap-3">
                            <div className="h-10 w-10 bg-slate-200 rounded-xl" />
                            <div className="space-y-2">
                                <div className="h-4 w-40 bg-slate-200 rounded" />
                                <div className="h-3 w-60 bg-slate-200 rounded" />
                                <div className="h-3 w-32 bg-slate-200 rounded" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </div>
);

export const EmptySkeleton = ({ className }) => (
    <div className={cn("flex items-center justify-center h-24", className)}>
        <div className="text-center animate-pulse">
            <div className="h-12 w-12 mx-auto bg-slate-200 rounded-full mb-3" />
            <div className="h-4 w-32 mx-auto bg-slate-200 rounded mb-2" />
            <div className="h-3 w-48 mx-auto bg-slate-200 rounded" />
        </div>
    </div>
);