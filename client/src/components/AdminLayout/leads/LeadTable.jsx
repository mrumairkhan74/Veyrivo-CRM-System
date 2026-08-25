import { MoreHorizontal, Eye, Pencil, Trash } from "lucide-react";
import { useState, useRef, useEffect } from "react";

const LeadTable = ({ leads }) => {
    const [openMenuId, setOpenMenuId] = useState(null);
    const menuRef = useRef(null);

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

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setOpenMenuId(null);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleAction = (action, lead) => {
        console.log(`${action} lead:`, lead);
        // Add your action logic here
        setOpenMenuId(null);
    };

    return (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full min-w-[1000px] text-left">
                <thead className="border-b border-slate-200 bg-slate-50">
                    <tr>
                        <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">Lead</th>
                        <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">Company</th>
                        <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">Service</th>
                        <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">Status</th>
                        <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">Temperature</th>
                        <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">Score</th>
                        <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">Value</th>
                        <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {leads.map((lead) => (
                        <tr key={lead.id} className="border-b border-slate-100 transition hover:bg-slate-50">
                            {/* Lead */}
                            <td className="px-5 py-4">
                                <div>
                                    <p className="font-semibold text-slate-700">{lead.title}</p>
                                    <p className="mt-1 text-sm text-slate-500">{lead.contact}</p>
                                </div>
                            </td>

                            {/* Company */}
                            <td className="px-5 py-4 text-sm text-slate-600">{lead.company}</td>

                            {/* Service */}
                            <td className="px-5 py-4 text-sm text-slate-600">{lead.service}</td>

                            {/* Status */}
                            <td className="px-5 py-4">
                                <span className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${getStatusStyle(lead.status)}`}>
                                    {lead.status}
                                </span>
                            </td>

                            {/* Temperature */}
                            <td className="px-5 py-4">
                                <span className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${getTemperatureStyle(lead.temperature)}`}>
                                    {lead.temperature}
                                </span>
                            </td>

                            {/* Score */}
                            <td className="px-5 py-4">
                                <span className="font-semibold text-slate-700">{lead.score}</span>
                                <span className="text-xs text-slate-400">/100</span>
                            </td>

                            {/* Value */}
                            <td className="px-5 py-4 text-sm font-medium text-slate-700">
                                {lead.currency} {Number(lead.estimated_value).toLocaleString()}
                            </td>

                            {/* Actions */}
                            <td className="px-5 py-4 relative">
                                <button
                                    onClick={() => setOpenMenuId(openMenuId === lead.id ? null : lead.id)}
                                    className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
                                    aria-label={`Actions for ${lead.title}`}
                                >
                                    <MoreHorizontal size={20} />
                                </button>

                                {/* Dropdown Menu */}
                                {openMenuId === lead.id && (
                                    <div
                                        ref={menuRef}
                                        className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-10"
                                    >
                                        <button
                                            onClick={() => handleAction('view', lead)}
                                            className="flex justify-start items-center gap-2 w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition"
                                        >
                                            <Eye size={12} /> View
                                        </button>
                                        <button
                                            onClick={() => handleAction('edit', lead)}
                                            className="flex justify-start items-center gap-2 w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition"
                                        >
                                            <Pencil size={12} /> Edit
                                        </button>
                                        <button
                                            onClick={() => handleAction('delete', lead)}
                                            className="flex justify-start items-center gap-2 w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition"
                                        >
                                            <Trash size={12} /> Delete
                                        </button>
                                    </div>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default LeadTable;