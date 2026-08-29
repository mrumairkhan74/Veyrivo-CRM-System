/* eslint-disable react-hooks/static-components */
/* eslint-disable react-hooks/set-state-in-effect */

import { useState, useEffect } from 'react';
import {
    X,
    Building2,
    Globe,
    MapPin,
    Users,
    Briefcase,
    Mail,
    Phone,
    Save,
    Trash2,
    Link,
    Hash
} from 'lucide-react';

const CompanyForm = ({
    mode = 'create',
    company = null,
    onSave,
    onCancel,
    onDelete,
    loading = false,
    industries = [],
    sources = [],
    owners = []
}) => {
    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        website: '',
        domain: '',
        industry_id: '',
        company_size: 'medium',
        status: 'active',
        description: '',
        address_line1: '',
        address_line2: '',
        city: '',
        state: '',
        country: '',
        postal_code: '',
        phone: '',
        email: '',
        source_id: '',
        owner_id: '',
        logo_url: ''
    });

    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});

    useEffect(() => {
        if (mode === 'edit' && company) {
            setFormData({
                name: company.name || '',
                slug: company.slug || '',
                website: company.website || '',
                domain: company.domain || '',
                industry_id: company.industry_id || '',
                company_size: company.company_size || 'medium',
                status: company.status || 'active',
                description: company.description || '',
                address_line1: company.address_line1 || '',
                address_line2: company.address_line2 || '',
                city: company.city || '',
                state: company.state || '',
                country: company.country || '',
                postal_code: company.postal_code || '',
                phone: company.phone || '',
                email: company.email || '',
                source_id: company.source_id || '',
                owner_id: company.owner_id || '',
                logo_url: company.logo_url || ''
            });
        }
    }, [mode, company]);

    useEffect(() => {
        if (formData.name && !formData.slug) {
            const slug = formData.name
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-+|-+$/g, '');
            setFormData(prev => ({ ...prev, slug }));
        }
    }, [formData.name, formData.slug]);

    useEffect(() => {
        if (formData.website && !formData.domain) {
            try {
                const url = new URL(formData.website);
                const domain = url.hostname.replace(/^www\./, '');
                setFormData(prev => ({ ...prev, domain }));
            } catch (e) { 
                console.error(e,"Error")
            }
        }
    }, [formData.website, formData.domain]);

    const validateField = (name, value) => {
        switch (name) {
            case 'name':
                if (!value || value.trim().length < 2) {
                    return 'Company name is required and must be at least 2 characters';
                }
                if (value.trim().length > 200) {
                    return 'Company name must be less than 200 characters';
                }
                return '';
            case 'slug':
                if (value && !/^[a-z0-9-]+$/.test(value)) {
                    return 'Slug can only contain lowercase letters, numbers, and hyphens';
                }
                return '';
            case 'email':
                if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                    return 'Please enter a valid email address';
                }
                return '';
            case 'website':
                if (value && !/^https?:\/\/.+\..+/.test(value)) {
                    return 'Please enter a valid URL (include http:// or https://)';
                }
                return '';
            default:
                return '';
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        const error = validateField(name, value);
        setErrors(prev => ({ ...prev, [name]: error }));
    };

    const handleBlur = (e) => {
        const { name } = e.target;
        setTouched(prev => ({ ...prev, [name]: true }));
        const error = validateField(name, formData[name]);
        setErrors(prev => ({ ...prev, [name]: error }));
    };

    const validateForm = () => {
        const newErrors = {};
        let isValid = true;

        if (!formData.name || !formData.name.trim()) {
            newErrors.name = 'Company name is required';
            isValid = false;
        }

        Object.keys(formData).forEach(key => {
            const error = validateField(key, formData[key]);
            if (error) {
                newErrors[key] = error;
                isValid = false;
            }
        });

        setErrors(newErrors);
        return isValid;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validateForm()) {
            const submitData = { ...formData };
            Object.keys(submitData).forEach(key => {
                if (submitData[key] === '' || submitData[key] === null) {
                    delete submitData[key];
                }
            });
            onSave(submitData);
        }
    };

    const sizeOptions = [
        { value: 'enterprise', label: 'Enterprise (1000+)' },
        { value: 'large', label: 'Large (250-999)' },
        { value: 'medium', label: 'Medium (50-249)' },
        { value: 'small', label: 'Small (10-49)' },
        { value: 'startup', label: 'Startup (1-9)' }
    ];

    const statusOptions = [
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' },
        { value: 'pending', label: 'Pending' },
        { value: 'archived', label: 'Archived' }
    ];

    const getFieldError = (name) => {
        return touched[name] && errors[name] ? errors[name] : '';
    };

    const InputField = ({ label, name, type = 'text', placeholder = '', required = false, icon: Icon, ...props }) => {
        const error = getFieldError(name);
        return (
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
                        value={formData[name] || ''}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder={placeholder}
                        className={`w-full ${Icon ? 'pl-9' : 'pl-3'} pr-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-shadow ${error ? 'border-red-300 bg-red-50' : 'border-gray-300'
                            }`}
                        {...props}
                    />
                </div>
                {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
            </div>
        );
    };

    const SelectField = ({ label, name, options, placeholder = 'Select...', required = false, icon: Icon, ...props }) => {
        const error = getFieldError(name);
        return (
            <div className="space-y-1.5">
                <label className="block text-sm font-medium text-gray-700">
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
                <div className="relative">
                    {Icon && <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />}
                    <select
                        name={name}
                        value={formData[name] || ''}
                        onChange={handleChange}
                        className={`w-full ${Icon ? 'pl-9' : 'pl-3'} pr-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-shadow appearance-none bg-white ${error ? 'border-red-300 bg-red-50' : 'border-gray-300'
                            }`}
                        {...props}
                    >
                        <option value="">{placeholder}</option>
                        {options.map(option => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>
                {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
            </div>
        );
    };

    const TextAreaField = ({ label, name, placeholder = '', rows = 3, ...props }) => {
        const error = getFieldError(name);
        return (
            <div className="space-y-1.5">
                <label className="block text-sm font-medium text-gray-700">{label}</label>
                <textarea
                    name={name}
                    value={formData[name] || ''}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder={placeholder}
                    rows={rows}
                    className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-shadow resize-y ${error ? 'border-red-300 bg-red-50' : 'border-gray-300'
                        }`}
                    {...props}
                />
                {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
            </div>
        );
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
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
                                {mode === 'create' ? 'Create a new company record' : `Editing ${company?.name || 'company'}`}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onCancel}
                        className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="overflow-y-auto p-6" style={{ maxHeight: 'calc(90vh - 140px)' }}>
                    <div className="space-y-6">
                        {/* Basic Information */}
                        <div>
                            <h3 className="text-sm font-medium text-gray-700 mb-4 flex items-center gap-2">
                                <Briefcase className="w-4 h-4" />
                                Basic Information
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <InputField
                                    label="Company Name"
                                    name="name"
                                    placeholder="e.g., Acme Corp"
                                    required
                                    icon={Building2}
                                />
                                <InputField
                                    label="Slug"
                                    name="slug"
                                    placeholder="e.g., acme-corp"
                                    icon={Hash}
                                />
                                <InputField
                                    label="Website"
                                    name="website"
                                    placeholder="https://acme.com"
                                    icon={Globe}
                                />
                                <InputField
                                    label="Domain"
                                    name="domain"
                                    placeholder="acme.com"
                                    icon={Link}
                                />
                            </div>
                        </div>

                        {/* Company Details */}
                        <div>
                            <h3 className="text-sm font-medium text-gray-700 mb-4 flex items-center gap-2">
                                <Users className="w-4 h-4" />
                                Company Details
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <SelectField
                                    label="Industry"
                                    name="industry_id"
                                    options={industries.map(i => ({ value: i.id, label: i.name }))}
                                    placeholder="Select industry"
                                    icon={Briefcase}
                                />
                                <SelectField
                                    label="Company Size"
                                    name="company_size"
                                    options={sizeOptions}
                                    placeholder="Select size"
                                    icon={Users}
                                />
                                <SelectField
                                    label="Status"
                                    name="status"
                                    options={statusOptions}
                                    placeholder="Select status"
                                />
                                <SelectField
                                    label="Source"
                                    name="source_id"
                                    options={sources.map(s => ({ value: s.id, label: s.name }))}
                                    placeholder="How did you find this company?"
                                />
                            </div>
                        </div>

                        {/* Contact Information */}
                        <div>
                            <h3 className="text-sm font-medium text-gray-700 mb-4 flex items-center gap-2">
                                <Mail className="w-4 h-4" />
                                Contact Information
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <InputField
                                    label="Email"
                                    name="email"
                                    type="email"
                                    placeholder="contact@acme.com"
                                    icon={Mail}
                                />
                                <InputField
                                    label="Phone"
                                    name="phone"
                                    placeholder="+1 (555) 123-4567"
                                    icon={Phone}
                                />
                            </div>
                        </div>

                        {/* Address */}
                        <div>
                            <h3 className="text-sm font-medium text-gray-700 mb-4 flex items-center gap-2">
                                <MapPin className="w-4 h-4" />
                                Address
                            </h3>
                            <div className="space-y-4">
                                <InputField
                                    label="Address Line 1"
                                    name="address_line1"
                                    placeholder="123 Main Street"
                                />
                                <InputField
                                    label="Address Line 2"
                                    name="address_line2"
                                    placeholder="Suite 100"
                                />
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <InputField
                                        label="City"
                                        name="city"
                                        placeholder="New York"
                                    />
                                    <InputField
                                        label="State/Province"
                                        name="state"
                                        placeholder="NY"
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <InputField
                                        label="Country"
                                        name="country"
                                        placeholder="United States"
                                    />
                                    <InputField
                                        label="Postal Code"
                                        name="postal_code"
                                        placeholder="10001"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Additional Information */}
                        <div>
                            <h3 className="text-sm font-medium text-gray-700 mb-4">
                                Additional Information
                            </h3>
                            <div className="space-y-4">
                                <SelectField
                                    label="Owner"
                                    name="owner_id"
                                    options={owners.map(o => ({ value: o.id, label: o.full_name }))}
                                    placeholder="Assign an owner"
                                />
                                <TextAreaField
                                    label="Description"
                                    name="description"
                                    placeholder="Brief description of the company..."
                                    rows={3}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between pt-6 mt-6 border-t border-gray-200">
                        <div>
                            {mode === 'edit' && onDelete && (
                                <button
                                    type="button"
                                    onClick={onDelete}
                                    className="inline-flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    Delete Company
                                </button>
                            )}
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={onCancel}
                                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors text-sm font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="inline-flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-lg hover:opacity-90 transition-opacity text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                            >
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