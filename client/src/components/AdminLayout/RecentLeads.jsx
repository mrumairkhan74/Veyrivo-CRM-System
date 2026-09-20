import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const RecentLeads = ({ leads = [] }) => {
    return (
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            {/* Header */}
            <div className="mb-5 flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-bold text-slate-800">
                        Recent Leads
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                        Your latest lead activity
                    </p>
                </div>

                <Link
                    to="/admin/leads"
                    className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700"
                >
                    View All
                    <ArrowRight size={16} />
                </Link>
            </div>

            {/* Leads */}
            <div className="space-y-3">
                {leads.length === 0 ? (
                    <div className="py-8 text-center text-slate-500">
                        No leads found.{" "}
                        <button className="ml-1 text-cyan-600 hover:underline">
                            Create your first lead
                        </button>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {leads.map((lead) => (
                            <div
                                key={lead.id}
                                className="flex items-center justify-between rounded-xl border border-slate-100 p-3 transition hover:bg-slate-50"
                            >
                                <div className="min-w-0">
                                    <h3 className="truncate text-sm font-semibold text-slate-800">
                                        {lead.title}
                                    </h3>
                                    <p className="truncate text-xs text-slate-500">
                                        {lead.company} • {lead.service}
                                    </p>
                                </div>

                                <div className="ml-3 flex flex-col items-end gap-1">
                                    <span
                                        className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(
                                            lead.status
                                        )}`}
                                    >
                                        {lead.status}
                                    </span>

                                    {lead.estimated_value && (
                                        <span className="text-xs font-semibold text-emerald-600">
                                            {formatCurrency(lead.estimated_value)}
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

// Status badge colors
const getStatusColor = (status) => {
    const colors = {
        new: "bg-blue-100 text-blue-700",
        contacted: "bg-purple-100 text-purple-700",
        qualified: "bg-emerald-100 text-emerald-700",
        nurture: "bg-amber-100 text-amber-700",
        lost: "bg-red-100 text-red-700",
    };
    return colors[status] || "bg-slate-100 text-slate-700";
};

// Local currency formatter — no external util needed
const formatCurrency = (value = 0) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
    return `$${value.toFixed(0)}`;
};

export default RecentLeads;