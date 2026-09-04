import { Plus, Search, Filter, X } from "lucide-react";
import { useState, useEffect } from "react";
import LeadTable from "../../components/AdminLayout/leads/LeadTable";
import LeadDetails from "../../components/AdminLayout/leads/LeadDetails";
import LeadForm from "../../components/AdminLayout/leads/LeadForm";
import DeleteLead from "../../components/AdminLayout/leads/DeleteLead";
import { TableSkeleton } from "../../components/AdminLayout/Skeleton";
import { useLeads } from "../../store/hooks";

const Leads = () => {
    const {
        leads,
        selectedLead: storeSelectedLead,
        loading,
        error,
        pagination,
        filters,
        sort,
        fetchLeads,
        fetchLead,
        createLead,
        updateLead,
        deleteLead: deleteLeadAction,
        setFilters,
        setSort,
        setPage,
        clearError,
    } = useLeads();

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [formMode, setFormMode] = useState("create");
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedLeadId, setSelectedLeadId] = useState(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [deleteLead, setDeleteLead] = useState(null);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        fetchLeads();
    }, []);

    useEffect(() => {
        fetchLeads({ page: pagination.page, ...filters, sort: `${sort.field}:${sort.direction}` });
    }, [pagination.page, filters, sort]);

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleFilterChange = (key, value) => {
        setFilters({ ...filters, [key]: value });
        setPage(1);
    };

    const clearFilters = () => {
        setFilters({ status: "", temperature: "", source: "" });
        setSearchTerm("");
        setPage(1);
    };

    const hasActiveFilters = () => {
        return filters.status || filters.temperature || filters.source || searchTerm;
    };

    const openCreateModal = () => {
        setFormMode("create");
        setIsFormOpen(true);
    };

    const openEditModal = (lead) => {
        setSelectedLeadId(lead.id);
        setFormMode("edit");
        setIsFormOpen(true);
    };

    const handleSave = async (data) => {
        setIsLoading(true);
        try {
            if (formMode === "create") {
                await createLead(data);
            } else {
                await updateLead(selectedLeadId, data);
            }
            setIsFormOpen(false);
            setSelectedLeadId(null);
        } catch (error) {
            console.error("Save error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (lead) => {
        setDeleteLead(lead);
    };

    const confirmDelete = async () => {
        if (!deleteLead) return;
        setIsLoading(true);
        try {
            await deleteLeadAction(deleteLead.id);
            setDeleteLead(null);
        } catch (error) {
            console.error("Delete error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleView = (lead) => {
        setSelectedLeadId(lead.id);
        setIsDetailsOpen(true);
    };

    const closeDetails = () => {
        setIsDetailsOpen(false);
        setSelectedLeadId(null);
    };

    const selectedLead = leads.find(l => l.id === selectedLeadId);

    return (
        <section className="w-full">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Leads</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage and track your leads</p>
                </div>
                <button
                    onClick={openCreateModal}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-lg hover:opacity-90 transition-opacity shadow-sm"
                >
                    <Plus className="w-4 h-4" />
                    Add Lead
                </button>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search leads by title, company, service, email..."
                        value={searchTerm}
                        onChange={handleSearch}
                        className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-shadow text-sm"
                    />
                    {searchTerm && (
                        <button onClick={() => setSearchTerm("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>

                <button
                    onClick={() => setIsFilterOpen(!isFilterOpen)}
                    className={`inline-flex items-center gap-2 px-4 py-2 border rounded-lg text-sm font-medium transition-colors ${isFilterOpen || hasActiveFilters()
                        ? "border-cyan-500 text-cyan-600 bg-cyan-50"
                        : "border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}
                >
                    <Filter className="w-4 h-4" />
                    Filters
                    {hasActiveFilters() && (
                        <span className="w-5 h-5 bg-cyan-600 text-white rounded-full text-xs flex items-center justify-center">
                            {(filters.status ? 1 : 0) + (filters.temperature ? 1 : 0) + (filters.source ? 1 : 0) + (searchTerm ? 1 : 0)}
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
            {isFilterOpen && (
                <div className="bg-white border border-gray-200 rounded-lg p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Status</label>
                        <select
                            value={filters.status || ""}
                            onChange={(e) => handleFilterChange("status", e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none"
                        >
                            <option value="">All Statuses</option>
                            <option value="new">New</option>
                            <option value="contacted">Contacted</option>
                            <option value="qualified">Qualified</option>
                            <option value="nurture">Nurture</option>
                            <option value="lost">Lost</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Temperature</label>
                        <select
                            value={filters.temperature || ""}
                            onChange={(e) => handleFilterChange("temperature", e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none"
                        >
                            <option value="">All Temperatures</option>
                            <option value="hot">Hot</option>
                            <option value="warm">Warm</option>
                            <option value="cold">Cold</option>
                            <option value="unknown">Unknown</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Source</label>
                        <select
                            value={filters.source || ""}
                            onChange={(e) => handleFilterChange("source", e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none"
                        >
                            <option value="">All Sources</option>
                            <option value="linkedin">LinkedIn</option>
                            <option value="referral">Referral</option>
                            <option value="website">Website</option>
                            <option value="cold_email">Cold Email</option>
                            <option value="google">Google</option>
                            <option value="facebook">Facebook</option>
                        </select>
                    </div>
                </div>
            )}

            {/* Leads Table */}
            {isLoading ? (
                <TableSkeleton rows={5} columns={8} />
            ) : (
                <LeadTable
                    leads={leads}
                    loading={loading}
                    onView={handleView}
                    onEdit={openEditModal}
                    onDelete={handleDelete}
                    pagination={{
                        currentPage: pagination.page,
                        totalPages: pagination.totalPages,
                        total: pagination.total,
                        limit: pagination.limit,
                        filters: Object.fromEntries(
                            Object.entries(filters).filter(([, v]) => v)
                        )
                    }}
                    onPageChange={setPage}
                    onSort={setSort}
                    sortField={sort.field}
                    sortDirection={sort.direction}
                />
            )}

            {/* Lead Form Modal */}
            {isFormOpen && (
                <LeadForm
                    mode={formMode}
                    lead={selectedLeadId ? leads.find(l => l.id === selectedLeadId) : null}
                    onSave={handleSave}
                    onCancel={() => { setIsFormOpen(false); setSelectedLeadId(null); }}
                    loading={isLoading}
                />
            )}

            {/* Lead Details Modal */}
            {isDetailsOpen && selectedLead && (
                <LeadDetails
                    lead={selectedLead}
                    setIsOpen={closeDetails}
                    onEdit={() => { closeDetails(); openEditModal(selectedLead); }}
                />
            )}

            {/* Delete Confirmation Modal */}
            {deleteLead && (
                <DeleteLead
                    lead={deleteLead}
                    onConfirm={confirmDelete}
                    onCancel={() => setDeleteLead(null)}
                />
            )}
        </section>
    );
};

export default Leads;