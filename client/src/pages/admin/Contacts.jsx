/* eslint-disable react-hooks/static-components */
/* eslint-disable react-hooks/purity */
/* eslint-disable react-hooks/set-state-in-effect */
// src/pages/admin/Contacts.jsx
import { useState, useEffect } from 'react';
import { Plus, Search, Filter, X, Users, Download, Building2, CheckCircle } from 'lucide-react';
import ContactsTable from '../../components/AdminLayout/contact/ContactTable';
import ContactsForm from '../../components/AdminLayout/contact/ContactForm';
import {
  ContactsData,
  searchContacts,
  getContactStats,
  getUniqueCompanies,
  getUniqueOwners
} from '../../data/ContactData';

const Contacts = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filters, setFilters] = useState({
    status: 'all',
    company_id: 'all',
    is_decision_maker: 'all',
    consent_status: 'all'
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0,
    limit: 10
  });
  const [sort, setSort] = useState({
    field: 'first_name',
    direction: 'asc'
  });
  const [showFilters, setShowFilters] = useState(false);
  const [modalState, setModalState] = useState({
    isOpen: false,
    mode: 'create',
    contact: null
  });
  const [formLoading, setFormLoading] = useState(false);
  const [stats, setStats] = useState(getContactStats());

  // Get unique companies and owners from contacts
  const companies = getUniqueCompanies();
  const owners = getUniqueOwners();

  const fetchContacts = () => {
    setLoading(true);
    try {
      // Start with all contacts
      let filtered = [...ContactsData];

      // Apply search (using debounced value)
      if (debouncedSearch) {
        filtered = searchContacts(debouncedSearch);
      }

      // Apply filters
      if (filters.status !== 'all') {
        filtered = filtered.filter(c => c.status === filters.status);
      }

      if (filters.company_id !== 'all') {
        filtered = filtered.filter(c => c.company_id === filters.company_id);
      }

      if (filters.is_decision_maker !== 'all') {
        const isDM = filters.is_decision_maker === 'true';
        filtered = filtered.filter(c => c.is_decision_maker === isDM);
      }

      if (filters.consent_status !== 'all') {
        filtered = filtered.filter(c => c.consent_status === filters.consent_status);
      }

      // Apply sorting
      filtered.sort((a, b) => {
        let aVal = a[sort.field] || '';
        let bVal = b[sort.field] || '';

        if (sort.field === 'first_name') {
          aVal = `${a.first_name} ${a.last_name}`;
          bVal = `${b.first_name} ${b.last_name}`;
        }

        if (typeof aVal === 'string') {
          aVal = aVal.toLowerCase();
          bVal = bVal.toLowerCase();
        }

        return sort.direction === 'asc'
          ? aVal > bVal ? 1 : -1
          : aVal < bVal ? 1 : -1;
      });

      // Calculate pagination
      const total = filtered.length;
      const totalPages = Math.ceil(total / pagination.limit);
      const startIndex = (pagination.currentPage - 1) * pagination.limit;
      const endIndex = Math.min(startIndex + pagination.limit, total);
      const paginatedData = filtered.slice(startIndex, endIndex);

      setContacts(paginatedData);
      setPagination({
        ...pagination,
        total,
        totalPages: totalPages || 1
      });
    } catch (error) {
      console.error('Error fetching contacts:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch on mount and when dependencies change
  useEffect(() => {

    fetchContacts();
  }, [pagination.currentPage, sort, filters.status, filters.company_id, filters.is_decision_maker, filters.consent_status]);

  // Handle search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setPagination(prev => ({ ...prev, currentPage: 1 }));
      fetchContacts();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handlePageChange = (page) => {
    if (page < 1 || page > pagination.totalPages) return;
    setPagination({ ...pagination, currentPage: page });
  };

  const handleSort = (field, direction) => {
    setSort({ field, direction });
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const handleFilterChange = (key, value) => {
    setFilters({ ...filters, [key]: value });
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const clearFilters = () => {
    setFilters({
      status: 'all',
      company_id: 'all',
      is_decision_maker: 'all',
      consent_status: 'all'
    });
    setSearchTerm('');
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const hasActiveFilters = () => {
    return filters.status !== 'all' ||
      filters.company_id !== 'all' ||
      filters.is_decision_maker !== 'all' ||
      filters.consent_status !== 'all' ||
      searchTerm !== '';
  };

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

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
      console.log('Saving contact:', data);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      if (modalState.mode === 'create') {
        // Create new contact
        const newContact = {
          ...data,

          id: Date.now().toString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          company: data.company_id ? companies.find(c => c.id === data.company_id) : null,
          owner: data.owner_id ? owners.find(o => o.id === data.owner_id) : null
        };
        // In a real app, you'd add to the data source
        console.log('New contact created:', newContact);
      } else {
        // Update existing contact
        console.log('Contact updated:', { ...modalState.contact, ...data });
      }

      closeModal();
      fetchContacts(); // Refresh list
      setStats(getContactStats()); // Update stats
    } catch (error) {
      console.error('Error saving contact:', error);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this contact?')) return;

    setFormLoading(true);
    try {
      console.log('Deleting contact:', modalState.contact);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      closeModal();
      fetchContacts(); // Refresh list
      setStats(getContactStats()); // Update stats
    } catch (error) {
      console.error('Error deleting contact:', error);
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

  // Stats cards
  const StatCard = ({ label, value, icon: Icon, color }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-600">{label}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Contacts</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage your contacts and track relationships
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-lg hover:opacity-90 transition-opacity shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add Contact
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatCard
          label="Total Contacts"
          value={stats.total}
          icon={Users}
          color="bg-blue-50 text-blue-600"
        />
        <StatCard
          label="Decision Makers"
          value={stats.decisionMakers}
          icon={Users}
          color="bg-purple-50 text-purple-600"
        />
        <StatCard
          label="With Companies"
          value={stats.withCompanies}
          icon={Building2}
          color="bg-emerald-50 text-emerald-600"
        />
        <StatCard
          label="Opted In"
          value={stats.optedIn}
          icon={CheckCircle}
          color="bg-green-50 text-green-600"
        />
        <StatCard
          label="No Company"
          value={stats.withoutCompanies}
          icon={Building2}
          color="bg-gray-50 text-gray-600"
        />
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
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
        <div className="bg-white border border-gray-200 rounded-lg p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Company
            </label>
            <select
              value={filters.company_id}
              onChange={(e) => handleFilterChange('company_id', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none"
            >
              <option value="all">All Companies</option>
              {companies.map(company => (
                <option key={company.id} value={company.id}>
                  {company.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Decision Maker
            </label>
            <select
              value={filters.is_decision_maker}
              onChange={(e) => handleFilterChange('is_decision_maker', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none"
            >
              <option value="all">All</option>
              <option value="true">Decision Makers</option>
              <option value="false">Non-Decision Makers</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Consent Status
            </label>
            <select
              value={filters.consent_status}
              onChange={(e) => handleFilterChange('consent_status', e.target.value)}
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
      <ContactsTable
        contacts={contacts}
        loading={loading}
        onView={(contact) => openEditModal(contact)}
        onEdit={(contact) => openEditModal(contact)}
        onDelete={(contact) => {
          setLoading(true);
          setTimeout(() => {
            setContacts(prev => prev.filter(c => c.id !== contact.id));
            setLoading(false);
          }, 300);
        }}
        pagination={{
          currentPage: pagination.currentPage,
          totalPages: pagination.totalPages,
          total: pagination.total,
          limit: pagination.limit,
          filters: Object.fromEntries(
            Object.entries(filters).filter(([, v]) => v !== 'all')
          )
        }}
        onPageChange={handlePageChange}
        onSort={handleSort}
        sortField={sort.field}
        sortDirection={sort.direction}
      />

      {/* Contacts Form Modal */}
      {modalState.isOpen && (
        <ContactsForm
          mode={modalState.mode}
          contact={modalState.contact}
          onSave={handleSave}
          onCancel={closeModal}
          onDelete={handleDelete}
          loading={formLoading}
          companies={companies}
          owners={owners}
        />
      )}
    </div>
  );
};

export default Contacts;