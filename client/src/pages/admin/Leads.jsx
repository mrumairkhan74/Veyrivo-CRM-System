import { Plus, Search, Filter } from "lucide-react";
import CreateLead from "../../components/AdminLayout/leads/CreateLead";
import { useState } from "react";
import LeadTable from "../../components/AdminLayout/leads/LeadTable";
import { leads } from "../../data/LeadData";
const Leads = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    const [filters, setFilters] = useState({
        status: "",
        temperature: "",
        source: "",
    });
    const filteredLeads = leads.filter((lead) => {
        return (
            (!filters.status || lead.status === filters.status) &&
            (!filters.temperature || lead.temperature === filters.temperature) &&
            (!filters.source || lead.source === filters.source)
        );
    });
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
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700">
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


            {
                isOpen && (
                    <CreateLead setIsOpen={setIsOpen} />
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
            <LeadTable leads={filteredLeads} />
        </section>
    );
};

export default Leads;