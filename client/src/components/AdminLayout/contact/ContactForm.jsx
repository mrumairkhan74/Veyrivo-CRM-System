/* eslint-disable no-useless-escape */
/* eslint-disable react-hooks/set-state-in-effect */

import { useState, useEffect } from 'react';
import {
    X, User, Mail, Phone, Briefcase, Building2,
    Save, Trash2, Shield, Smartphone
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

const CheckboxField = ({ label, name, checked, onChange }) => (
    <div className="flex items-center gap-2">
        <input
            type="checkbox"
            name={name}
            checked={!!checked}
            onChange={onChange}
            className="w-4 h-4 rounded border-gray-300 text-cyan-600 focus:ring-cyan-500"
        />
        <label className="text-sm text-gray-700">{label}</label>
    </div>
);

/* ---------- Options ---------- */

const statusOptions = [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'archived', label: 'Archived' },
];

const consentOptions = [
    { value: 'opted_in', label: 'Opted In' },
    { value: 'opted_out', label: 'Opted Out' },
    { value: 'pending', label: 'Pending' },   // DB CHECK uses 'pending', not 'unknown'
];

const emptyContact = {
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    mobile: '',
    title: '',
    company_id: '',
    is_decision_maker: false,
    status: 'active',
    consent_status: 'pending',   // ← must match DB CHECK
    source_id: '',
    owner_id: '',
};

/* ---------- Form ---------- */

const ContactForm = ({
    mode = 'create',
    contact = null,
    onSave,
    onCancel,
    onDelete,
    loading = false,
    companies = [],
    sources = [],
    owners = [],
}) => {
    const [formData, setFormData] = useState(emptyContact);
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});

    useEffect(() => {
        if (mode === 'edit' && contact) {
            const next = { ...emptyContact };
            Object.keys(emptyContact).forEach(k => {
                next[k] = contact[k] ?? emptyContact[k];
            });
            setFormData(next);
        } else {
            setFormData(emptyContact);
        }
        setErrors({});
        setTouched({});
    }, [mode, contact]);

    const validateField = (name, value) => {
        switch (name) {
            case 'first_name':
                if (!value || value.trim().length < 2) return 'First name is required (min 2 characters)';
                return '';
            case 'last_name':
                if (!value || value.trim().length < 2) return 'Last name is required (min 2 characters)';
                return '';
            case 'email':
                // DB column is NOT NULL, so email is required
                if (!value) return 'Email is required';
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Please enter a valid email address';
                return '';
            case 'phone':
            case 'mobile':
                if (value && !/^[\+\d\s\-\(\)]{7,}$/.test(value)) return 'Please enter a valid phone number';
                return '';
            default:
                return '';
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        const val = type === 'checkbox' ? checked : value;
        setFormData(prev => ({ ...prev, [name]: val }));
        if (touched[name]) {
            setErrors(prev => ({ ...prev, [name]: validateField(name, val) }));
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
                            <User className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900">
                                {mode === 'create' ? 'Add New Contact' : 'Edit Contact'}
                            </h2>
                            <p className="text-sm text-gray-500">
                                {mode === 'create'
                                    ? 'Create a new contact record'
                                    : `Editing ${contact?.first_name || ''} ${contact?.last_name || ''}`}
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

                        {/* Personal */}
                        <div>
                            <h3 className="text-sm font-medium text-gray-700 mb-4 flex items-center gap-2">
                                <User className="w-4 h-4" /> Personal Information
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <InputField label="First Name" name="first_name" placeholder="John" required icon={User} {...fieldProps('first_name')} />
                                <InputField label="Last Name" name="last_name" placeholder="Doe" required icon={User} {...fieldProps('last_name')} />
                            </div>
                        </div>

                        {/* Contact */}
                        <div>
                            <h3 className="text-sm font-medium text-gray-700 mb-4 flex items-center gap-2">
                                <Mail className="w-4 h-4" /> Contact Information
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <InputField label="Email" name="email" type="email" placeholder="john.doe@company.com" required icon={Mail} {...fieldProps('email')} />
                                <InputField label="Phone" name="phone" placeholder="+1 (555) 123-4567" icon={Phone} {...fieldProps('phone')} />
                                <InputField label="Mobile" name="mobile" placeholder="+1 (555) 987-6543" icon={Smartphone} {...fieldProps('mobile')} />
                            </div>
                        </div>

                        {/* Professional */}
                        <div>
                            <h3 className="text-sm font-medium text-gray-700 mb-4 flex items-center gap-2">
                                <Briefcase className="w-4 h-4" /> Professional Information
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <SelectField
                                    label="Company"
                                    name="company_id"
                                    options={companies.map(c => ({ value: c.id, label: c.name }))}
                                    placeholder="Select company"
                                    icon={Building2}
                                    {...fieldProps('company_id')}
                                />
                                <InputField label="Job Title" name="title" placeholder="Software Engineer" icon={Briefcase} {...fieldProps('title')} />
                                <SelectField
                                    label="Status"
                                    name="status"
                                    options={statusOptions}
                                    placeholder="Select status"
                                    {...fieldProps('status')}
                                />
                                <SelectField
                                    label="Owner"
                                    name="owner_id"
                                    options={owners.map(o => ({ value: o.id, label: o.full_name }))}
                                    placeholder="Assign an owner"
                                    {...fieldProps('owner_id')}
                                />
                                <SelectField
                                    label="Source"
                                    name="source_id"
                                    options={sources.map(s => ({ value: s.id, label: s.name }))}
                                    placeholder="How did you meet?"
                                    {...fieldProps('source_id')}
                                />
                                <div className="flex items-center pt-6">
                                    <CheckboxField
                                        label="Decision Maker"
                                        name="is_decision_maker"
                                        checked={formData.is_decision_maker}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Consent */}
                        <div>
                            <h3 className="text-sm font-medium text-gray-700 mb-4 flex items-center gap-2">
                                <Shield className="w-4 h-4" /> Consent & Privacy
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <SelectField
                                    label="Consent Status"
                                    name="consent_status"
                                    options={consentOptions}
                                    placeholder="Select consent status"
                                    icon={Shield}
                                    {...fieldProps('consent_status')}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between pt-6 mt-6 border-t border-gray-200">
                        <div>
                            {mode === 'edit' && onDelete && contact && (
                                <button type="button" onClick={() => onDelete(contact)}
                                    className="inline-flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg text-sm font-medium">
                                    <Trash2 className="w-4 h-4" /> Delete Contact
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
                                {loading ? 'Saving...' : mode === 'create' ? 'Create Contact' : 'Update Contact'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ContactForm;