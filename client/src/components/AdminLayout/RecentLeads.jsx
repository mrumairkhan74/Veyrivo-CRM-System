import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const RecentLeads = () => {
    const leads = [
        {
            name: "John Smith",
            company: "ABC Technologies",
            service: "Web Development",
            status: "New",
            score: 92,
        },
        {
            name: "Sarah Ali",
            company: "Digital Solutions",
            service: "CRM Development",
            status: "Qualified",
            score: 85,
        },
        {
            name: "Michael Brown",
            company: "Tech Innovations",
            service: "AI Automation",
            status: "Contacted",
            score: 72,
        },
        {
            name: "David Wilson",
            company: "Creative Agency",
            service: "Website Redesign",
            status: "New",
            score: 68,
        },
    ];

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
                {leads.map((lead) => (
                    <div
                        key={lead.name}
                        className="flex items-center justify-between rounded-xl border border-slate-100 p-3 transition hover:bg-slate-50"
                    >
                        <div className="min-w-0">
                            <h3 className="truncate text-sm font-semibold text-slate-800">
                                {lead.name}
                            </h3>

                            <p className="truncate text-xs text-slate-500">
                                {lead.company} • {lead.service}
                            </p>
                        </div>

                        <div className="ml-3 flex flex-col items-end gap-1">
                            <span className="rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-600">
                                {lead.status}
                            </span>

                            <span className="text-xs font-semibold text-emerald-600">
                                Score: {lead.score}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default RecentLeads;