import {
    MoreHorizontal,
    Eye,
    Pencil,
    Trash,
} from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";

const LeadTable = ({ leads, onView, onEdit, onDelete }) => {
    const [openMenu, setOpenMenu] = useState(null); // { leadId, top, left }
    const menuRef = useRef(null);

    // Close on outside click or scroll
    useEffect(() => {
        if (!openMenu) return;

        const close = () => setOpenMenu(null);

        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                close();
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        // Any scroll anywhere (window OR the table's overflow container) closes it
        window.addEventListener("scroll", close, true);
        window.addEventListener("resize", close);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            window.removeEventListener("scroll", close, true);
            window.removeEventListener("resize", close);
        };
    }, [openMenu]);

    const openMenuFor = useCallback((e, lead) => {
        const btn = e.currentTarget;
        const rect = btn.getBoundingClientRect();

        // If already open for this lead, close it
        setOpenMenu((prev) =>
            prev?.leadId === lead.id
                ? null
                : {
                      leadId: lead.id,
                      top: rect.bottom + 6,
                      left: rect.right,
                      lead,
                  }
        );
    }, []);

    const handleAction = (action, lead) => {
        if (action === "view") onView(lead);
        if (action === "edit") onEdit(lead);
        if (action === "delete") onDelete(lead);
        setOpenMenu(null);
    };

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
        <>
            <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
                <table className="w-full min-w-[1000px] text-left">
                    <thead className="border-b border-slate-200 bg-slate-50">
                        <tr>
                            {[
                                "Lead",
                                "Company",
                                "Service",
                                "Status",
                                "Temperature",
                                "Score",
                                "Value",
                                "Actions",
                            ].map((h) => (
                                <th
                                    key={h}
                                    className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500"
                                >
                                    {h}
                                </th>
                            ))}
                        </tr>
                    </thead>

                    <tbody>
                        {leads.length > 0 ? (
                            leads.map((lead) => (
                                <tr
                                    key={lead.id}
                                    className="border-b border-slate-100 transition hover:bg-slate-50"
                                >
                                    <td className="px-5 py-4">
                                        <p className="font-semibold text-slate-700">
                                            {lead.title}
                                        </p>
                                        <p className="mt-1 text-sm text-slate-500">
                                            {lead.contact}
                                        </p>
                                    </td>

                                    <td className="px-5 py-4 text-sm text-slate-600">
                                        {lead.company}
                                    </td>

                                    <td className="px-5 py-4 text-sm text-slate-600">
                                        {lead.service}
                                    </td>

                                    <td className="px-5 py-4">
                                        <span
                                            className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${getStatusStyle(
                                                lead.status
                                            )}`}
                                        >
                                            {lead.status}
                                        </span>
                                    </td>

                                    <td className="px-5 py-4">
                                        <span
                                            className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${getTemperatureStyle(
                                                lead.temperature
                                            )}`}
                                        >
                                            {lead.temperature}
                                        </span>
                                    </td>

                                    <td className="px-5 py-4">
                                        <span className="font-semibold text-slate-700">
                                            {lead.score}
                                        </span>
                                        <span className="text-xs text-slate-400">
                                            /100
                                        </span>
                                    </td>

                                    <td className="px-5 py-4 text-sm font-medium text-slate-700">
                                        {lead.currency}{" "}
                                        {Number(lead.estimated_value).toLocaleString()}
                                    </td>

                                    <td className="px-5 py-4">
                                        <button
                                            onClick={(e) => openMenuFor(e, lead)}
                                            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
                                            aria-label={`Actions for ${lead.title}`}
                                            aria-haspopup="menu"
                                            aria-expanded={openMenu?.leadId === lead.id}
                                        >
                                            <MoreHorizontal size={20} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="8" className="px-5 py-12 text-center">
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

            {/* Portal-rendered dropdown — lives outside the table so nothing clips it */}
            {openMenu &&
                createPortal(
                    <div
                        ref={menuRef}
                        role="menu"
                        style={{
                            position: "fixed",
                            top: openMenu.top,
                            // Anchor to the right edge of the button
                            left: openMenu.left,
                            transform: "translateX(-100%)",
                            zIndex: 9999,
                        }}
                        className="w-40 rounded-lg border border-slate-200 bg-white py-1 shadow-lg"
                    >
                        <button
                            onClick={() => handleAction("view", openMenu.lead)}
                            className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-slate-700 transition hover:bg-slate-50"
                        >
                            <Eye size={15} />
                            View
                        </button>

                        <button
                            onClick={() => handleAction("edit", openMenu.lead)}
                            className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-slate-700 transition hover:bg-slate-50"
                        >
                            <Pencil size={15} />
                            Edit
                        </button>

                        <button
                            onClick={() => handleAction("delete", openMenu.lead)}
                            className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-red-600 transition hover:bg-red-50"
                        >
                            <Trash size={15} />
                            Delete
                        </button>
                    </div>,
                    document.body
                )}
        </>
    );
};

export default LeadTable;