import {
    X,
    Building2,
    User,
    Mail,
    BriefcaseBusiness,
    CircleDollarSign,
    CalendarDays,
    Clock3,
    Target,
    Globe,
    UserRound,
    FileText,
    Sparkles,
} from "lucide-react";

const LeadDetails = ({ lead, setIsOpen }) => {
    if (!lead) return null;

    const getStatusStyle = (status) => {
        const styles = {
            new: "bg-blue-50 text-blue-600",
            contacted: "bg-yellow-50 text-yellow-600",
            qualified: "bg-green-50 text-green-600",
            nurture: "bg-purple-50 text-purple-600",
            lost: "bg-red-50 text-red-600",
        };

        return styles[status] || "bg-slate-100 text-slate-600";
    };

    const getTemperatureStyle = (temperature) => {
        const styles = {
            hot: "bg-red-50 text-red-600",
            warm: "bg-orange-50 text-orange-600",
            cold: "bg-cyan-50 text-cyan-600",
            unknown: "bg-slate-100 text-slate-600",
        };

        return styles[temperature] || "bg-slate-100 text-slate-600";
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">

            {/* Modal */}
            <div className="relative flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">

                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 md:px-6">

                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
                            Lead Details
                        </p>

                        <h2 className="mt-1 text-xl font-bold text-slate-800 md:text-2xl">
                            {lead.title}
                        </h2>
                    </div>

                    <button
                        onClick={() => setIsOpen(false)}
                        className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                    >
                        <X size={22} />
                    </button>

                </div>

                {/* Content */}
                <div className="overflow-y-auto p-5 md:p-6">

                    {/* Status / Score */}
                    <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">

                        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                            <p className="text-xs font-medium uppercase text-slate-400">
                                Status
                            </p>

                            <span
                                className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize ${getStatusStyle(
                                    lead.status
                                )}`}
                            >
                                {lead.status}
                            </span>
                        </div>

                        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                            <p className="text-xs font-medium uppercase text-slate-400">
                                Temperature
                            </p>

                            <span
                                className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize ${getTemperatureStyle(
                                    lead.temperature
                                )}`}
                            >
                                {lead.temperature}
                            </span>
                        </div>

                        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                            <p className="text-xs font-medium uppercase text-slate-400">
                                Lead Score
                            </p>

                            <p className="mt-1 text-2xl font-bold text-slate-800">
                                {lead.score}
                                <span className="text-sm font-medium text-slate-400">
                                    /100
                                </span>
                            </p>
                        </div>

                    </div>

                    {/* Main Information */}
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

                        {/* Contact Information */}
                        <div className="rounded-xl border border-slate-200 p-5">

                            <div className="mb-5 flex items-center gap-2">
                                <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
                                    <User size={18} />
                                </div>

                                <h3 className="font-bold text-slate-800">
                                    Contact Information
                                </h3>
                            </div>

                            <div className="space-y-4">

                                <DetailItem
                                    icon={<User size={16} />}
                                    label="Contact"
                                    value={lead.contact}
                                />

                                <DetailItem
                                    icon={<Mail size={16} />}
                                    label="Email"
                                    value={lead.email}
                                />

                                <DetailItem
                                    icon={<Building2 size={16} />}
                                    label="Company"
                                    value={lead.company}
                                />

                            </div>

                        </div>

                        {/* Lead Information */}
                        <div className="rounded-xl border border-slate-200 p-5">

                            <div className="mb-5 flex items-center gap-2">
                                <div className="rounded-lg bg-purple-50 p-2 text-purple-600">
                                    <BriefcaseBusiness size={18} />
                                </div>

                                <h3 className="font-bold text-slate-800">
                                    Lead Information
                                </h3>
                            </div>

                            <div className="space-y-4">

                                <DetailItem
                                    icon={<BriefcaseBusiness size={16} />}
                                    label="Service"
                                    value={lead.service}
                                />

                                <DetailItem
                                    icon={<Globe size={16} />}
                                    label="Source"
                                    value={lead.source}
                                />

                                <DetailItem
                                    icon={<Target size={16} />}
                                    label="Industry"
                                    value={lead.industry || "Not specified"}
                                />

                            </div>

                        </div>

                    </div>

                    {/* Opportunity */}
                    <div className="mt-6 rounded-xl border border-slate-200 p-5">

                        <div className="mb-5 flex items-center gap-2">
                            <div className="rounded-lg bg-cyan-50 p-2 text-cyan-600">
                                <CircleDollarSign size={18} />
                            </div>

                            <h3 className="font-bold text-slate-800">
                                Opportunity
                            </h3>
                        </div>

                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">

                            <InfoBox
                                icon={<CircleDollarSign size={16} />}
                                label="Estimated Value"
                                value={
                                    lead.estimated_value
                                        ? `${lead.currency} ${Number(
                                              lead.estimated_value
                                          ).toLocaleString()}`
                                        : "Not specified"
                                }
                            />

                            <InfoBox
                                icon={<Clock3 size={16} />}
                                label="Timeline"
                                value={lead.timeline || "Not specified"}
                            />

                            <InfoBox
                                icon={<Target size={16} />}
                                label="Budget"
                                value={lead.budget_range || "Unknown"}
                            />

                            <InfoBox
                                icon={<UserRound size={16} />}
                                label="Owner"
                                value={lead.owner || "Unassigned"}
                            />

                        </div>

                    </div>

                    {/* Description */}
                    <div className="mt-6 rounded-xl border border-slate-200 p-5">

                        <div className="mb-4 flex items-center gap-2">
                            <FileText size={18} className="text-slate-500" />

                            <h3 className="font-bold text-slate-800">
                                Description
                            </h3>
                        </div>

                        <p className="text-sm leading-6 text-slate-500">
                            {lead.description || "No description available."}
                        </p>

                    </div>

                    {/* AI Summary */}
                    <div className="mt-6 rounded-xl border border-purple-100 bg-gradient-to-r from-purple-50 to-cyan-50 p-5">

                        <div className="mb-4 flex items-center gap-2">
                            <Sparkles
                                size={18}
                                className="text-purple-600"
                            />

                            <h3 className="font-bold text-slate-800">
                                AI Summary
                            </h3>
                        </div>

                        <p className="text-sm leading-6 text-slate-600">
                            {lead.ai_summary ||
                                "AI summary will be available after lead qualification."}
                        </p>

                    </div>

                    {/* Dates */}
                    <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">

                        <DetailItem
                            icon={<CalendarDays size={16} />}
                            label="Next Follow Up"
                            value={
                                lead.next_follow_up_at ||
                                "Not scheduled"
                            }
                        />

                        <DetailItem
                            icon={<CalendarDays size={16} />}
                            label="Last Contacted"
                            value={
                                lead.last_contacted_at ||
                                "Not contacted"
                            }
                        />

                    </div>

                </div>

                {/* Footer */}
                <div className="flex justify-end border-t border-slate-200 bg-slate-50 px-5 py-4">

                    <button
                        onClick={() => setIsOpen(false)}
                        className="rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
                    >
                        Close
                    </button>

                </div>

            </div>
        </div>
    );
};

const DetailItem = ({ icon, label, value }) => {
    return (
        <div className="flex items-start gap-3">

            <div className="mt-0.5 text-slate-400">
                {icon}
            </div>

            <div className="min-w-0">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    {label}
                </p>

                <p className="mt-1 break-words text-sm font-medium text-slate-700">
                    {value}
                </p>
            </div>

        </div>
    );
};

const InfoBox = ({ icon, label, value }) => {
    return (
        <div className="rounded-lg bg-slate-50 p-4">
            <div className="flex items-center gap-2 text-slate-400">
                {icon}

                <span className="text-xs font-medium">
                    {label}
                </span>
            </div>

            <p className="mt-2 text-sm font-semibold capitalize text-slate-700">
                {value}
            </p>
        </div>
    );
};

export default LeadDetails;