import { useState, useCallback } from 'react';
import { X, User, Building2, Calendar, Clock, Save, Trash2, Phone, Mail, Calendar as CalIcon, CheckSquare, FileText } from 'lucide-react';

const activityTypeOptions = [
    { value: 'call', label: 'Call', icon: Phone, color: 'bg-green-500' },
    { value: 'meeting', label: 'Meeting', icon: CalIcon, color: 'bg-blue-500' },
    { value: 'email', label: 'Email', icon: Mail, color: 'bg-purple-500' },
    { value: 'task', label: 'Task', icon: CheckSquare, color: 'bg-amber-500' },
    { value: 'note', label: 'Note', icon: FileText, color: 'bg-gray-500' },
];

const activityStatusOptions = [
    { value: 'scheduled', label: 'Scheduled' },
    { value: 'completed', label: 'Completed' },
    { value: 'pending', label: 'Pending' },
    { value: 'cancelled', label: 'Cancelled' },
];

const priorityOptions = [
    { value: 'high', label: 'High' },
    { value: 'medium', label: 'Medium' },
    { value: 'low', label: 'Low' },
];

const ownerOptions = [
    { value: 'Ahmed Khan', label: 'Ahmed Khan' },
    { value: 'Sarah Ahmed', label: 'Sarah Ahmed' },
    { value: 'Muhammad Ali', label: 'Muhammad Ali' },
    { value: 'Fatima Hassan', label: 'Fatima Hassan' },
    { value: 'Usman Tariq', label: 'Usman Tariq' },
];

const relatedToOptions = [
    { value: 'lead', label: 'Lead' },
    { value: 'deal', label: 'Deal' },
    { value: 'company', label: 'Company' },
    { value: 'contact', label: 'Contact' },
    { value: 'none', label: 'None (General)' },
];

