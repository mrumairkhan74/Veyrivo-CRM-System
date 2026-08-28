import { AlertTriangle, X } from "lucide-react";

const DeleteLead = ({ lead, setIsOpen, onConfirm }) => {
    if (!lead) return null;

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">

            <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">

                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">

                    <h2 className="text-lg font-bold text-slate-800">
                        Delete Lead
                    </h2>

                    <button
                        onClick={() => setIsOpen(false)}
                        className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                    >
                        <X size={20} />
                    </button>

                </div>

                {/* Content */}
                <div className="p-5">

                    <div className="flex gap-4">

                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600">
                            <AlertTriangle size={22} />
                        </div>

                        <div>
                            <h3 className="font-semibold text-slate-800">
                                Are you sure?
                            </h3>

                            <p className="mt-1 text-sm leading-6 text-slate-500">
                                You are about to delete{" "}
                                <span className="font-semibold text-slate-700">
                                    {lead.title}
                                </span>
                                . This action cannot be undone.
                            </p>
                        </div>

                    </div>

                </div>

                {/* Footer */}
                <div className="flex justify-end gap-3 border-t border-slate-200 bg-slate-50 px-5 py-4">

                    <button
                        onClick={() => setIsOpen(false)}
                        className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
                    >
                        Cancel
                    </button>

                    <button
                        onClick={() => onConfirm(lead)}
                        className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-red-700"
                    >
                        Delete Lead
                    </button>

                </div>

            </div>
        </div>
    );
};

export default DeleteLead;