import { useState, useEffect } from 'react';
import { Plus, Search, Filter, X, Users, Download, Building2, CheckCircle, FileText } from 'lucide-react';
import ContactsTable from '../../components/AdminLayout/contact/ContactTable';
import ContactsForm from '../../components/AdminLayout/contact/ContactForm';
import { useContacts } from '../../store/hooks';

const Contacts = () => {
    const {
        contacts,
        loading,
        error,
        pagination,
        filters,
        sort,
        fetchContacts,
        fetchContact,
        createContact,
        updateContact,
        deleteContact,
        setFilters,
        setSort,
        setPage,
        clearError,
    } = useContacts();

    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [modalState, setModalState] = useState({
        isOpen: false,
        mode: 'create',
        contact: null
    });
    const [formLoading, setFormLoading] = useState(false);
    const [stats, setStats] = useState({
        total: 0,
        decisionMakers: 0,
        withCompanies: 0,
        optedIn: 0,
        withoutCompanies: 0,
    });

    useEffect(() => {
        fetchContacts();
    }, []);

    useEffect(() => {
        fetchContacts({ page: pagination.page, ...filters, sort: `${sort.field}:${sort.direction}` });
    }, [pagination.page, filters, sort]);

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleFilterChange = (key, value) => {
        setFilters({ ...filters, [key]: value });
        setPage(1);
    };

    const clearFilters = () => {
        setFilters({ status: 'all', company_id: 'all', is_decision_maker: 'all', consent_status: 'all' });
        setSearchTerm('');
        setPage(1);
    };

    const hasActiveFilters = () => {
        return filters.status !== 'all' ||
            filters.company_id !== 'all' ||
            filters.is_decision_maker !== 'all' ||
            filters.consent_status !== 'all' ||
            searchTerm !== '';
    };

    const openCreateModal = () => {
        setModalState({
            isOpen: true,
            mode: 'create',
            contact: null
        });
    };

    const openEditModal = (contact) => {
        setModalState({
            isOpen: true,
            mode: 'edit',
            contact
        });
    };

    const handleSave = async (data) => {
        setFormLoading(true);
        try {
            if (modalState.mode === 'create') {
                await createContact(data);
            } else {
                await updateContact(modalState.contact.id, data);
            }
            closeModal();
        } catch (error) {
            console.error('Save error:', error);
        } finally {
            setFormLoading(false);
        }
    };

    const handleDelete = async (contact) => {
        if (!confirm('Are you sure you want to delete this contact?')) return;
        setFormLoading(true);
        try {
            await deleteContact(contact.id);
            closeModal();
        } catch (error) {
            console.error('Delete error:', error);
        } finally {
            setFormLoading(false);
        }
    };

    const closeModal = () => {
        setModalState({
            isOpen: false,
            mode: 'create',
            contact: null
        });
    };

    const handleExport = () => {
        // Use the full contacts list from store (will be filtered on backend)
        const headers = [
            'First Name', 'Last Name', 'Email', 'Phone', 'Mobile', 'Title',
            'Company', 'Decision Maker', 'Status', 'Consent Status', 'Source', 'Owner', 'Created At'
        ];
        
        const rows = contacts.map(c => [
            c.first_name,
            c.last_name,
            c.email,
            c.phone || '',
            c.mobile || '',
            c.title || '',
            c.company?.name || '',
            c.is_decision_maker ? 'Yes' : 'No',
            c.status,
            c.consent_status,
            c.source || '',
            c.owner?.name || '',
            c.created_at ? new Date(c.created_at).toLocaleDateString() : ''
        ]);
        
        const csvContent = [headers, ...rows]
            .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
            .join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `contacts-${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
    };

    // Get unique companies for filter dropdown
    const companies = Array.from(new Set(contacts.map(c => c.company).filter(Boolean)));

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Contacts</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Manage your contacts and track relationships
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleExport}
                        className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                    >
                        <Download className="w-4 h-4" />
                        Export
                    </button>
                    <button
                        onClick={() => setModalState({ isOpen: true, mode: 'create', contact: null })}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-lg hover:opacity-90 transition-opacity shadow-sm"
                    >
                        <Plus className="w-4 h-4" />
                        Add Contact
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                            <Users className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-600">Total Contacts</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.total || contacts.length}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-purple-50 text-purple-600">
                            <Users className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-600">Decision Makers</p>
                            <p className="text-2xl font-bold text-gray-900">{contacts.filter(c => c.is_decision_maker).length}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
                            <Building2 className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-600">With Companies</p>
                            <p className="text-2xl font-bold text-gray-900">{contacts.filter(c => c.company).length}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-green-50 text-green-600">
                            <CheckCircle className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-600">Opted In</p>
                            <p className="text-2xl font-bold text-gray-900">{contacts.filter(c => c.consent_status === 'opted_in').length}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-gray-50 text-gray-600">
                            <Building2 className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-600">No Company</p>
                            <p className="text-2xl font-bold text-gray-900">{contacts.filter(c => !c.company).length}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search contacts by name, email, job title, or company..."
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
                            {(filters.status !== 'all' ? 1 : 0) + (filters.company_id !== 'all' ? 1 : 0) + (filters.is_decision_maker !== 'all' ? 1 : 0) + (filters.consent_status !== 'all' ? 1 : 0) + (searchTerm ? 1 : 0)}
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
                <div className="bg-white border border-gray-200 rounded-lg p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Status</label>
                        <select
                            value={filters.status || 'all'}
                            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none"
                        >
                            <option value="all">All Statuses</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                            <option value="pending">Pending</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Company</label>
                        <select
                            value={filters.company_id || 'all'}
                            onChange={(e) => setFilters({ ...filters, company_id: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none"
                        >
                            <option value="all">All Companies</option>
                            {contacts.map(c => c.company).filter(Boolean).filter((v, i, a) => a.indexOf(v) === i).map(company => (
                                <option key={company.name} value={company.name}>{company.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Decision Maker</label>
                        <select
                            value={filters.is_decision_maker || 'all'}
                            onChange={(e) => setFilters({ ...filters, is_decision_maker: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none"
                        >
                            <option value="all">All</option>
                            <option value="true">Decision Makers</option>
                            <option value="false">Non-Decision Makers</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Consent Status</label>
                        <select
                            value={filters.consent_status || 'all'}
                            onChange={(e) => setFilters({ ...filters, consent_status: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none"
                        >
                            <option value="all">All</option>
                            <option value="opted_in">Opted In</option>
                            <option value="opted_out">Opted Out</option>
                            <option value="unknown">Unknown</option>
                        </select>
                    </div>
                </div>
            )}

            {/* Contacts Table */}
            {loading ? (
                <div className="overflow-x-auto">
                    <div className="rounded-xl border border-gray-200 bg-white shadow-sm animate-pulse">
                        <table className="w-full min-w-[1000px]">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-5 py-4"><div className="h-4 w-20 bg-gray-200 rounded" /></th>
                                    <th className="px-5 py-4"><div className="h-4 w-20 bg-gray-200 rounded" /></th>
                                    <th className="px-5 py-4"><div className="h-4 w-20 bg-gray-200 rounded" /></th>
                                    <th className="px-5 py-4"><div className="h-4 w-20 bg-gray-200 rounded" /></th>
                                    <th className="px-5 py-4"><div className="h-4 w-20 bg-gray-200 rounded" /></th>
                                    <th className="px-5 py-4"><div className="h-4 w-20 bg-gray-200 rounded" /></th>
                                    <th className="px-5 py-4"><div className="h-4 w-20 bg-gray-200 rounded" /></th>
                                    <th className="px-5 py-4"><div className="h-4 w-20 bg-gray-200 rounded" /></th>
                                </tr>
                            </thead>
                            <tbody>
                                {[1, 2, 3, 4, 5].map((_, i) => (
                                    <tr key={i} className="border-b border-gray-100">
                                        <td className="px-5 py-4"><div className="h-4 w-24 bg-gray-200 rounded" /></td>
                                        <td className="px-5 py-4"><div className="h-4 w-24 bg-gray-200 rounded" /></td>
                                        <td className="px-5 py-4"><div className="h-4 w-24 bg-gray-200 rounded" /></td>
                                        <td className="px-5 py-4"><div className="h-4 w-24 bg-gray-200 rounded" /></td>
                                        <td className="px-5 py-4"><div className="h-4 w-24 bg-gray-200 rounded" /></td>
                                        <td className="px-5 py-4"><div className="h-4 w-24 bg-gray-200 rounded" /></td>
                                        <td className="px-5 py-4"><div className="h-4 w-24 bg-gray-200 rounded" /></td>
                                        <td className="px-5 py-4"><div className="h-4 w-24 bg-gray-200 rounded" /></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <ContactsTable
                    contacts={contacts}
                    loading={loading}
                    onView={(contact) => setModalState({ isOpen: true, mode: 'edit', contact })}
                    onEdit={(contact) => setModalState({ isOpen: true, mode: 'edit', contact })}
                    onDelete={(contact) => setModalState({ isOpen: true, mode: 'delete', contact })}
                    pagination={{
                        currentPage: pagination.page,
                        totalPages: pagination.totalPages,
                        total: pagination.total,
                        limit: pagination.limit,
                        filters: Object.fromEntries(
                            Object.entries(filters).filter(([, v]) => v && v !== 'all')
                        )
                    }}
                    onPageChange={(page) => setPagination(prev => ({ ...prev, page }))}
                    onSort={setSort}
                    sortField={sort.field}
                    sortDirection={sort.direction}
                />
            )}

            {/* Contacts Form Modal */}
            {modalState.isOpen && (
                <ContactsForm
                    mode={modalState.mode}
                    contact={modalState.contact}
                    onSave={async (data) => {
                        try {
                            if (modalState.mode === 'create') {
                                await createContact(data);
                            } else if (modalState.mode === 'edit') {
                                await updateContact(modalState.contact.id, data);
                            }
                            setModalState({ isOpen: false, mode: 'create', contact: null });
                        } catch (error) {
                            console.error('Save error:', error);
                        }
                    }}
                    onCancel={() => setModalState({ isOpen: false, mode: 'create', contact: null })}
                    onDelete={async () => {
                        if (modalState.contact) {
                            await deleteContact(modalState.contact.id);
                            setModalState({ isOpen: false, mode: 'create', contact: null });
                        }
                    }}
                    loading={formLoading}
                />
            )}
        </div>
    );
};

export default Contacts;