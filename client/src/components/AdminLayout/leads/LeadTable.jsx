import {
    MoreHorizontal,
    Eye,
    Pencil,
    Trash,
} from "lucide-react";
import { useState, useEffect } from "react";

const LeadTable = ({ leads, onView, onEdit, onDelete }) => {
    const [openMenuId, setOpenMenuId] = useState(null);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (!event.target.closest("[data-lead-menu]")) {
                setOpenMenuId(null);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener(
                "mousedown",
                handleClickOutside
            );
        };
    }, []);

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

    const handleAction = (action, lead) => {
        if (action === "view") {
            onView(lead);
        }

        if (action === "edit") {
            onEdit(lead);
        }

        if (action === "delete") {
            onDelete(lead);
        }

        setOpenMenuId(null);
    };

    return (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">

            <table className="w-full min-w-[1000px] text-left">

                <thead className="border-b border-slate-200 bg-slate-50">
                    <tr>
                        <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Lead
                        </th>

                        <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Company
                        </th>

                        <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Service
                        </th>

                        <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Status
                        </th>

                        <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Temperature
                        </th>

                        <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Score
                        </th>

                        <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Value
                        </th>

                        <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Actions
                        </th>
                    </tr>
                </thead>

                <tbody>

                    {leads.length > 0 ? (
                        leads.map((lead) => (

                            <tr
                                key={lead.id}
                                className="border-b border-slate-100 transition hover:bg-slate-50"
                            >

                                {/* Lead */}
                                <td className="px-5 py-4">
                                    <div>
                                        <p className="font-semibold text-slate-700">
                                            {lead.title}
                                        </p>

                                        <p className="mt-1 text-sm text-slate-500">
                                            {lead.contact}
                                        </p>
                                    </div>
                                </td>

                                {/* Company */}
                                <td className="px-5 py-4 text-sm text-slate-600">
                                    {lead.company}
                                </td>

                                {/* Service */}
                                <td className="px-5 py-4 text-sm text-slate-600">
                                    {lead.service}
                                </td>

                                {/* Status */}
                                <td className="px-5 py-4">
                                    <span
                                        className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${getStatusStyle(
                                            lead.status
                                        )}`}
                                    >
                                        {lead.status}
                                    </span>
                                </td>

                                {/* Temperature */}
                                <td className="px-5 py-4">
                                    <span
                                        className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${getTemperatureStyle(
                                            lead.temperature
                                        )}`}
                                    >
                                        {lead.temperature}
                                    </span>
                                </td>

                                {/* Score */}
                                <td className="px-5 py-4">
                                    <span className="font-semibold text-slate-700">
                                        {lead.score}
                                    </span>

                                    <span className="text-xs text-slate-400">
                                        /100
                                    </span>
                                </td>

                                {/* Value */}
                                <td className="px-5 py-4 text-sm font-medium text-slate-700">
                                    {lead.currency}{" "}
                                    {Number(
                                        lead.estimated_value
                                    ).toLocaleString()}
                                </td>

                                {/* Actions */}
                                <td className="relative px-5 py-4">

                                    <div
                                        data-lead-menu
                                        className="relative"
                                    >

                                        <button
                                            onClick={() =>
                                                setOpenMenuId(
                                                    openMenuId === lead.id
                                                        ? null
                                                        : lead.id
                                                )
                                            }
                                            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
                                            aria-label={`Actions for ${lead.title}`}
                                        >
                                            <MoreHorizontal size={20} />
                                        </button>

                                        {/* Dropdown */}
                                        {openMenuId === lead.id && (
                                            <div className="absolute right-0 top-full z-50 mt-2 w-40 rounded-lg border border-slate-200 bg-white py-1 shadow-lg">

                                                <button
                                                    onClick={() =>
                                                        handleAction(
                                                            "view",
                                                            lead
                                                        )
                                                    }
                                                    className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-slate-700 transition hover:bg-slate-50"
                                                >
                                                    <Eye size={15} />
                                                    View
                                                </button>

                                                <button
                                                    onClick={() =>
                                                        handleAction(
                                                            "edit",
                                                            lead
                                                        )
                                                    }
                                                    className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-slate-700 transition hover:bg-slate-50"
                                                >
                                                    <Pencil size={15} />
                                                    Edit
                                                </button>

                                                <button
                                                    onClick={() =>
                                                        handleAction(
                                                            "delete",
                                                            lead
                                                        )
                                                    }
                                                    className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-red-600 transition hover:bg-red-50"
                                                >
                                                    <Trash size={15} />
                                                    Delete
                                                </button>

                                            </div>
                                        )}

                                    </div>

                                </td>

                            </tr>

                        ))
                    ) : (
                        <tr>
                            <td
                                colSpan="8"
                                className="px-5 py-12 text-center"
                            >
                                <p className="font-medium text-slate-600">
                                    No leads found
                                </p>

                                <p className="mt-1 text-sm text-slate-400">
                                    Try changing your search or filters.
                                </p>
                            </td>
                        </tr>
                    )}

                </tbody>

            </table>

        </div>
    );
};

export default LeadTable;