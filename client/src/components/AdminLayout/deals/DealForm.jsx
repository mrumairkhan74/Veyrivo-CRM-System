import { useState, useCallback } from 'react';
import {
    X, Building2, Users, DollarSign, Calendar,
    Target, Save, Trash2, Link
} from 'lucide-react';

const stageProbabilities = {
    new: 10,
    qualified: 25,
    proposal: 50,
    negotiation: 75,
    won: 100,
    lost: 0,
};

const currencyOptions = [
    { value: 'USD', label: 'USD' },
    { value: 'EUR', label: 'EUR' },
    { value: 'GBP', label: 'GBP' },
    { value: 'PKR', label: 'PKR' },
];

const emptyFormData = {
    title: '',
    company_id: '',
    contact_id: '',
    value: '',
    currency: 'USD',
    stage: 'new',
    probability: 10,
    expected_close_date: '',
    owner_id: '',
    source_id: '',
    notes: '',
    lead_id: '',
};

/* ---------- Field components (module scope) ---------- */

const InputField = ({ label, name, type = 'text', placeholder = '', required = false, icon: Icon, value, onChange, onBlur, error, ...props }) => (
    <div className="space-y-1.5">
        <label className="block text-sm font-medium text-gray-700">
            {label} {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <div className="relative">
            {Icon && <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />}
            <input
                type={type}
                name={name}
                value={value ?? ''}
                onChange={onChange}
                onBlur={onBlur}
                placeholder={placeholder}
                className={`w-full ${Icon ? 'pl-9' : 'pl-3'} pr-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-shadow ${error ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                {...props}
            />
        </div>
        {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
);

const SelectField = ({ label, name, options, placeholder = 'Select...', required = false, icon: Icon, value, onChange, error, ...props }) => (
    <div className="space-y-1.5">
        <label className="block text-sm font-medium text-gray-700">
            {label} {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <div className="relative">
            {Icon && <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />}
            <select
                name={name}
                value={value ?? ''}
                onChange={onChange}
                className={`w-full ${Icon ? 'pl-9' : 'pl-3'} pr-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none appearance-none bg-white ${error ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                {...props}
            >
                <option value="">{placeholder}</option>
                {options.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                ))}
            </select>
        </div>
        {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
);

const TextAreaField = ({ label, name, placeholder = '', rows = 3, value, onChange, onBlur, error }) => (
    <div className="space-y-1.5">
        <label className="block text-sm font-medium text-gray-700">{label}</label>
        <textarea
            name={name}
            value={value ?? ''}
            onChange={onChange}
            onBlur={onBlur}
            placeholder={placeholder}
            rows={rows}
            className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-shadow resize-y ${error ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
        />
        {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
);

/* ---------- Form ---------- */

const DealForm = ({
    mode = 'create',
    deal = null,
    onSave,
    onCancel,
    onDelete,
    loading = false,
    stages = [],
    companies = [],
    contacts = [],
    sources = [],
    owners = [],
}) => {
    const [formData, setFormData] = useState(() => {
        if (mode === 'edit' && deal) {
            return {
                title: deal.title || '',
                company_id: deal.company_id || '',
                contact_id: deal.contact_id || '',
                value: deal.value ?? '',
                currency: deal.currency || 'USD',
                stage: deal.stage || 'new',
                probability: deal.probability ?? stageProbabilities[deal.stage] ?? 10,
                expected_close_date: deal.expected_close_date
                    ? String(deal.expected_close_date).slice(0, 10)
                    : '',
                owner_id: deal.owner_id || '',
                source_id: deal.source_id || '',
                notes: deal.notes || '',
                lead_id: deal.lead_id || '',
            };
        }
        return emptyFormData;
    });

    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});

    const validateField = useCallback((name, value) => {
        switch (name) {
            case 'title':
                return !value || value.trim().length < 2 ? 'Deal title is required (min 2 characters)' : '';
            case 'value':
                return !value || isNaN(value) || parseFloat(value) <= 0 ? 'Valid value is required' : '';
            case 'probability':
                return value < 0 || value > 100 ? 'Probability must be 0-100' : '';
            case 'expected_close_date':
                return value && new Date(value) < new Date(new Date().setHours(0, 0, 0, 0))
                    ? 'Close date cannot be in the past'
                    : '';
            default:
                return '';
        }
    }, []);

    const handleChange = useCallback((e) => {
        const { name, value } = e.target;

        setFormData((prev) => {
            const next = { ...prev, [name]: value };
            // Auto-set probability on stage change (only if user hasn't manually tweaked it)
            if (name === 'stage' && stageProbabilities[value] !== undefined && !touched.probability) {
                next.probability = stageProbabilities[value];
            }
            return next;
        });

        const error = validateField(name, value);
        setErrors((prev) => ({ ...prev, [name]: error }));
    }, [validateField, touched.probability]);

    const handleBlur = useCallback((e) => {
        const { name, value } = e.target;
        setTouched((prev) => ({ ...prev, [name]: true }));
        const error = validateField(name, value);
        setErrors((prev) => ({ ...prev, [name]: error }));
    }, [validateField]);

    const validateForm = useCallback(() => {
        const newErrors = {};
        let isValid = true;
        Object.keys(formData).forEach((key) => {
            const error = validateField(key, formData[key]);
            if (error) {
                newErrors[key] = error;
                isValid = false;
            }
        });
        setErrors(newErrors);
        return isValid;
    }, [formData, validateField]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        const submitData = {
            ...formData,
            value: formData.value === '' ? 0 : Number(formData.value),
            probability: formData.probability === '' ? 0 : Number(formData.probability),
        };

        // Drop empty strings / nulls so we don't send them as literal "" to the DB
        Object.keys(submitData).forEach((key) => {
            if (submitData[key] === '' || submitData[key] === null) {
                delete submitData[key];
            }
        });

        onSave?.(submitData);
    };

    const getFieldError = (name) => (touched[name] && errors[name] ? errors[name] : '');

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-lg">
                            <Target className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900">
                                {mode === 'create' ? 'Add New Deal' : 'Edit Deal'}
                            </h2>
                            <p className="text-sm text-gray-500">
                                {mode === 'create'
                                    ? 'Create a new deal in the pipeline'
                                    : `Editing ${deal?.title || 'deal'}`}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onCancel}
                        className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="overflow-y-auto p-6" style={{ maxHeight: 'calc(90vh - 140px)' }}>
                    <div className="space-y-6">

                        {/* Deal Information */}
                        <div>
                            <h3 className="text-sm font-medium text-gray-700 mb-4 flex items-center gap-2">
                                <Target className="w-4 h-4" /> Deal Information
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <InputField
                                    label="Deal Title"
                                    name="title"
                                    placeholder="e.g. Website Redesign Project"
                                    required
                                    icon={Target}
                                    value={formData.title}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    error={getFieldError('title')}
                                />
                                <SelectField
                                    label="Company"
                                    name="company_id"
                                    options={companies.map((c) => ({ value: c.id, label: c.name }))}
                                    placeholder="Select company"
                                    icon={Building2}
                                    value={formData.company_id}
                                    onChange={handleChange}
                                    error={getFieldError('company_id')}
                                />
                                <SelectField
                                    label="Contact"
                                    name="contact_id"
                                    options={contacts.map((c) => ({ value: c.id, label: c.full_name }))}
                                    placeholder="Select contact"
                                    icon={Users}
                                    value={formData.contact_id}
                                    onChange={handleChange}
                                    error={getFieldError('contact_id')}
                                />
                                <SelectField
                                    label="Source"
                                    name="source_id"
                                    options={sources.map((s) => ({ value: s.id, label: s.name }))}
                                    placeholder="Lead source"
                                    icon={Link}
                                    value={formData.source_id}
                                    onChange={handleChange}
                                    error={getFieldError('source_id')}
                                />
                            </div>
                        </div>

                        {/* Financial */}
                        <div>
                            <h3 className="text-sm font-medium text-gray-700 mb-4 flex items-center gap-2">
                                <DollarSign className="w-4 h-4" /> Financial Details
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <InputField
                                    label="Deal Value"
                                    name="value"
                                    type="number"
                                    placeholder="0"
                                    required
                                    icon={DollarSign}
                                    min="0"
                                    step="100"
                                    value={formData.value}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    error={getFieldError('value')}
                                />
                                <SelectField
                                    label="Currency"
                                    name="currency"
                                    options={currencyOptions}
                                    placeholder="Currency"
                                    required
                                    value={formData.currency}
                                    onChange={handleChange}
                                    error={getFieldError('currency')}
                                />
                                <InputField
                                    label="Probability (%)"
                                    name="probability"
                                    type="number"
                                    placeholder="25"
                                    min="0"
                                    max="100"
                                    required
                                    value={formData.probability}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    error={getFieldError('probability')}
                                />
                                <InputField
                                    label="Expected Close Date"
                                    name="expected_close_date"
                                    type="date"
                                    icon={Calendar}
                                    value={formData.expected_close_date}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    error={getFieldError('expected_close_date')}
                                />
                            </div>
                        </div>

                        {/* Pipeline */}
                        <div>
                            <h3 className="text-sm font-medium text-gray-700 mb-4 flex items-center gap-2">
                                <Users className="w-4 h-4" /> Pipeline
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <SelectField
                                    label="Stage"
                                    name="stage"
                                    options={stages.map((s) => ({ value: s.id, label: s.label }))}
                                    placeholder="Select stage"
                                    required
                                    icon={Target}
                                    value={formData.stage}
                                    onChange={handleChange}
                                    error={getFieldError('stage')}
                                />
                                <SelectField
                                    label="Owner"
                                    name="owner_id"
                                    options={owners.map((o) => ({ value: o.id, label: o.full_name }))}
                                    placeholder="Assign owner"
                                    required
                                    icon={Users}
                                    value={formData.owner_id}
                                    onChange={handleChange}
                                    error={getFieldError('owner_id')}
                                />
                            </div>
                        </div>

                        {/* Notes */}
                        <div>
                            <h3 className="text-sm font-medium text-gray-700 mb-4">Notes</h3>
                            <TextAreaField
                                label="Notes"
                                name="notes"
                                placeholder="Additional details, next steps, requirements..."
                                rows={4}
                                value={formData.notes}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                error={getFieldError('notes')}
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-between pt-6 mt-6 border-t border-gray-200">
                        <div>
                            {mode === 'edit' && onDelete && deal && (
                                <button
                                    type="button"
                                    onClick={() => onDelete(deal)}
                                    className="inline-flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg text-sm font-medium"
                                >
                                    <Trash2 className="w-4 h-4" /> Delete Deal
                                </button>
                            )}
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={onCancel}
                                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg text-sm font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="inline-flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-lg hover:opacity-90 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Save className="w-4 h-4" />
                                {loading ? 'Saving...' : mode === 'create' ? 'Create Deal' : 'Update Deal'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default DealForm;