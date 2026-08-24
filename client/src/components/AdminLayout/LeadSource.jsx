import { Globe,  Users, MoreHorizontal } from "lucide-react";

const LeadSources = () => {
    const sources = [
        {
            name: "Website",
            percentage: 45,
            leads: 460,
            icon: <Globe size={18} />,
        },
        {
            name: "Referrals",
            percentage: 15,
            leads: 154,
            icon: <Users size={18} />,
        },
        {
            name: "Other Sources",
            percentage: 10,
            leads: 103,
            icon: <MoreHorizontal size={18} />,
        },
    ];

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
                {sources.map((source) => (
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
                                style={{
                                    width: `${source.percentage}%`,
                                }}
                            />
                        </div>

                    </div>
                ))}
            </div>
        </div>
    );
};

export default LeadSources;