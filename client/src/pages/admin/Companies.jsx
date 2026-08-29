
import  { useState } from 'react';
import { Plus, Search, Filter, X } from 'lucide-react';
import CompanyTable from '../../components/AdminLayout/company/CompanyTable';
import CompanyForm from '../../components/AdminLayout/company/CompanyForm';
import { companies as initailCompanies } from '../../data/CompaniesData';
const Companies = () => {
    const [companies, setCompanies] = useState(initailCompanies);
    
    // eslint-disable-next-line no-unused-vars
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({
        status: 'all',
        company_size: 'all',
        industry: 'all'
    });
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        total: 0,
        limit: 10
    });
    const [sort, setSort] = useState({
        field: 'name',
        direction: 'asc'
    });
    const [showFilters, setShowFilters] = useState(false);
    const [modalState, setModalState] = useState({
        isOpen: false,
        mode: 'create',
        company: null
    });
    const [formLoading, setFormLoading] = useState(false);

    // These will come from your actual data/API
    const industries = []; // Your industries data
    const sources = []; // Your sources data
    const owners = []; // Your owners data

    const handlePageChange = (page) => {
        setPagination({ ...pagination, currentPage: page });
    };

    const handleSort = (field, direction) => {
        setSort({ field, direction });
    };

    const handleFilterChange = (key, value) => {
        setFilters({ ...filters, [key]: value });
        setPagination({ ...pagination, currentPage: 1 });
    };

    const clearFilters = () => {
        setFilters({
            status: 'all',
            company_size: 'all',
            industry: 'all'
        });
        setSearchTerm('');
        setPagination({ ...pagination, currentPage: 1 });
    };

    const hasActiveFilters = () => {
        return filters.status !== 'all' ||
            filters.company_size !== 'all' ||
            filters.industry !== 'all' ||
            searchTerm !== '';
    };

    const openCreateModal = () => {
        setModalState({
            isOpen: true,
            mode: 'create',
            company: null
        });
    };

    const openEditModal = (company) => {
        setModalState({
            isOpen: true,
            mode: 'edit',
            company
        });
    };

    const handleSave = async (data) => {
        setFormLoading(true);
        try {
            // Your save logic here
            console.log('Saving company:', data);
            // On success:
            // setCompanies(prev => [...prev, { ...data, id: Date.now().toString() }]);
            closeModal();
        } catch (error) {
            console.error('Error saving company:', error);
        } finally {
            setFormLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this company?')) return;
        setFormLoading(true);
        try {
            // Your delete logic here
            console.log('Deleting company:', modalState.company);
            // On success:
            // setCompanies(prev => prev.filter(c => c.id !== modalState.company.id));
            closeModal();
        } catch (error) {
            console.error('Error deleting company:', error);
        } finally {
            setFormLoading(false);
        }
    };

    const closeModal = () => {
        setModalState({
            isOpen: false,
            mode: 'create',
            company: null
        });
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Companies</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Manage your company relationships and track interactions
                    </p>
                </div>
                <button
                    onClick={openCreateModal}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-lg hover:opacity-90 transition-opacity shadow-sm"
                >
                    <Plus className="w-4 h-4" />
                    Add Company
                </button>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search companies by name, domain, or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-shadow text-sm"
                    />
                    {searchTerm && (
                        <button
                            onClick={() => setSearchTerm('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
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
                            {Object.values(filters).filter(v => v !== 'all').length + (searchTerm ? 1 : 0)}
                        </span>
                    )}
                </button>

                {hasActiveFilters() && (
                    <button
                        onClick={clearFilters}
                        className="inline-flex items-center gap-1 px-3 py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
                    >
                        <X className="w-4 h-4" />
                        Clear all
                    </button>
                )}
            </div>

            {/* Filter Panel */}
            {showFilters && (
                <div className="bg-white border border-gray-200 rounded-lg p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Status
                        </label>
                        <select
                            value={filters.status}
                            onChange={(e) => handleFilterChange('status', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none"
                        >
                            <option value="all">All Statuses</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                            <option value="pending">Pending</option>
                            <option value="archived">Archived</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Company Size
                        </label>
                        <select
                            value={filters.company_size}
                            onChange={(e) => handleFilterChange('company_size', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none"
                        >
                            <option value="all">All Sizes</option>
                            <option value="enterprise">Enterprise</option>
                            <option value="large">Large</option>
                            <option value="medium">Medium</option>
                            <option value="small">Small</option>
                            <option value="startup">Startup</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Industry
                        </label>
                        <select
                            value={filters.industry}
                            onChange={(e) => handleFilterChange('industry', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none"
                        >
                            <option value="all">All Industries</option>
                            {industries.map(industry => (
                                <option key={industry.id} value={industry.id}>
                                    {industry.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            )}

            {/* Company Table */}
            <CompanyTable
                companies={companies}
                loading={loading}
                onView={(company) => openEditModal(company)}
                onEdit={(company) => openEditModal(company)}
                onDelete={(company) => {
                    if (confirm(`Are you sure you want to delete ${company.name}?`)) {
                        setCompanies(prev => prev.filter(c => c.id !== company.id));
                    }
                }}
                pagination={{
                    currentPage: pagination.currentPage,
                    totalPages: pagination.totalPages,
                    total: pagination.total,
                    filters: Object.fromEntries(
                        // eslint-disable-next-line no-unused-vars
                        Object.entries(filters).filter(([_, v]) => v !== 'all')
                    )
                }}
                onPageChange={handlePageChange}
                onSort={handleSort}
                sortField={sort.field}
                sortDirection={sort.direction}
            />

            {/* Company Form Modal */}
            {modalState.isOpen && (
                <CompanyForm
                    mode={modalState.mode}
                    company={modalState.company}
                    onSave={handleSave}
                    onCancel={closeModal}
                    onDelete={handleDelete}
                    loading={formLoading}
                    industries={industries}
                    sources={sources}
                    owners={owners}
                />
            )}
        </div>
    );
};

export default Companies;