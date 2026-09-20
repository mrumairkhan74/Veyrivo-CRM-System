import { useMemo } from "react";
import { Globe, Users, MoreHorizontal, BarChart2, Mail } from "lucide-react";

const LeadSources = ({ leads = [] }) => {
    // Build real source stats from the leads passed in
    const sourceStats = useMemo(() => {
        const counts = {};
        let total = 0;

        leads.forEach((lead) => {
            const key = lead.source || "Other Sources";
            counts[key] = (counts[key] || 0) + 1;
            total += 1;
        });

        // Fallback when there's no data yet
        if (total === 0) {
            return [];
        }

        const iconFor = (name) => {
            const n = name.toLowerCase();
            if (n.includes("website") || n.includes("web"))
                return <Globe size={18} />;
            if (n.includes("referral")) return <Users size={18} />;
            if (n.includes("email")) return <Mail size={18} />;
            return <BarChart2 size={18} />;
        };

        return Object.entries(counts)
            .map(([name, count]) => ({
                name,
                leads: count,
                percentage: Math.round((count / total) * 100),
                icon: iconFor(name),
            }))
            .sort((a, b) => b.leads - a.leads);
    }, [leads]);

    return (
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-6">
                <h2 className="text-lg font-bold text-slate-800">
                    Lead Sources
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                    Where your leads are coming from
                </p>
            </div>

            <div className="space-y-5">
                {sourceStats.length === 0 ? (
                    <div className="py-8 text-center text-sm text-slate-500">
                        No source data yet.
                    </div>
                ) : (
                    sourceStats.map((source) => (
                        <div key={source.name}>
                            <div className="mb-2 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="text-blue-600">
                                        {source.icon}
                                    </span>
                                    <span className="text-sm font-medium text-slate-700">
                                        {source.name}
                                    </span>
                                </div>
                                <div className="text-right">
                                    <span className="text-sm font-bold text-slate-700">
                                        {source.percentage}%
                                    </span>
                                    <span className="ml-2 text-xs text-slate-400">
                                        {source.leads} leads
                                    </span>
                                </div>
                            </div>

                            {/* Progress Bar */}
                            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                                <div
                                    className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-purple-600 transition-all duration-500"
                                    style={{ width: `${source.percentage}%` }}
                                />
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default LeadSources;