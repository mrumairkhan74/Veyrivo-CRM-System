// Custom hooks for easier store access
import { useAuthStore, useLeadsStore, useCompaniesStore, useContactsStore, useDealsStore, useActivitiesStore, useUIStore, useDashboardStore, useAIStore } from './index';

// Auth hooks
export const useAuth = () => {
    const { user, session, loading, login, logout, register, updateProfile, changePassword, initialize } = useAuthStore();
    return { user, session, loading, login, logout, register, updateProfile, changePassword, initialize };
};

// CRUD hooks
export const useLeads = () => {
    const store = useLeadsStore();
    return {
        leads: store.items,
        selectedLead: store.selectedItem,
        loading: store.loading,
        error: store.error,
        pagination: store.pagination,
        filters: store.filters,
        sort: store.sort,
        fetchLeads: store.fetchItems,
        fetchLead: store.fetchItem,
        createLead: store.createItem,
        updateLead: store.updateItem,
        deleteLead: store.deleteItem,
        setFilters: store.setFilters,
        setSort: store.setSort,
        setPage: store.setPage,
        clearError: store.clearError,
        reset: store.reset,
    };
};

export const useCompanies = () => {
    const store = useCompaniesStore();
    return {
        companies: store.items,
        selectedCompany: store.selectedItem,
        loading: store.loading,
        error: store.error,
        pagination: store.pagination,
        filters: store.filters,
        sort: store.sort,
        fetchCompanies: store.fetchItems,
        fetchCompany: store.fetchItem,
        createCompany: store.createItem,
        updateCompany: store.updateItem,
        deleteCompany: store.deleteItem,
        setFilters: store.setFilters,
        setSort: store.setSort,
        setPage: store.setPage,
        clearError: store.clearError,
        reset: store.reset,
    };
};

export const useContacts = () => {
    const store = useContactsStore();
    return {
        contacts: store.items,
        selectedContact: store.selectedItem,
        loading: store.loading,
        error: store.error,
        pagination: store.pagination,
        filters: store.filters,
        sort: store.sort,
        fetchContacts: store.fetchItems,
        fetchContact: store.fetchItem,
        createContact: store.createItem,
        updateContact: store.updateItem,
        deleteContact: store.deleteItem,
        setFilters: store.setFilters,
        setSort: store.setSort,
        setPage: store.setPage,
        clearError: store.clearError,
        reset: store.reset,
    };
};

export const useDeals = () => {
    const store = useDealsStore();
    return {
        deals: store.items,
        selectedDeal: store.selectedItem,
        loading: store.loading,
        error: store.error,
        pagination: store.pagination,
        filters: store.filters,
        sort: store.sort,
        fetchDeals: store.fetchItems,
        fetchDeal: store.fetchItem,
        createDeal: store.createItem,
        updateDeal: store.updateItem,
        deleteDeal: store.deleteItem,
        setFilters: store.setFilters,
        setSort: store.setSort,
        setPage: store.setPage,
        clearError: store.clearError,
        reset: store.reset,
    };
};

export const useActivities = () => {
    const store = useActivitiesStore();
    return {
        activities: store.items,
        selectedActivity: store.selectedItem,
        loading: store.loading,
        error: store.error,
        pagination: store.pagination,
        filters: store.filters,
        sort: store.sort,
        fetchActivities: store.fetchItems,
        fetchActivity: store.fetchItem,
        createActivity: store.createItem,
        updateActivity: store.updateItem,
        deleteActivity: store.deleteItem,
        setFilters: store.setFilters,
        setSort: store.setSort,
        setPage: store.setPage,
        clearError: store.clearError,
        reset: store.reset,
    };
};

// UI hooks
export const useUI = () => {
    const { sidebarOpen, notifications, modals, toggleSidebar, setSidebarOpen, addNotification, removeNotification, openModal, closeModal, closeAllModals } = useUIStore();
    return { sidebarOpen, notifications, modals, toggleSidebar, setSidebarOpen, addNotification, removeNotification, openModal, closeModal, closeAllModals };
};

// Dashboard hooks
export const useDashboard = () => {
    const { stats, pipelineByStage, leadsByStatus, monthlyTrends, teamPerformance, loading, fetchStats } = useDashboardStore();
    return { stats, pipelineByStage, leadsByStatus, monthlyTrends, teamPerformance, loading, fetchStats };
};

// AI hooks
export const useAI = () => {
    const { history, usage, loading, generate, fetchHistory, fetchUsage } = useAIStore();
    return { history, usage, loading, generate, fetchHistory, fetchUsage };
};