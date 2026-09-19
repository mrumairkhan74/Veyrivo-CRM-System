/* eslint-disable react-hooks/set-state-in-effect */

import { useState, useEffect } from 'react';
import {
    X, Building2, Globe, MapPin, Users, Briefcase,
    Mail, Phone, Save, Trash2, Link
} from 'lucide-react';

/* ---------- Field components (OUTSIDE the form) ---------- */

const InputField = ({
    label, name, type = 'text', placeholder = '',
    required = false, icon: Icon, value, onChange, onBlur, error, ...props
}) => (
    <div className="space-y-1.5">
        <label className="block text-sm font-medium text-gray-700">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
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
                className={`w-full ${Icon ? 'pl-9' : 'pl-3'} pr-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-shadow ${
                    error ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                {...props}
            />
        </div>
        {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
);

const SelectField = ({
    label, name, options, placeholder = 'Select...',
    required = false, icon: Icon, value, onChange, onBlur, error, ...props
}) => (
    <div className="space-y-1.5">
        <label className="block text-sm font-medium text-gray-700">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <div className="relative">
            {Icon && <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />}
            <select
                name={name}
                value={value ?? ''}
                onChange={onChange}
                onBlur={onBlur}
                className={`w-full ${Icon ? 'pl-9' : 'pl-3'} pr-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-shadow appearance-none bg-white ${
                    error ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                {...props}
            >
                <option value="">{placeholder}</option>
                {options.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                ))}
            </select>
        </div>
        {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
);

const TextAreaField = ({
    label, name, placeholder = '', rows = 3,
    value, onChange, onBlur, error, ...props
}) => (
    <div className="space-y-1.5">
        <label className="block text-sm font-medium text-gray-700">{label}</label>
        <textarea
            name={name}
            value={value ?? ''}
            onChange={onChange}
            onBlur={onBlur}
            placeholder={placeholder}
            rows={rows}
            className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-shadow resize-y ${
                error ? 'border-red-300 bg-red-50' : 'border-gray-300'
            }`}
            {...props}
        />
        {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
);

/* ---------- Options ---------- */

const sizeOptions = [
    { value: 'enterprise', label: 'Enterprise (1000+)' },
    { value: 'large', label: 'Large (250-999)' },
    { value: 'medium', label: 'Medium (50-249)' },
    { value: 'small', label: 'Small (10-49)' },
    { value: 'startup', label: 'Startup (1-9)' },
];

const statusOptions = [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'pending', label: 'Pending' },
    { value: 'archived', label: 'Archived' },
];

/* Matches the `companies` table columns exactly.
   organization_id is intentionally omitted — see note at the bottom. */
const emptyCompany = {
    name: '',
    website: '',
    domain: '',
    industry_id: '',
    company_size: 'medium',
    status: 'active',
    address: '',
    city: '',
    country: '',
    phone: '',
    email: '',
    source_id: '',
    owner_id: '',
};

/* ---------- Form ---------- */

const CompanyForm = ({
    mode = 'create',
    company = null,
    onSave,
    onCancel,
    onDelete,
    loading = false,
    industries = [],
    sources = [],
    owners = [],
}) => {
    const [formData, setFormData] = useState(emptyCompany);
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});

    // Load initial values for edit mode
    useEffect(() => {
        if (mode === 'edit' && company) {
            const next = { ...emptyCompany };
            Object.keys(emptyCompany).forEach(k => {
                next[k] = company[k] ?? emptyCompany[k];
            });
            setFormData(next);
        } else {
            setFormData(emptyCompany);
        }
        setErrors({});
        setTouched({});
    }, [mode, company]);

    // Auto-domain from website
    useEffect(() => {
        if (formData.website && !formData.domain) {
            try {
                const url = new URL(formData.website);
                const domain = url.hostname.replace(/^www\./, '');
                setFormData(prev => (prev.domain ? prev : { ...prev, domain }));
            } catch { /* ignore */ }
        }
    }, [formData.website, formData.domain]);

    const validateField = (name, value) => {
        switch (name) {
            case 'name':
                if (!value || value.trim().length < 2) return 'Company name is required (min 2 characters)';
                if (value.trim().length > 200) return 'Company name must be less than 200 characters';
                return '';
            case 'email':
                if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Please enter a valid email address';
                return '';
            case 'website':
                if (value && !/^https?:\/\/.+\..+/.test(value)) return 'Please enter a valid URL (include http:// or https://)';
                return '';
            default:
                return '';
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (touched[name]) {
            setErrors(prev => ({ ...prev, [name]: validateField(name, value) }));
        }
    };

    const handleBlur = (e) => {
        const { name, value } = e.target;
        setTouched(prev => ({ ...prev, [name]: true }));
        setErrors(prev => ({ ...prev, [name]: validateField(name, value) }));
    };

    const validateForm = () => {
        const newErrors = {};
        let isValid = true;
        Object.keys(formData).forEach(key => {
            const err = validateField(key, formData[key]);
            if (err) { newErrors[key] = err; isValid = false; }
        });
        setErrors(newErrors);
        setTouched(Object.keys(formData).reduce((a, k) => (a[k] = true, a), {}));
        return isValid;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        const submitData = { ...formData };
        Object.keys(submitData).forEach(key => {
            if (submitData[key] === '' || submitData[key] === null) delete submitData[key];
        });
        onSave?.(submitData);
    };

    const fieldProps = (name) => ({
        value: formData[name],
        onChange: handleChange,
        onBlur: handleBlur,
        error: touched[name] ? errors[name] : '',
    });

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-lg">
                            <Building2 className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900">
                                {mode === 'create' ? 'Add New Company' : 'Edit Company'}
                            </h2>
                            <p className="text-sm text-gray-500">
                                {mode === 'create'
                                    ? 'Create a new company record'
                                    : `Editing ${company?.name || 'company'}`}
                            </p>
                        </div>
                    </div>
                    <button onClick={onCancel} type="button"
                        className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="overflow-y-auto p-6"
                      style={{ maxHeight: 'calc(90vh - 140px)' }}>
                    <div className="space-y-6">
                        {/* Basic */}
                        <div>
                            <h3 className="text-sm font-medium text-gray-700 mb-4 flex items-center gap-2">
                                <Briefcase className="w-4 h-4" /> Basic Information
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <InputField label="Company Name" name="name" placeholder="e.g., Acme Corp" required icon={Building2} {...fieldProps('name')} />
                                <InputField label="Website" name="website" placeholder="https://acme.com" icon={Globe} {...fieldProps('website')} />
                                <InputField label="Domain" name="domain" placeholder="acme.com" icon={Link} {...fieldProps('domain')} />
                            </div>
                        </div>

                        {/* Details */}
                        <div>
                            <h3 className="text-sm font-medium text-gray-700 mb-4 flex items-center gap-2">
                                <Users className="w-4 h-4" /> Company Details
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <SelectField label="Industry" name="industry_id"
                                    options={industries.map(i => ({ value: i.id, label: i.name }))}
                                    placeholder="Select industry" icon={Briefcase} {...fieldProps('industry_id')} />
                                <SelectField label="Company Size" name="company_size"
                                    options={sizeOptions} placeholder="Select size" icon={Users} {...fieldProps('company_size')} />
                                <SelectField label="Status" name="status"
                                    options={statusOptions} placeholder="Select status" {...fieldProps('status')} />
                                <SelectField label="Source" name="source_id"
                                    options={sources.map(s => ({ value: s.id, label: s.name }))}
                                    placeholder="How did you find this company?" {...fieldProps('source_id')} />
                            </div>
                        </div>

                        {/* Contact */}
                        <div>
                            <h3 className="text-sm font-medium text-gray-700 mb-4 flex items-center gap-2">
                                <Mail className="w-4 h-4" /> Contact Information
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <InputField label="Email" name="email" type="email" placeholder="contact@acme.com" icon={Mail} {...fieldProps('email')} />
                                <InputField label="Phone" name="phone" placeholder="+1 (555) 123-4567" icon={Phone} {...fieldProps('phone')} />
                            </div>
                        </div>

                        {/* Address (single text column in DB) */}
                        <div>
                            <h3 className="text-sm font-medium text-gray-700 mb-4 flex items-center gap-2">
                                <MapPin className="w-4 h-4" /> Address
                            </h3>
                            <div className="space-y-4">
                                <TextAreaField
                                    label="Address"
                                    name="address"
                                    placeholder="123 Main Street, Suite 100"
                                    rows={2}
                                    {...fieldProps('address')}
                                />
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <InputField label="City" name="city" placeholder="New York" {...fieldProps('city')} />
                                    <InputField label="Country" name="country" placeholder="United States" {...fieldProps('country')} />
                                </div>
                            </div>
                        </div>

                        {/* Additional */}
                        <div>
                            <h3 className="text-sm font-medium text-gray-700 mb-4">Additional Information</h3>
                            <div className="space-y-4">
                                <SelectField label="Owner" name="owner_id"
                                    options={owners.map(o => ({ value: o.id, label: o.full_name }))}
                                    placeholder="Assign an owner" {...fieldProps('owner_id')} />
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between pt-6 mt-6 border-t border-gray-200">
                        <div>
                            {mode === 'edit' && onDelete && company && (
                                <button type="button" onClick={() => onDelete(company)}
                                    className="inline-flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg text-sm font-medium">
                                    <Trash2 className="w-4 h-4" /> Delete Company
                                </button>
                            )}
                        </div>
                        <div className="flex items-center gap-3">
                            <button type="button" onClick={onCancel}
                                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg text-sm font-medium">
                                Cancel
                            </button>
                            <button type="submit" disabled={loading}
                                className="inline-flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-lg hover:opacity-90 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed">
                                <Save className="w-4 h-4" />
                                {loading ? 'Saving...' : mode === 'create' ? 'Create Company' : 'Update Company'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CompanyForm;