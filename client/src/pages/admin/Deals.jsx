import { useState, useEffect, useMemo } from 'react';
import { Plus, Search, Filter, X } from 'lucide-react';
import DealKanban from '../../components/AdminLayout/deals/DealKanban';
import DealForm from '../../components/AdminLayout/deals/DealForm';
import { stages } from '../../data/DealsData';
import { useDeals } from '../../store/hooks';
import { useReferenceData } from '../../data/ReferenceData';

const Deals = () => {
    const {
        deals,
        loading,
        error,
        pagination,
        filters,
        sort,
        fetchDeals,
        createDeal,
        updateDeal,
        deleteDeal: deleteDealAction,
        setFilters,
        setSort,
        setPage,
        clearError,
    } = useDeals();

    const { companies, sources, owners, contacts } = useReferenceData();

    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [modalState, setModalState] = useState({
        isOpen: false,
        mode: 'create',
        deal: null,
    });
    const [formLoading, setFormLoading] = useState(false);

    // Single fetch effect
    useEffect(() => {
        fetchDeals({
            page: pagination.page,
            ...filters,
            search: debouncedSearch || undefined,
            sort: `${sort.field}:${sort.direction}`,
        });
    }, [pagination.page, filters, sort, debouncedSearch]);

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(searchTerm), 300);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    // Pipeline stats by stage
    const pipelineStats = useMemo(() => {
        return stages.map((stage) => {
            const stageDeals = deals.filter((d) => d.stage === stage.id);
            const totalValue = stageDeals.reduce((sum, d) => sum + (Number(d.value) || 0), 0);
            const weightedValue = stageDeals.reduce(
                (sum, d) => sum + (Number(d.value) || 0) * (Number(d.probability) || 0) / 100,
                0
            );
            return {
                ...stage,
                count: stageDeals.length,
                totalValue,
                weightedValue: Math.round(weightedValue),
            };
        });
    }, [deals]);

    const handleFilterChange = (key, value) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
        setPage(1);
    };

    const clearFilters = () => {
        setFilters({ stage: 'all', owner_id: 'all' });
        setSearchTerm('');
        setPage(1);
    };

    const hasActiveFilters = () => {
        return filters.stage !== 'all' || filters.owner_id !== 'all' || searchTerm !== '';
    };

    const openCreateModal = () => {
        setModalState({ isOpen: true, mode: 'create', deal: null });
    };

    const openEditModal = (deal) => {
        setModalState({ isOpen: true, mode: 'edit', deal });
    };

    const closeModal = () => {
        setModalState({ isOpen: false, mode: 'create', deal: null });
    };

    const handleSave = async (data) => {
        setFormLoading(true);
        try {
            if (modalState.mode === 'create') {
                await createDeal(data);
            } else {
                await updateDeal(modalState.deal.id, data);
            }
            closeModal();
        } catch (error) {
            console.error('Save error:', error);
        } finally {
            setFormLoading(false);
        }
    };

    const handleDelete = async (deal) => {
        if (!confirm('Are you sure you want to delete this deal?')) return;
        setFormLoading(true);
        try {
            await deleteDealAction(deal.id);
            closeModal();
        } catch (error) {
            console.error('Delete error:', error);
        } finally {
            setFormLoading(false);
        }
    };

    const formatCurrency = (value, currency = 'USD') =>
        new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency,
            minimumFractionDigits: 0,
        }).format(value || 0);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Deals</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Manage your sales pipeline and track deal progress
                    </p>
                </div>
                <button
                    onClick={openCreateModal}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-lg hover:opacity-90 transition-opacity shadow-sm"
                >
                    <Plus className="w-4 h-4" />
                    Add Deal
                </button>
            </div>

            {/* Pipeline Summary */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
                {pipelineStats.map((stat) => (
                    <div key={stat.id} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                        <div className="flex items-center gap-2 mb-2">
                            <div className={`w-3 h-3 rounded-full ${stat.color}`} />
                            <span className="text-sm font-medium text-gray-700">{stat.label}</span>
                        </div>
                        <div className="text-2xl font-bold text-gray-900">{stat.count}</div>
                        <div className="text-sm text-gray-500">{formatCurrency(stat.totalValue)}</div>
                        <div className="text-xs text-emerald-600 font-medium">
                            Weighted: {formatCurrency(stat.weightedValue)}
                        </div>
                    </div>
                ))}
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search deals by title, company, contact, owner..."
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
                    className={`inline-flex items-center gap-2 px-4 py-2 border rounded-lg text-sm font-medium transition-colors ${
                        showFilters || hasActiveFilters()
                            ? 'border-cyan-500 text-cyan-600 bg-cyan-50'
                            : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                >
                    <Filter className="w-4 h-4" />
                    Filters
                    {hasActiveFilters() && (
                        <span className="w-5 h-5 bg-cyan-600 text-white rounded-full text-xs flex items-center justify-center">
                            {(filters.stage !== 'all' ? 1 : 0) +
                                (filters.owner_id !== 'all' ? 1 : 0) +
                                (searchTerm ? 1 : 0)}
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
                <div className="bg-white border border-gray-200 rounded-lg p-4 grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Stage</label>
                        <select
                            value={filters.stage || 'all'}
                            onChange={(e) => handleFilterChange('stage', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none"
                        >
                            <option value="all">All Stages</option>
                            {stages.map((s) => (
                                <option key={s.id} value={s.id}>{s.label}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Owner</label>
                        <select
                            value={filters.owner_id || 'all'}
                            onChange={(e) => handleFilterChange('owner_id', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none"
                        >
                            <option value="all">All Owners</option>
                            {owners.map((o) => (
                                <option key={o.id} value={o.id}>{o.full_name}</option>
                            ))}
                        </select>
                    </div>
                </div>
            )}

            {/* Kanban */}
            {loading ? (
                <div className="overflow-x-auto">
                    <div className="flex gap-4 min-w-max pb-4 animate-pulse">
                        {stages.map((stage) => (
                            <div key={stage.id} className="w-80 flex-shrink-0 flex flex-col">
                                <div className="rounded-t-xl bg-gray-50 px-4 py-3 border-b border-gray-200">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className={`w-3 h-3 rounded-full ${stage.color}`} />
                                        <h3 className="font-semibold text-gray-900">{stage.label}</h3>
                                    </div>
                                </div>
                                <div className="flex-1 p-3 space-y-3 min-h-[400px] bg-gradient-to-b from-gray-50 to-white">
                                    {[1, 2].map((i) => (
                                        <div key={i} className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
                                            <div className="h-4 w-3/4 bg-gray-200 rounded mb-2" />
                                            <div className="h-3 w-1/2 bg-gray-200 rounded" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <DealKanban
                    deals={deals}
                    stages={stages}
                    onView={openEditModal}
                    onEdit={openEditModal}
                    onDelete={handleDelete}
                    formatCurrency={formatCurrency}
                />
            )}

            {/* Deal Form Modal */}
            {modalState.isOpen && (
                <DealForm
                    mode={modalState.mode}
                    deal={modalState.deal}
                    onSave={handleSave}
                    onCancel={closeModal}
                    onDelete={handleDelete}
                    loading={formLoading}
                    stages={stages}
                    companies={companies}
                    contacts={contacts}
                    sources={sources}
                    owners={owners}
                />
            )}
        </div>
    );
};

export default Deals;