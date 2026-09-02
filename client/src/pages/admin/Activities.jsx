import { useState, useEffect, useMemo } from 'react';
import { Plus, Search, Filter, X, Calendar, List, ChevronLeft, ChevronRight, MoreVertical, Phone, Mail, Calendar as CalIcon, CheckSquare, FileText } from 'lucide-react';
import ActivityForm from '../../components/AdminLayout/activities/ActivityForm';
import { activities as initialActivities, activityTypes, activityStatuses } from '../../data/ActivitiesData';

const Activities = () => {
    const [activities, setActivities] = useState(initialActivities);
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [filters, setFilters] = useState({
        type: 'all',
        status: 'all',
        priority: 'all',
    });
    const [viewMode, setViewMode] = useState('list');
    const [showFilters, setShowFilters] = useState(false);
    const [modalState, setModalState] = useState({
        isOpen: false,
        mode: 'create',
        activity: null
    });
    const [formLoading, setFormLoading] = useState(false);
    const [currentDate, setCurrentDate] = useState(new Date());

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    // Get unique priorities
    const priorities = useMemo(() => {
        const set = new Set(activities.map(a => a.priority).filter(Boolean));
        return Array.from(set).sort();
    }, [activities]);

    // Filter activities
    const filteredActivities = useMemo(() => {
        let result = [...activities];
        const search = debouncedSearch.toLowerCase();

        if (search) {
            result = result.filter(act =>
                act.title.toLowerCase().includes(search) ||
                act.contact?.toLowerCase().includes(search) ||
                act.company?.toLowerCase().includes(search) ||
                act.notes?.toLowerCase().includes(search)
            );
        }

        if (filters.type !== 'all') {
            result = result.filter(act => act.type === filters.type);
        }
        if (filters.status !== 'all') {
            result = result.filter(act => act.status === filters.status);
        }
        if (filters.priority !== 'all') {
            result = result.filter(act => act.priority === filters.priority);
        }

        // Sort by scheduled date
        result.sort((a, b) => new Date(a.scheduled_at) - new Date(b.scheduled_at));
        return result;
    }, [activities, debouncedSearch, filters]);

    // Calendar view - group by date
    const activitiesByDate = useMemo(() => {
        const grouped = {};
        filteredActivities.forEach(act => {
            const date = new Date(act.scheduled_at).toDateString();
            if (!grouped[date]) grouped[date] = [];
            grouped[date].push(act);
        });
        return grouped;
    }, [filteredActivities]);

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const clearFilters = () => {
        setFilters({ type: 'all', status: 'all', priority: 'all' });
        setSearchTerm('');
    };

    const hasActiveFilters = () => {
        return filters.type !== 'all' || filters.status !== 'all' || filters.priority !== 'all' || searchTerm !== '';
    };

    const openCreateModal = () => {
        setModalState({ isOpen: true, mode: 'create', activity: null });
    };

    const handleSave = async (data) => {
        setFormLoading(true);
        try {
            console.log('Saving activity:', data);
            await new Promise(resolve => setTimeout(resolve, 500));
            
            if (modalState.mode === 'create') {
                const newActivity = {
                    ...data,
                    id: `act-${crypto.randomUUID()}`,
                    created_at: new Date().toISOString(),
                };
                setActivities(prev => [newActivity, ...prev]);
            } else {
                setActivities(prev =>
                    prev.map(a =>
                        a.id === modalState.activity.id
                            ? { ...a, ...data, updated_at: new Date().toISOString() }
                            : a
                    )
                );
            }
            closeModal();
        } catch (error) {
            console.error('Error saving activity:', error);
        } finally {
            setFormLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm('Delete this activity?')) return;
        setFormLoading(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 300));
            setActivities(prev => prev.filter(a => a.id !== modalState.activity.id));
            closeModal();
        } catch (error) {
            console.error('Error deleting activity:', error);
        } finally {
            setFormLoading(false);
        }
    };

    const closeModal = () => {
        setModalState({ isOpen: false, mode: 'create', activity: null });
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const formatTime = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    };

    const getTypeConfig = (type) => activityTypes.find(t => t.id === type) || activityTypes[0];
    const getStatusConfig = (status) => activityStatuses.find(s => s.id === status) || activityStatuses[0];

    const today = new Date().toDateString();
    const isOverdue = (dateString, status) => status !== 'completed' && new Date(dateString) < new Date();

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Activities</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage calls, meetings, tasks, and follow-ups</p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setViewMode('list')}
                        className={`p-2 rounded-lg transition ${viewMode === 'list' ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                    >
                        <List className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => setViewMode('calendar')}
                        className={`p-2 rounded-lg transition ${viewMode === 'calendar' ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                    >
                        <Calendar className="w-5 h-5" />
                    </button>
                    <button
                        onClick={openCreateModal}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-lg hover:opacity-90 transition-opacity shadow-sm"
                    >
                        <Plus className="w-4 h-4" />
                        Add Activity
                    </button>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search activities by title, contact, company, notes..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-shadow text-sm"
                    />
                    {searchTerm && (
                        <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>

                <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`inline-flex items-center gap-2 px-4 py-2 border rounded-lg text-sm font-medium transition-colors ${showFilters || hasActiveFilters()
                        ? 'border-cyan-500 text-cyan-600 bg-cyan-50'
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                >
                    <Filter className="w-4 h-4" />
                    Filters
                    {hasActiveFilters() && (
                        <span className="w-5 h-5 bg-cyan-600 text-white rounded-full text-xs flex items-center justify-center">
                            {(filters.type !== 'all' ? 1 : 0) + (filters.status !== 'all' ? 1 : 0) + (filters.priority !== 'all' ? 1 : 0) + (searchTerm ? 1 : 0)}
                        </span>
                    )}
                </button>

                {hasActiveFilters() && (
                    <button onClick={clearFilters} className="inline-flex items-center gap-1 px-3 py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors">
                        <X className="w-4 h-4" />
                        Clear all
                    </button>
                )}
            </div>

            {/* Filter Panel */}
            {showFilters && (
                <div className="bg-white border border-gray-200 rounded-lg p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Type</label>
                        <select value={filters.type} onChange={(e) => handleFilterChange('type', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none">
                            <option value="all">All Types</option>
                            {activityTypes.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Status</label>
                        <select value={filters.status} onChange={(e) => handleFilterChange('status', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none">
                            <option value="all">All Statuses</option>
                            {activityStatuses.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Priority</label>
                        <select value={filters.priority} onChange={(e) => handleFilterChange('priority', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none">
                            <option value="all">All Priorities</option>
                            {priorities.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
                        </select>
                    </div>
                </div>
            )}

            {/* List View */}
            {viewMode === 'list' && (
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <table className="w-full min-w-[1000px]">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Activity</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Related To</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date / Time</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Owner</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-[80px]">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {filteredActivities.length > 0 ? (
                                filteredActivities.map((act) => {
                                    const typeConfig = getTypeConfig(act.type);
                                    const statusConfig = getStatusConfig(act.status);
                                    const overdue = isOverdue(act.scheduled_at, act.status);
                                    return (
                                        <tr key={act.id} className={`hover:bg-gray-50 ${overdue && act.status !== 'completed' ? 'bg-red-50' : ''}`}>
                                            <td className="px-4 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${typeConfig.color}/10`}>
                                                        {(() => {
                                                            switch (typeConfig.icon) {
                                                                case 'Phone': return <Phone className={`w-5 h-5 ${typeConfig.color}`} />;
                                                                case 'Mail': return <Mail className={`w-5 h-5 ${typeConfig.color}`} />;
                                                                case 'Calendar': return <CalIcon className={`w-5 h-5 ${typeConfig.color}`} />;
                                                                case 'CheckSquare': return <CheckSquare className={`w-5 h-5 ${typeConfig.color}`} />;
                                                                default: return <FileText className={`w-5 h-5 ${typeConfig.color}`} />;
                                                            }
                                                        })()}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-900 truncate max-w-xs">{act.title}</p>
                                                        <p className="text-xs text-gray-500">{act.contact} • {act.company}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${typeConfig.color}/10 text-${typeConfig.color.replace('bg-', '').replace('-500', '-700')}`}>
                                                    {typeConfig.label}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4">
                                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusConfig.color}/10 text-${statusConfig.color.replace('bg-', '').replace('-500', '-700')}`}>
                                                    {statusConfig.label}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4">
                                                <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${act.priority === 'high' ? 'bg-red-50 text-red-700' : act.priority === 'medium' ? 'bg-amber-50 text-amber-700' : 'bg-gray-50 text-gray-700'}`}>
                                                    {act.priority}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 text-sm text-gray-600">
                                                {act.related_name || '-'}
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className={`${overdue && act.status !== 'completed' ? 'text-red-600 font-medium' : 'text-sm text-gray-700'}`}>
                                                    {formatDate(act.scheduled_at)}
                                                </div>
                                                <div className="text-xs text-gray-500">{formatTime(act.scheduled_at)}</div>
                                            </td>
                                            <td className="px-4 py-4 text-sm text-gray-700">{act.owner}</td>
                                            <td className="px-4 py-4 text-right">
                                                <div className="relative">
                                                    <button onClick={(e) => { e.stopPropagation(); }} className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-700"><MoreVertical className="w-5 h-5" /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan="8" className="px-4 py-12 text-center">
                                        <p className="font-medium text-gray-600">No activities found</p>
                                        <p className="mt-1 text-sm text-gray-400">Try changing your search or filters.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Calendar View */}
            {viewMode === 'calendar' && (
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    {/* Calendar Header */}
                    <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button onClick={() => setCurrentDate(d => { const nd = new Date(d); nd.setMonth(nd.getMonth() - 1); return nd; })} className="p-2 rounded hover:bg-gray-100"><ChevronLeft className="w-5 h-5" /></button>
                            <h2 className="text-lg font-semibold text-gray-900">{currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</h2>
                            <button onClick={() => setCurrentDate(d => { const nd = new Date(d); nd.setMonth(nd.getMonth() + 1); return nd; })} className="p-2 rounded hover:bg-gray-100"><ChevronRight className="w-5 h-5" /></button>
                        </div>
                        <button onClick={() => setCurrentDate(new Date())} className="text-sm text-cyan-600 hover:text-cyan-700">Today</button>
                    </div>

                    {/* Calendar Grid */}
                    <div className="p-4">
                        <div className="grid grid-cols-7 gap-1 mb-2">
                            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                                <div key={d} className="text-center text-xs font-medium text-gray-500 py-2">{d}</div>
                            ))}
                        </div>
                        <div className="grid grid-cols-7 gap-1">
                            {(() => {
                                const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
                                const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
                                const days = [];
                                for (let i = 0; i < firstDay; i++) days.push(<div key={`empty-${i}`} className="aspect-square bg-gray-50 rounded-lg" />);
                                for (let d = 1; d <= daysInMonth; d++) {
                                    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), d);
                                    const dateStr = date.toDateString();
                                    const dayActivities = activitiesByDate[dateStr] || [];
                                    const isTodayDate = dateStr === today;
                                    days.push(
                                        <div key={d} className={`relative aspect-square rounded-lg border ${isTodayDate ? 'border-cyan-500 bg-cyan-50' : 'border-gray-100'} hover:bg-gray-50 transition p-1 overflow-hidden`}>
                                            <div className={`text-sm font-medium ${isTodayDate ? 'text-cyan-600' : 'text-gray-700'}`}>{d}</div>
                                            <div className="mt-1 space-y-1 overflow-hidden">
                                                {dayActivities.slice(0, 3).map(act => (
                                                    <div key={act.id} className="text-xs px-1 py-0.5 rounded truncate bg-gray-100 hover:bg-gray-200" title={act.title}>
                                                        {act.title}
                                                    </div>
                                                ))}
                                                {dayActivities.length > 3 && (
                                                    <div className="text-xs text-gray-500 text-center">+{dayActivities.length - 3} more</div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                }
                                return days;
                            })()}
                        </div>
                    </div>
                </div>
            )}

            {/* Activity Form Modal */}
            {modalState.isOpen && (
                <ActivityForm
                    mode={modalState.mode}
                    activity={modalState.activity}
                    onSave={handleSave}
                    onCancel={closeModal}
                    onDelete={handleDelete}
                    loading={formLoading}
                    activityTypes={activityTypes}
                    activityStatuses={activityStatuses}
                />
            )}
        </div>
    );
};

export default Activities;