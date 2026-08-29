/* eslint-disable no-useless-escape */
/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-hooks/static-components */
import  { useState, useEffect } from 'react';
import {
  X,
  User,
  Mail,
  Phone,
  Briefcase,
  Building2,
  MapPin,
  Save,
  Trash2,
  Users,
//   Linkedin,
  MessageCircle,
  Shield,
} from 'lucide-react';

const ContactsForm = ({
  mode = 'create',
  contact = null,
  onSave,
  onCancel,
  onDelete,
  loading = false,
  companies = [],
  owners = []
}) => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    whatsapp_phone: '',
    job_title: '',
    department: '',
    company_id: '',
    linkedin_url: '',
    is_decision_maker: false,
    consent_status: 'unknown',
    consent_at: null,
    notes: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    country: '',
    postal_code: '',
    owner_id: '',
    avatar_url: ''
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  useEffect(() => {
    if (mode === 'edit' && contact) {
      setFormData({
        first_name: contact.first_name || '',
        last_name: contact.last_name || '',
        email: contact.email || '',
        phone: contact.phone || '',
        whatsapp_phone: contact.whatsapp_phone || '',
        job_title: contact.job_title || '',
        department: contact.department || '',
        company_id: contact.company_id || '',
        linkedin_url: contact.linkedin_url || '',
        is_decision_maker: contact.is_decision_maker || false,
        consent_status: contact.consent_status || 'unknown',
        consent_at: contact.consent_at || null,
        notes: contact.notes || '',
        address_line1: contact.address_line1 || '',
        address_line2: contact.address_line2 || '',
        city: contact.city || '',
        state: contact.state || '',
        country: contact.country || '',
        postal_code: contact.postal_code || '',
        owner_id: contact.owner_id || '',
        avatar_url: contact.avatar_url || ''
      });
    }
  }, [mode, contact]);

  const validateField = (name, value) => {
    switch (name) {
      case 'first_name':
        if (!value || value.trim().length < 2) {
          return 'First name is required and must be at least 2 characters';
        }
        return '';
      case 'last_name':
        if (!value || value.trim().length < 2) {
          return 'Last name is required and must be at least 2 characters';
        }
        return '';
      case 'email':
        if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          return 'Please enter a valid email address';
        }
        return '';
      case 'phone':
        if (value && !/^[\+\d\s\-\(\)]{10,}$/.test(value.replace(/\s/g, ''))) {
          return 'Please enter a valid phone number';
        }
        return '';
      case 'whatsapp_phone':
        if (value && !/^[\+\d\s\-\(\)]{10,}$/.test(value.replace(/\s/g, ''))) {
          return 'Please enter a valid WhatsApp number';
        }
        return '';
      case 'linkedin_url':
        if (value && !/^https?:\/\/(www\.)?linkedin\.com\/.*/.test(value)) {
          return 'Please enter a valid LinkedIn URL';
        }
        return '';
      default:
        return '';
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;
    setFormData(prev => ({ ...prev, [name]: val }));
    const error = validateField(name, val);
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

    const requiredFields = ['first_name', 'last_name'];
    requiredFields.forEach(field => {
      if (!formData[field] || !formData[field].trim()) {
        newErrors[field] = `${field.replace('_', ' ').charAt(0).toUpperCase() + field.replace('_', ' ').slice(1)} is required`;
        isValid = false;
      }
    });

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

  const consentOptions = [
    { value: 'opted_in', label: 'Opted In' },
    { value: 'opted_out', label: 'Opted Out' },
    { value: 'unknown', label: 'Unknown' }
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
            className={`w-full ${Icon ? 'pl-9' : 'pl-3'} pr-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-shadow ${
              error ? 'border-red-300 bg-red-50' : 'border-gray-300'
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
            className={`w-full ${Icon ? 'pl-9' : 'pl-3'} pr-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-shadow appearance-none bg-white ${
              error ? 'border-red-300 bg-red-50' : 'border-gray-300'
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
          className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-shadow resize-y ${
            error ? 'border-red-300 bg-red-50' : 'border-gray-300'
          }`}
          {...props}
        />
        {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
      </div>
    );
  };

  const CheckboxField = ({ label, name, ...props }) => {
    return (
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          name={name}
          checked={formData[name] || false}
          onChange={handleChange}
          className="w-4 h-4 rounded border-gray-300 text-cyan-600 focus:ring-cyan-500"
          {...props}
        />
        <label className="text-sm text-gray-700">{label}</label>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
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
                {mode === 'create' ? 'Create a new contact record' : `Editing ${contact?.first_name || ''} ${contact?.last_name || ''}`}
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
            {/* Personal Information */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-4 flex items-center gap-2">
                <User className="w-4 h-4" />
                Personal Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField
                  label="First Name"
                  name="first_name"
                  placeholder="John"
                  required
                  icon={User}
                />
                <InputField
                  label="Last Name"
                  name="last_name"
                  placeholder="Doe"
                  required
                  icon={User}
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
                  placeholder="john.doe@company.com"
                  icon={Mail}
                />
                <InputField
                  label="Phone"
                  name="phone"
                  placeholder="+1 (555) 123-4567"
                  icon={Phone}
                />
                <InputField
                  label="WhatsApp Number"
                  name="whatsapp_phone"
                  placeholder="+1 (555) 123-4567"
                  icon={MessageCircle}
                />
                <InputField
                  label="LinkedIn URL"
                  name="linkedin_url"
                  placeholder="https://linkedin.com/in/johndoe"
                //   icon={Linkedin}
                />
              </div>
            </div>

            {/* Professional Information */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-4 flex items-center gap-2">
                <Briefcase className="w-4 h-4" />
                Professional Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <SelectField
                  label="Company"
                  name="company_id"
                  options={companies.map(c => ({ value: c.id, label: c.name }))}
                  placeholder="Select company"
                  icon={Building2}
                />
                <InputField
                  label="Job Title"
                  name="job_title"
                  placeholder="Software Engineer"
                  icon={Briefcase}
                />
                <InputField
                  label="Department"
                  name="department"
                  placeholder="Engineering"
                  icon={Users}
                />
                <div className="space-y-4">
                  <CheckboxField
                    label="Decision Maker"
                    name="is_decision_maker"
                  />
                </div>
              </div>
            </div>

            {/* Consent & Privacy */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-4 flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Consent & Privacy
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <SelectField
                  label="Consent Status"
                  name="consent_status"
                  options={consentOptions}
                  placeholder="Select consent status"
                  icon={Shield}
                />
                <InputField
                  label="Consent Date"
                  name="consent_at"
                  type="date"
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
                  label="Notes"
                  name="notes"
                  placeholder="Additional notes about this contact..."
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
                  Delete Contact
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
                {loading ? 'Saving...' : mode === 'create' ? 'Create Contact' : 'Update Contact'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ContactsForm;