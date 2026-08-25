import { useState } from "react";
import { X } from "lucide-react";

const CreateLead = ({ setIsOpen }) => {
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        status: "new",
        temperature: "unknown",
        score: 0,

        company_id: "",
        contact_id: "",
        source_id: "",
        service_id: "",
        industry_id: "",

        estimated_value: "",
        currency: "USD",
        timeline: "exploring",
        budget_range: "unknown",

        owner_id: "",
        next_follow_up_at: "",
    });

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        console.log("Lead Data:", formData);

        // API integration will come later
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">

            {/* Modal */}
            <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-xl bg-white shadow-xl">

                {/* Modal Header */}
                <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">
                            Create New Lead
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            Add a new potential client to your CRM.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => setIsOpen(false)}
                        className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
                    >
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-5">

                    {/* Lead Details */}
                    <div className="mb-8">
                        <h3 className="text-base font-bold text-slate-800">
                            Lead Details
                        </h3>

                        <p className="mt-1 text-sm text-slate-500">
                            Basic information about this opportunity.
                        </p>

                        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">

                            {/* Lead Title */}
                            <div className="md:col-span-2">
                                <label className="mb-2 block text-sm font-medium text-slate-700">
                                    Lead Title <span className="text-red-500">*</span>
                                </label>

                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    placeholder="e.g. Website Redesign for ABC Company"
                                    required
                                    className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                />
                            </div>

                            {/* Status */}
                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-700">
                                    Status
                                </label>

                                <select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleChange}
                                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                >
                                    <option value="new">New</option>
                                    <option value="contacted">Contacted</option>
                                    <option value="qualified">Qualified</option>
                                    <option value="nurture">Nurture</option>
                                    <option value="lost">Lost</option>
                                </select>
                            </div>

                            {/* Temperature */}
                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-700">
                                    Temperature
                                </label>

                                <select
                                    name="temperature"
                                    value={formData.temperature}
                                    onChange={handleChange}
                                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                >
                                    <option value="hot">Hot</option>
                                    <option value="warm">Warm</option>
                                    <option value="cold">Cold</option>
                                    <option value="unknown">Unknown</option>
                                </select>
                            </div>

                            {/* Description */}
                            <div className="md:col-span-2">
                                <label className="mb-2 block text-sm font-medium text-slate-700">
                                    Description
                                </label>

                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows="4"
                                    placeholder="Add details about this lead..."
                                    className="w-full resize-none rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                />
                            </div>

                        </div>
                    </div>

                    {/* Relationships */}
                    <div className="mb-8 border-t border-slate-200 pt-6">
                        <h3 className="text-base font-bold text-slate-800">
                            Relationships
                        </h3>

                        <p className="mt-1 text-sm text-slate-500">
                            We will add Company, Contact, Source, Service, Industry, and Owner here next.
                        </p>
                    </div>

                    {/* Modal Footer */}
                    <div className="sticky bottom-0 flex justify-end gap-3 border-t border-slate-200 bg-white pt-5">
                        <button
                            type="button"
                            onClick={() => setIsOpen(false)}
                            className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
                        >
                            Create Lead
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
};

export default CreateLead;