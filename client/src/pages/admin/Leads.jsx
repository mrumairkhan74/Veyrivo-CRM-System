/* eslint-disable react-hooks/set-state-in-effect */
import { Plus, Search, Filter } from "lucide-react";
import { useState, useEffect } from "react";
import LeadTable from "../../components/AdminLayout/leads/LeadTable";
import { leads as initialLeads } from "../../data/LeadData";
import LeadDetails from "../../components/AdminLayout/leads/LeadDetails";
import LeadForm from "../../components/AdminLayout/leads/LeadForm";
import DeleteLead from "../../components/AdminLayout/leads/DeleteLead";
const Leads = () => {
    const [leads, setLeads] = useState(initialLeads)
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [formMode, setFormMode] = useState("create");
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedLead, setSelectedLead] = useState(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [deleteLead, setDeleteLead] = useState(null);
    const [isFilterOpen, setIsFilterOpen] = useState(false);



    const [filters, setFilters] = useState({
        status: "",
        temperature: "",
        source: "",
    });


    // Search & Filter 
    const filteredLeads = leads.filter((lead) => {
        const search = searchTerm.toLowerCase();

        const matchesSearch =
            lead.title.toLowerCase().includes(search) ||
            lead.company.toLowerCase().includes(search) ||
            lead.service.toLowerCase().includes(search) ||
            lead.email.toLowerCase().includes(search);

        const matchesFilters =
            (!filters.status || lead.status === filters.status) &&
            (!filters.temperature || lead.temperature === filters.temperature) &&
            (!filters.source || lead.source === filters.source);

        return matchesSearch && matchesFilters;
    });

    // Pages 

    const leadsPerPage = 5;

    const totalPages = Math.ceil(filteredLeads.length / leadsPerPage);

    const startIndex = (currentPage - 1) * leadsPerPage;

    const paginatedLeads = filteredLeads.slice(
        startIndex,
        startIndex + leadsPerPage
    );

    useEffect(() => {

        setCurrentPage(1);
    }, [searchTerm, filters]);

    return (
        <section className="w-full">

            {/* Page Header */}
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                <div>
                    <h1 className="text-2xl font-bold text-slate-800 md:text-3xl">
                        Leads
                    </h1>

                    <p className="mt-1 text-sm text-slate-500">
                        Manage, track, and organize all your potential clients.
                    </p>
                </div>

                <button
                    onClick={() => {
                        setFormMode("create");
                        setIsFormOpen(true);
                    }}
                    className="flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-cyan-500 to-purple-600 px-4 py-2.5 text-sm font-medium text-white transition hover:from-cyan-600 hover:to-purple-700">
                    <Plus size={18} />
                    Add Lead
                </button>

            </div>

            {/* Search and Filters */}
            <div className="mb-6 flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:flex-row">

                {/* Search */}
                <div className="relative flex-1">
                    <Search
                        size={18}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search by name, company, email..."
                        className="w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                </div>

                {/* Filter Button */}
                <button
                    onClick={() => setIsFilterOpen((prev) => !prev)}
                    className="flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
                >
                    <Filter size={18} />
                    Filters
                </button>

            </div>


            {isFormOpen && formMode === "create" && (
                    <LeadForm
                        mode="create"
                        setIsOpen={setIsFormOpen}
                        onSubmit={(newLead) => {
                            setLeads((prev) => [newLead, ...prev]);
                            setIsFormOpen(false);
                        }} />
                )
            }
            {/* Filter Logic */}
            {isFilterOpen && (
                <div className="mb-6 grid grid-cols-1 gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-3 lg:grid-cols-4">

                    {/* Status */}
                    <select
                        value={filters.status}
                        onChange={(e) =>
                            setFilters({
                                ...filters,
                                status: e.target.value,
                            })
                        }
                        className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                    >
                        <option value="">All Statuses</option>
                        <option value="new">New</option>
                        <option value="contacted">Contacted</option>
                        <option value="qualified">Qualified</option>
                        <option value="nurture">Nurture</option>
                        <option value="lost">Lost</option>
                    </select>

                    {/* Temperature */}
                    <select
                        value={filters.temperature}
                        onChange={(e) =>
                            setFilters({
                                ...filters,
                                temperature: e.target.value,
                            })
                        }
                        className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                    >
                        <option value="">All Temperatures</option>
                        <option value="hot">Hot</option>
                        <option value="warm">Warm</option>
                        <option value="cold">Cold</option>
                        <option value="unknown">Unknown</option>
                    </select>

                    {/* Source */}
                    <select
                        value={filters.source}
                        onChange={(e) =>
                            setFilters({
                                ...filters,
                                source: e.target.value,
                            })
                        }
                        className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                    >
                        <option value="">All Sources</option>
                        <option value="LinkedIn">LinkedIn</option>
                        <option value="Referral">Referral</option>
                        <option value="Website">Website</option>
                        <option value="Cold Email">Cold Email</option>
                        <option value="Google">Google</option>
                        <option value="Facebook">Facebook</option>
                    </select>

                    <button
                        onClick={() =>
                            setFilters({
                                status: "",
                                temperature: "",
                                source: "",
                            })
                        }
                        className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
                    >
                        Clear Filters
                    </button>
                </div>
            )}

            {/* Leads Table - Next Step */}
            <LeadTable
                leads={paginatedLeads}
                onView={(lead) => {
                    setSelectedLead(lead);
                    setIsDetailsOpen(true);
                }}
                onEdit={(lead) => {
                    setSelectedLead(lead);
                    setFormMode("edit");
                    setIsFormOpen(true);
                }}
                onDelete={(lead) => {
                    setDeleteLead(lead);
                }}
            />
            {/* Pagination Row */}
            <div className="mt-4 flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">

                <p className="text-sm text-slate-500">
                    Showing{" "}
                    <span className="font-semibold text-slate-700">
                        {filteredLeads.length === 0 ? 0 : startIndex + 1}
                    </span>
                    {" "}to{" "}
                    <span className="font-semibold text-slate-700">
                        {Math.min(startIndex + leadsPerPage, filteredLeads.length)}
                    </span>
                    {" "}of{" "}
                    <span className="font-semibold text-slate-700">
                        {filteredLeads.length}
                    </span>
                    {" "}leads
                </p>

                <div className="flex items-center gap-2">

                    <button
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage((prev) => prev - 1)}
                        className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        Previous
                    </button>

                    <span className="rounded-lg bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-600">
                        {currentPage} / {totalPages || 1}
                    </span>

                    <button
                        disabled={currentPage === totalPages || totalPages === 0}
                        onClick={() => setCurrentPage((prev) => prev + 1)}
                        className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        Next
                    </button>

                </div>
            </div>

            {/* View Lead Detail Box */}
            {isDetailsOpen && selectedLead && (
                <LeadDetails
                    lead={selectedLead}
                    setIsOpen={() => setIsDetailsOpen(false)}
                    onEdit={(lead) => {
                        setIsDetailsOpen(false);
                        setSelectedLead(lead);
                        setFormMode("edit");
                        setIsFormOpen(true);
                    }}
                />
            )}

            {/* Updated Lead Detail */}
            {isFormOpen && formMode === "edit" && selectedLead && (
                <LeadForm
                    mode="edit"
                    lead={selectedLead}
                    setIsOpen={setIsFormOpen}
                    onSubmit={(updatedLead) => {
                        console.log("Updated Lead:", updatedLead);
                        setLeads((prev) =>
                            prev.map((l) => (l.id === selectedLead.id ? { ...l, ...updatedLead } : l))
                        );
                        setIsFormOpen(false);
                        setSelectedLead(null);
                    }}
                />
            )}
            {deleteLead && (
                <DeleteLead
                    lead={deleteLead}
                    setIsOpen={() => setDeleteLead(null)}
                    onConfirm={(lead) => {
                        console.log("Delete:", lead);
                        setLeads(prev => prev.filter((i) => i.id !== lead.id));
                        setCurrentPage(1);
                        // Backend/API deletion will come here later.

                        setDeleteLead(null);
                    }}
                />
            )}
        </section>
    );
};

export default Leads;