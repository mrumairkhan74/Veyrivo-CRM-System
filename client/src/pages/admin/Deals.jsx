import { useState, useEffect, useMemo } from 'react';
import { Plus, Search, Filter, X } from 'lucide-react';
import DealKanban from '../../components/AdminLayout/deals/DealKanban';
import DealForm from '../../components/AdminLayout/deals/DealForm';
import { deals as initialDeals, stages } from '../../data/DealsData';

const Deals = () => {
    const [deals, setDeals] = useState(initialDeals);
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [filters, setFilters] = useState({
        stage: 'all',
        owner: 'all',
    });
    const [showFilters, setShowFilters] = useState(false);
    const [modalState, setModalState] = useState({
        isOpen: false,
        mode: 'create',
        deal: null
    });
    const [formLoading, setFormLoading] = useState(false);

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    // Get unique owners from deals
    const owners = useMemo(() => {
        const ownerSet = new Set(deals.map(d => d.owner).filter(Boolean));
        return Array.from(ownerSet).sort();
    }, [deals]);

    // Filter deals
    const filteredDeals = useMemo(() => {
        let result = [...deals];
        const search = debouncedSearch.toLowerCase();

        if (search) {
            result = result.filter(deal =>
                deal.title.toLowerCase().includes(search) ||
                deal.company.toLowerCase().includes(search) ||
                deal.contact.toLowerCase().includes(search) ||
                deal.owner.toLowerCase().includes(search)
            );
        }

        if (filters.stage !== 'all') {
            result = result.filter(deal => deal.stage === filters.stage);
        }

        if (filters.owner !== 'all') {
            result = result.filter(deal => deal.owner === filters.owner);
        }

        return result;
    }, [deals, debouncedSearch, filters]);

    // Pipeline stats by stage
    const pipelineStats = useMemo(() => {
        return stages.map(stage => {
            const stageDeals = filteredDeals.filter(d => d.stage === stage.id);
            const totalValue = stageDeals.reduce((sum, d) => sum + (d.value || 0), 0);
            const weightedValue = stageDeals.reduce((sum, d) => sum + (d.value || 0) * (d.probability || 0) / 100, 0);
            return {
                ...stage,
                count: stageDeals.length,
                totalValue,
                weightedValue: Math.round(weightedValue),
            };
        });
    }, [filteredDeals]);

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const clearFilters = () => {
        setFilters({ stage: 'all', owner: 'all' });
        setSearchTerm('');
    };

    const hasActiveFilters = () => {
        return filters.stage !== 'all' || filters.owner !== 'all' || searchTerm !== '';
    };

    const openCreateModal = () => {
        setModalState({ isOpen: true, mode: 'create', deal: null });
    };

    const openEditModal = (deal) => {
        setModalState({ isOpen: true, mode: 'edit', deal });
    };

    const handleSave = async (data) => {
        setFormLoading(true);
        try {
            console.log('Saving deal:', data);
            await new Promise(resolve => setTimeout(resolve, 500));
            
            if (modalState.mode === 'create') {
                const newDeal = {
                    ...data,
                    id: `deal-${crypto.randomUUID()}`,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                    activities_count: 0,
                };
                setDeals(prev => [newDeal, ...prev]);
            } else {
                setDeals(prev =>
                    prev.map(d =>
                        d.id === modalState.deal.id
                            ? { ...d, ...data, updated_at: new Date().toISOString() }
                            : d
                    )
                );
            }
            closeModal();
        } catch (error) {
            console.error('Error saving deal:', error);
        } finally {
            setFormLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this deal?')) return;
        setFormLoading(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 300));
            setDeals(prev => prev.filter(d => d.id !== modalState.deal.id));
            closeModal();
        } catch (error) {
            console.error('Error deleting deal:', error);
        } finally {
            setFormLoading(false);
        }
    };

    const closeModal = () => {
        setModalState({ isOpen: false, mode: 'create', deal: null });
    };

    const formatCurrency = (value, currency = 'USD') => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency, minimumFractionDigits: 0 }).format(value);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Deals</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage your sales pipeline and track deal progress</p>
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
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {pipelineStats.map(stat => (
                    <div key={stat.id} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                        <div className="flex items-center gap-2 mb-2">
                            <div className={`w-3 h-3 rounded-full ${stat.color}`} />
                            <span className="text-sm font-medium text-gray-700">{stat.label}</span>
                        </div>
                        <div className="text-2xl font-bold text-gray-900">{stat.count}</div>
                        <div className="text-sm text-gray-500">{formatCurrency(stat.totalValue)}</div>
                        <div className="text-xs text-emerald-600 font-medium">Weighted: {formatCurrency(stat.weightedValue)}</div>
                    </div>
                ))}
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
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
                            {(filters.stage !== 'all' ? 1 : 0) + (filters.owner !== 'all' ? 1 : 0) + (searchTerm ? 1 : 0)}
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
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Stage</label>
                        <select
                            value={filters.stage}
                            onChange={(e) => handleFilterChange('stage', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none"
                        >
                            <option value="all">All Stages</option>
                            {stages.map(stage => (
                                <option key={stage.id} value={stage.id}>{stage.label}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Owner</label>
                        <select
                            value={filters.owner}
                            onChange={(e) => handleFilterChange('owner', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none"
                        >
                            <option value="all">All Owners</option>
                            {owners.map(owner => (
                                <option key={owner} value={owner}>{owner}</option>
                            ))}
                        </select>
                    </div>
                </div>
            )}

            {/* Kanban Board */}
            <DealKanban
                deals={filteredDeals}
                stages={stages}
                onView={openEditModal}
                onEdit={openEditModal}
                onDelete={(deal) => {
                    if (confirm(`Delete ${deal.title}?`)) {
                        setDeals(prev => prev.filter(d => d.id !== deal.id));
                    }
                }}
                formatCurrency={formatCurrency}
            />

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
                />
            )}
        </div>
    );
};

export default Deals;