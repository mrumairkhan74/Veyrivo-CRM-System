/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from "react";
import { X } from "lucide-react";

const emptyLead = {
    title: "",
    description: "",
    contact: "",
    email: "",
    company: "",
    status: "new",
    temperature: "unknown",
    score: 0,
    source: "",
    service: "",
    industry: "",
    estimated_value: "",
    currency: "USD",
    timeline: "exploring",
    budget_range: "unknown",
    owner: "",
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

const LeadForm = ({ mode = "create", lead = null, setIsOpen, onSubmit }) => {
    const [formData, setFormData] = useState(emptyLead);
    const isEditMode = mode === "edit";

    useEffect(() => {
        if (lead) {
            setFormData({
                ...emptyLead,
                ...lead,
            });
        } else {
            setFormData(emptyLead);
        }
    }, [lead]);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (onSubmit) {
            onSubmit(formData);
        }
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
                            {isEditMode
                                ? "Update Lead Information"
                                : "Add New Lead"}
                        </h2>
                    </div>

                    <button
                        type="button"
                        onClick={() => setIsOpen(false)}
                        className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                    >
                        <X size={22} />
                    </button>

                </div>

                {/* Form */}
                <form
                    onSubmit={handleSubmit}
                    className="overflow-y-auto p-5 md:p-6"
                >

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
                                label="Contact Name"
                                name="contact"
                                value={formData.contact}
                                onChange={handleChange}
                                required
                            />

                            <Input
                                label="Email"
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                            />

                            <Input
                                label="Company"
                                name="company"
                                value={formData.company}
                                onChange={handleChange}
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

                            <Input
                                label="Service"
                                name="service"
                                value={formData.service}
                                onChange={handleChange}
                            />

                            <Input
                                label="Industry"
                                name="industry"
                                value={formData.industry}
                                onChange={handleChange}
                            />

                            <Input
                                label="Source"
                                name="source"
                                value={formData.source}
                                onChange={handleChange}
                            />

                            <Input
                                label="Owner"
                                name="owner"
                                value={formData.owner}
                                onChange={handleChange}
                            />

                        </div>
                    </div>

                    {/* Opportunity */}
                    <div className="mb-6">
                        <h3 className="mb-4 text-lg font-bold text-slate-800">
                            Opportunity

                        </h3>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

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

                    {/* Footer */}
                    <div className="flex justify-end gap-3 border-t border-slate-200 pt-5">

                        <button
                            type="button"
                            onClick={() => setIsOpen(false)}
                            className="rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
                        >
                            {isEditMode ? "Update Lead" : "Create Lead"}
                        </button>

                    </div>

                </form>
            </div>
        </div>
    );
};

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
            <label className="mb-1 block text-sm font-medium text-slate-600">
                {label}
            </label>

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
};

const Select = ({
    label,
    name,
    value,
    onChange,
    options,
}) => {
    return (
        <div>
            <label className="mb-1 block text-sm font-medium text-slate-600">
                {label}
            </label>

            <select
                name={name}
                value={value ?? ""}
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

export default LeadForm;