const emptyFormData = {
    title: '',
    type: 'task',
    status: 'scheduled',
    priority: 'medium',
    related_to: 'none',
    related_id: '',
    related_name: '',
    contact: '',
    company: '',
    scheduled_at: new Date().toISOString().slice(0, 16),
    completed_at: '',
    duration: 0,
    notes: '',
    outcome: '',
    next_action: '',
    next_action_date: '',
    owner: 'Ahmed Khan',
};

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
                className={`w-full ${Icon ? 'pl-9' : 'pl-3'} pr-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-shadow ${error ? 'border-red-300 bg-red-50' : 'border-gray-300'}`}
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
                className={`w-full ${Icon ? 'pl-9' : 'pl-3'} pr-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none appearance-none bg-white ${error ? 'border-red-300 bg-red-50' : 'border-gray-300'}`}
                {...props}
            >
                <option value="">{placeholder}</option>
                {options.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
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
            className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-shadow resize-y ${error ? 'border-red-300 bg-red-50' : 'border-gray-300'}`}
        />
        {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
);

const ActivityForm = ({
    mode = 'create',
    activity = null,
    onSave,
    onCancel,
    onDelete,
    loading = false,
}) => {
    const [formData, setFormData] = useState(() => {
        if (mode === 'edit' && activity) {
            return {
                title: activity.title || '',
                type: activity.type || 'task',
                status: activity.status || 'scheduled',
                priority: activity.priority || 'medium',
                related_to: activity.related_to || 'none',
                related_id: activity.related_id || '',
                related_name: activity.related_name || '',
                contact: activity.contact || '',
                company: activity.company || '',
                scheduled_at: activity.scheduled_at ? activity.scheduled_at.slice(0, 16) : new Date().toISOString().slice(0, 16),
                completed_at: activity.completed_at ? activity.completed_at.slice(0, 16) : '',
                duration: activity.duration || 0,
                notes: activity.notes || '',
                outcome: activity.outcome || '',
                next_action: activity.next_action || '',
                next_action_date: activity.next_action_date || '',
                owner: activity.owner || 'Ahmed Khan',
            };
        }
        return emptyFormData;
    });
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});

    const validateField = useCallback((name, value) => {
        switch (name) {
            case 'title':
                return (!value || value.trim().length < 2) ? 'Title is required (min 2 characters)' : '';
            case 'scheduled_at':
                return (!value) ? 'Scheduled date/time is required' : '';
            case 'duration':
                return (value && (isNaN(value) || parseInt(value) < 0)) ? 'Duration must be a positive number' : '';
            case 'next_action_date':
                return (value && new Date(value) < new Date()) ? 'Next action date cannot be in the past' : '';
            default:
                return '';
        }
    }, []);

    const handleChange = useCallback((e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        const error = validateField(name, value);
        setErrors(prev => ({ ...prev, [name]: error }));
        
        // Auto-set completed_at when status changes to completed
        if (name === 'status' && value === 'completed') {
            setFormData(prev => {
                if (!prev.completed_at) {
                    return { ...prev, completed_at: new Date().toISOString().slice(0, 16) };
                }
                return prev;
            });
        }
    }, [validateField]);

    const handleBlur = useCallback((e) => {
        const { name } = e.target;
        setTouched(prev => ({ ...prev, [name]: true }));
        const error = validateField(name, formData[name]);
        setErrors(prev => ({ ...prev, [name]: error }));
    }, [validateField, formData]);

    const validateForm = useCallback(() => {
        const newErrors = {};
        let isValid = true;
        Object.keys(formData).forEach(key => {
            const error = validateField(key, formData[key]);
            if (error) { newErrors[key] = error; isValid = false; }
        });
        setErrors(newErrors);
        return isValid;
    }, [formData, validateField]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validateForm()) {
            const submitData = { ...formData };
            Object.keys(submitData).forEach(key => {
                if (submitData[key] === '' || submitData[key] === null) delete submitData[key];
            });
            submitData.duration = parseInt(submitData.duration) || 0;
            onSave(submitData);
        }
    };

    const getFieldError = (name) => touched[name] && errors[name] ? errors[name] : '';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-lg">
                            <Clock className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900">{mode === 'create' ? 'Add New Activity' : 'Edit Activity'}</h2>
                            <p className="text-sm text-gray-500">{mode === 'create' ? 'Schedule a call, meeting, task, or note' : `Editing ${activity?.title || 'activity'}`}</p>
                        </div>
                    </div>
                    <button onClick={onCancel} className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
                </div>

                <form onSubmit={handleSubmit} className="overflow-y-auto p-6" style={{ maxHeight: 'calc(90vh - 140px)' }}>
                    <div className="space-y-6">
                        {/* Basic Information */}
                        <div>
                            <h3 className="text-sm font-medium text-gray-700 mb-4 flex items-center gap-2"><Clock className="w-4 h-4" /> Activity Details</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <InputField
                                    label="Title"
                                    name="title"
                                    placeholder="e.g. Discovery Call with Client"
                                    required
                                    icon={Clock}
                                    value={formData.title}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    error={getFieldError('title')}
                                />
                                <SelectField
                                    label="Type"
                                    name="type"
                                    options={activityTypeOptions}
                                    placeholder="Select type"
                                    required
                                    icon={Phone}
                                    value={formData.type}
                                    onChange={handleChange}
                                    error={getFieldError('type')}
                                />
                                <SelectField
                                    label="Status"
                                    name="status"
                                    options={activityStatusOptions}
                                    placeholder="Select status"
                                    required
                                    value={formData.status}
                                    onChange={handleChange}
                                    error={getFieldError('status')}
                                />
                                <SelectField
                                    label="Priority"
                                    name="priority"
                                    options={priorityOptions}
                                    placeholder="Select priority"
                                    required
                                    value={formData.priority}
                                    onChange={handleChange}
                                    error={getFieldError('priority')}
                                />
                            </div>
                        </div>

                        {/* Related To */}
                        <div>
                            <h3 className="text-sm font-medium text-gray-700 mb-4 flex items-center gap-2"><Building2 className="w-4 h-4" /> Related To</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <SelectField
                                    label="Related To"
                                    name="related_to"
                                    options={relatedToOptions}
                                    placeholder="Select entity type"
                                    value={formData.related_to}
                                    onChange={handleChange}
                                    error={getFieldError('related_to')}
                                />
                                <InputField
                                    label="Related ID"
                                    name="related_id"
                                    placeholder="e.g. lead-001, deal-002"
                                    icon={User}
                                    value={formData.related_id}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    error={getFieldError('related_id')}
                                />
                                <InputField
                                    label="Related Name"
                                    name="related_name"
                                    placeholder="e.g. Website Redesign Project"
                                    icon={Building2}
                                    value={formData.related_name}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    error={getFieldError('related_name')}
                                />
                            </div>
                        </div>

                        {/* Contact & Company */}
                        <div>
                            <h3 className="text-sm font-medium text-gray-700 mb-4 flex items-center gap-2"><User className="w-4 h-4" /> Contact & Company</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <InputField
                                    label="Contact"
                                    name="contact"
                                    placeholder="Contact person"
                                    icon={User}
                                    value={formData.contact}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    error={getFieldError('contact')}
                                />
                                <InputField
                                    label="Company"
                                    name="company"
                                    placeholder="Company name"
                                    icon={Building2}
                                    value={formData.company}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    error={getFieldError('company')}
                                />
                                <SelectField
                                    label="Owner"
                                    name="owner"
                                    options={ownerOptions}
                                    placeholder="Assign owner"
                                    required
                                    icon={User}
                                    value={formData.owner}
                                    onChange={handleChange}
                                    error={getFieldError('owner')}
                                />
                            </div>
                        </div>

                        {/* Scheduling */}
                        <div>
                            <h3 className="text-sm font-medium text-gray-700 mb-4 flex items-center gap-2"><Calendar className="w-4 h-4" /> Scheduling</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <InputField
                                    label="Scheduled At"
                                    name="scheduled_at"
                                    type="datetime-local"
                                    required
                                    icon={Calendar}
                                    value={formData.scheduled_at}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    error={getFieldError('scheduled_at')}
                                />
                                <InputField
                                    label="Completed At"
                                    name="completed_at"
                                    type="datetime-local"
                                    icon={Calendar}
                                    value={formData.completed_at}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    error={getFieldError('completed_at')}
                                />
                                <InputField
                                    label="Duration (minutes)"
                                    name="duration"
                                    type="number"
                                    placeholder="0"
                                    min="0"
                                    icon={Clock}
                                    value={formData.duration}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    error={getFieldError('duration')}
                                />
                                <InputField
                                    label="Next Action Date"
                                    name="next_action_date"
                                    type="date"
                                    icon={Calendar}
                                    value={formData.next_action_date}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    error={getFieldError('next_action_date')}
                                />
                            </div>
                        </div>

                        {/* Notes & Outcomes */}
                        <div>
                            <h3 className="text-sm font-medium text-gray-700 mb-4">Notes & Outcomes</h3>
                            <div className="space-y-4">
                                <TextAreaField
                                    label="Notes"
                                    name="notes"
                                    placeholder="Details, discussion points, requirements..."
                                    rows={3}
                                    value={formData.notes}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    error={getFieldError('notes')}
                                />
                                <InputField
                                    label="Outcome"
                                    name="outcome"
                                    placeholder="e.g. qualified, sent, negotiated, lost"
                                    icon={FileText}
                                    value={formData.outcome}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    error={getFieldError('outcome')}
                                />
                                <InputField
                                    label="Next Action"
                                    name="next_action"
                                    placeholder="e.g. Send proposal, Follow up call"
                                    icon={Clock}
                                    value={formData.next_action}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    error={getFieldError('next_action')}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between pt-6 mt-6 border-t border-gray-200">
                        <div>
                            {mode === 'edit' && onDelete && (
                                <button type="button" onClick={onDelete} className="inline-flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium">
                                    <Trash2 className="w-4 h-4" /> Delete Activity
                                </button>
                            )}
                        </div>
                        <div className="flex items-center gap-3">
                            <button type="button" onClick={onCancel} className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors text-sm font-medium">Cancel</button>
                            <button type="submit" disabled={loading} className="inline-flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-lg hover:opacity-90 transition-opacity text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed">
                                <Save className="w-4 h-4" /> {loading ? 'Saving...' : mode === 'create' ? 'Create Activity' : 'Update Activity'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ActivityForm;