import { useState } from "react";
import { X } from "lucide-react";

const CreateLead = ({ setIsOpen, onCreate }) => {
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

        const newLead = {
            id: crypto.randomUUID(),
            ...formData,

            // Dummy display fields for LeadTable
            company: formData.company_id || "Not Assigned",
            contact: formData.contact_id || "Not Assigned",
            source: formData.source_id || "Website",
            service: formData.service_id || "Not Assigned",

            estimated_value: Number(formData.estimated_value) || 0,
            score: Number(formData.score) || 0,

            created_at: new Date().toISOString(),
        };

        onCreate(newLead);

        setIsOpen(false);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">

            <div className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">

                {/* Header */}
                <div className="flex shrink-0 items-center justify-between border-b border-slate-200 bg-white px-5 py-4">

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

                {/* Form */}
                <form
                    onSubmit={handleSubmit}
                    className="overflow-y-auto p-5 md:p-6"
                >

                    {/* ================= LEAD DETAILS ================= */}
                    <div className="mb-8">

                        <h3 className="text-base font-bold text-slate-800">
                            Lead Details
                        </h3>

                        <p className="mt-1 text-sm text-slate-500">
                            Basic information about this opportunity.
                        </p>

                        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">

                            {/* Title */}
                            <div className="md:col-span-2">
                                <label className="mb-2 block text-sm font-medium text-slate-700">
                                    Lead Title{" "}
                                    <span className="text-red-500">*</span>
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
                            <Select
                                label="Status"
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                options={[
                                    ["new", "New"],
                                    ["contacted", "Contacted"],
                                    ["qualified", "Qualified"],
                                    ["nurture", "Nurture"],
                                    ["lost", "Lost"],
                                ]}
                            />

                            {/* Temperature */}
                            <Select
                                label="Temperature"
                                name="temperature"
                                value={formData.temperature}
                                onChange={handleChange}
                                options={[
                                    ["hot", "Hot"],
                                    ["warm", "Warm"],
                                    ["cold", "Cold"],
                                    ["unknown", "Unknown"],
                                ]}
                            />

                            {/* Score */}
                            <Input
                                label="Lead Score"
                                name="score"
                                type="number"
                                min="0"
                                max="100"
                                value={formData.score}
                                onChange={handleChange}
                            />

                            {/* Estimated Value */}
                            <Input
                                label="Estimated Value"
                                name="estimated_value"
                                type="number"
                                min="0"
                                value={formData.estimated_value}
                                onChange={handleChange}
                                placeholder="e.g. 5000"
                            />

                            {/* Currency */}
                            <Select
                                label="Currency"
                                name="currency"
                                value={formData.currency}
                                onChange={handleChange}
                                options={[
                                    ["USD", "USD"],
                                    ["EUR", "EUR"],
                                    ["GBP", "GBP"],
                                    ["PKR", "PKR"],
                                ]}
                            />

                            {/* Timeline */}
                            <Select
                                label="Timeline"
                                name="timeline"
                                value={formData.timeline}
                                onChange={handleChange}
                                options={[
                                    ["urgent", "Urgent"],
                                    ["one_month", "One Month"],
                                    ["three_months", "Three Months"],
                                    ["exploring", "Exploring"],
                                ]}
                            />

                            {/* Budget */}
                            <Select
                                label="Budget Range"
                                name="budget_range"
                                value={formData.budget_range}
                                onChange={handleChange}
                                options={[
                                    ["low", "Low"],
                                    ["medium", "Medium"],
                                    ["high", "High"],
                                    ["unknown", "Unknown"],
                                ]}
                            />

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

                    {/* ================= RELATIONSHIPS ================= */}
                    <div className="mb-8 border-t border-slate-200 pt-6">

                        <h3 className="text-base font-bold text-slate-800">
                            Relationships
                        </h3>

                        <p className="mt-1 text-sm text-slate-500">
                            Connect this lead with your CRM records.
                        </p>

                        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">

                            <Input
                                label="Company"
                                name="company_id"
                                value={formData.company_id}
                                onChange={handleChange}
                                placeholder="Company name"
                            />

                            <Input
                                label="Contact"
                                name="contact_id"
                                value={formData.contact_id}
                                onChange={handleChange}
                                placeholder="Contact name"
                            />

                            <Input
                                label="Source"
                                name="source_id"
                                value={formData.source_id}
                                onChange={handleChange}
                                placeholder="e.g. LinkedIn"
                            />

                            <Input
                                label="Service"
                                name="service_id"
                                value={formData.service_id}
                                onChange={handleChange}
                                placeholder="e.g. Website Development"
                            />

                            <Input
                                label="Industry"
                                name="industry_id"
                                value={formData.industry_id}
                                onChange={handleChange}
                                placeholder="e.g. Healthcare"
                            />

                            <Input
                                label="Owner"
                                name="owner_id"
                                value={formData.owner_id}
                                onChange={handleChange}
                                placeholder="Lead owner"
                            />

                        </div>
                    </div>

                    {/* ================= FOLLOW UP ================= */}
                    <div className="mb-8 border-t border-slate-200 pt-6">

                        <h3 className="text-base font-bold text-slate-800">
                            Follow Up
                        </h3>

                        <p className="mt-1 text-sm text-slate-500">
                            Schedule the next action for this lead.
                        </p>

                        <div className="mt-5">
                            <Input
                                label="Next Follow Up"
                                name="next_follow_up_at"
                                type="datetime-local"
                                value={formData.next_follow_up_at}
                                onChange={handleChange}
                            />
                        </div>

                    </div>

                    {/* ================= FOOTER ================= */}
                    <div className="flex justify-end gap-3 border-t border-slate-200 bg-white pt-5">

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


/* ================= INPUT ================= */

const Input = ({
    label,
    name,
    type = "text",
    value,
    onChange,
    ...props
}) => {
    return (
        <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
                {label}
            </label>

            <input
                type={type}
                name={name}
                value={value ?? ""}
                onChange={onChange}
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                {...props}
            />
        </div>
    );
};


/* ================= SELECT ================= */

const Select = ({
    label,
    name,
    value,
    onChange,
    options,
}) => {
    return (
        <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
                {label}
            </label>

            <select
                name={name}
                value={value}
                onChange={onChange}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
                {options.map(([value, label]) => (
                    <option key={value} value={value}>
                        {label}
                    </option>
                ))}
            </select>
        </div>
    );
};

export default CreateLead;