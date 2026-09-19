import { useState } from "react";
import { X } from "lucide-react";

const emptyLead = {
    title: "",
    description: "",
    status: "new",
    temperature: "unknown",
    score: 0,
    source_id: "",
    service_id: "",
    industry_id: "",
    estimated_value: "",
    currency: "USD",
    timeline: "exploring",
    budget_range: "unknown",
    owner_id: "",
    next_follow_up_at: "",
};

const statusOptions = [
    ["new", "New"],
    ["contacted", "Contacted"],
    ["qualified", "Qualified"],
    ["nurture", "Nurture"],
    ["lost", "Lost"],
];

const temperatureOptions = [
    ["hot", "Hot"],
    ["warm", "Warm"],
    ["cold", "Cold"],
    ["unknown", "Unknown"],
];

const timelineOptions = [
    ["urgent", "Urgent"],
    ["one_month", "One Month"],
    ["three_months", "Three Months"],
    ["exploring", "Exploring"],
];

const budgetOptions = [
    ["low", "Low"],
    ["medium", "Medium"],
    ["high", "High"],
    ["unknown", "Unknown"],
];

const currencyOptions = [
    ["USD", "USD"],
    ["EUR", "EUR"],
    ["GBP", "GBP"],
    ["PKR", "PKR"],
];

const LeadForm = ({
    mode = "create",
    lead = null,
    onCancel,
    onSave,                  // ← was onSubmit; Leads.jsx passes onSave
    loading = false,
    industries = [],
    sources = [],
    services = [],
    owners = [],
}) => {
    const isEditMode = mode === "edit";

    const [formData, setFormData] = useState(() => ({
        ...emptyLead,
        ...(lead || {}),
    }));

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Build a DB-shaped payload. Strip empty strings, coerce types.
        const payload = {
            title: formData.title?.trim(),
            description: formData.description?.trim() || null,
            status: formData.status,
            temperature: formData.temperature,
            score: formData.score === "" ? 0 : Number(formData.score),
            source_id: formData.source_id || null,
            service_id: formData.service_id || null,
            industry_id: formData.industry_id || null,
            estimated_value:
                formData.estimated_value === "" ? 0 : Number(formData.estimated_value),
            currency: formData.currency,
            timeline: formData.timeline,
            budget_range: formData.budget_range,
            owner_id: formData.owner_id || null,
            next_follow_up_at: formData.next_follow_up_at
                ? new Date(formData.next_follow_up_at).toISOString()
                : null,
        };

        onSave?.(payload);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
            <div className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">

                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
                            {isEditMode ? "Edit Lead" : "Create Lead"}
                        </p>
                        <h2 className="mt-1 text-xl font-bold text-slate-800">
                            {isEditMode ? "Update Lead Information" : "Add New Lead"}
                        </h2>
                    </div>
                    <button
                        type="button"
                        onClick={onCancel}
                        className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                    >
                        <X size={22} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="overflow-y-auto p-5 md:p-6">

                    {/* Basic Information */}
                    <div className="mb-6">
                        <h3 className="mb-4 text-lg font-bold text-slate-800">
                            Basic Information
                        </h3>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <Input
                                label="Lead Title"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                required
                            />
                            <Input
                                label="Estimated Value"
                                type="number"
                                name="estimated_value"
                                value={formData.estimated_value}
                                onChange={handleChange}
                            />
                            <Select
                                label="Currency"
                                name="currency"
                                value={formData.currency}
                                onChange={handleChange}
                                options={currencyOptions}
                            />
                            <Select
                                label="Timeline"
                                name="timeline"
                                value={formData.timeline}
                                onChange={handleChange}
                                options={timelineOptions}
                            />
                        </div>

                        <div className="mt-4">
                            <label className="mb-1 block text-sm font-medium text-slate-600">
                                Description
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows="4"
                                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                placeholder="Describe the lead requirements..."
                            />
                        </div>
                    </div>

                    {/* Qualification */}
                    <div className="mb-6">
                        <h3 className="mb-4 text-lg font-bold text-slate-800">
                            Qualification
                        </h3>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                            <Select
                                label="Status"
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                options={statusOptions}
                            />
                            <Select
                                label="Temperature"
                                name="temperature"
                                value={formData.temperature}
                                onChange={handleChange}
                                options={temperatureOptions}
                            />
                            <Input
                                label="Score"
                                type="number"
                                name="score"
                                value={formData.score}
                                onChange={handleChange}
                                min="0"
                                max="100"
                            />
                        </div>
                    </div>

                    {/* Business Information */}
                    <div className="mb-6">
                        <h3 className="mb-4 text-lg font-bold text-slate-800">
                            Business Information
                        </h3>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <Select
                                label="Service"
                                name="service_id"
                                value={formData.service_id}
                                onChange={handleChange}
                                options={[
                                    ["", "— Select service —"],
                                    ...services.map(s => [s.id, s.name]),
                                ]}
                            />
                            <Select
                                label="Industry"
                                name="industry_id"
                                value={formData.industry_id}
                                onChange={handleChange}
                                options={[
                                    ["", "— Select industry —"],
                                    ...industries.map(i => [i.id, i.name]),
                                ]}
                            />
                            <Select
                                label="Source"
                                name="source_id"
                                value={formData.source_id}
                                onChange={handleChange}
                                options={[
                                    ["", "— Select source —"],
                                    ...sources.map(s => [s.id, s.name]),
                                ]}
                            />
                            <Select
                                label="Owner"
                                name="owner_id"
                                value={formData.owner_id}
                                onChange={handleChange}
                                options={[
                                    ["", "— Unassigned —"],
                                    ...owners.map(o => [o.id, o.full_name]),
                                ]}
                            />
                        </div>
                    </div>

                    {/* Opportunity */}
                    <div className="mb-6">
                        <h3 className="mb-4 text-lg font-bold text-slate-800">
                            Opportunity
                        </h3>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <Select
                                label="Budget Range"
                                name="budget_range"
                                value={formData.budget_range}
                                onChange={handleChange}
                                options={budgetOptions}
                            />
                        </div>
                    </div>

                    {/* Follow Up */}
                    <div className="mb-6">
                        <h3 className="mb-4 text-lg font-bold text-slate-800">
                            Follow Up
                        </h3>
                        <Input
                            label="Next Follow Up"
                            type="datetime-local"
                            name="next_follow_up_at"
                            value={formData.next_follow_up_at}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="flex justify-end gap-3 border-t border-slate-200 pt-5">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="rounded-lg bg-gradient-to-r from-cyan-500 to-purple-600 px-5 py-2.5 text-sm font-medium text-white hover:from-cyan-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? "Saving..." : isEditMode ? "Update Lead" : "Create Lead"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const Input = ({ label, name, type = "text", value, onChange, ...props }) => (
    <div>
        <label className="mb-1 block text-sm font-medium text-slate-600">{label}</label>
        <input
            type={type}
            name={name}
            value={value ?? ""}
            onChange={onChange}
            className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            {...props}
        />
    </div>
);

const Select = ({ label, name, value, onChange, options }) => (
    <div>
        <label className="mb-1 block text-sm font-medium text-slate-600">{label}</label>
        <select
            name={name}
            value={value ?? ""}
            onChange={onChange}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        >
            {options.map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
            ))}
        </select>
    </div>
);

export default LeadForm;