import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { supabase } from '../services/api';

// Auth Store
export const useAuthStore = create(
    devtools(
        persist(
            (set, get) => ({
                user: null,
                session: null,
                loading: true,

                setUser: (user) => set({ user }),
                setSession: (session) => set({ session }),
                setLoading: (loading) => set({ loading }),

                login: async (email, password) => {
                    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
                    if (error) throw error;
                    set({ user: data.user, session: data.session });
                    return data;
                },

                register: async (email, password, name) => {
                    const { data, error } = await supabase.auth.admin.createUser({
                        email,
                        password,
                        email_confirm: true,
                        user_metadata: { full_name: name },
                    });
                    if (error) throw error;
                    return data;
                },

                logout: async () => {
                    await supabase.auth.signOut();
                    set({ user: null, session: null });
                },

                updateProfile: async (updates) => {
                    const { data, error } = await supabase.auth.updateUser({ data: updates });
                    if (error) throw error;
                    set({ user: data.user });
                    return data;
                },

                changePassword: async (newPassword) => {
                    const { error } = await supabase.auth.updateUser({ password: newPassword });
                    if (error) throw error;
                },

                initialize: async () => {
                    const { data: { session } } = await supabase.auth.getSession();
                    if (session) {
                        const { data: { user } } = await supabase.auth.getUser();
                        set({ user, session, loading: false });
                    } else {
                        set({ loading: false });
                    }

                    supabase.auth.onAuthStateChange((event, session) => {
                        set({ session, user: session?.user ?? null, loading: false });
                    });
                },
            }),
            {
                name: 'auth-storage',
                partialize: (state) => ({ user: state.user, session: state.session }),
            }
        ),
        { name: 'auth' }
    )
);

// Generic CRUD Store Factory
const createCrudStore = (entityName, tableName) => create(
    devtools(
        (set, get) => ({
            items: [],
            selectedItem: null,
            loading: false,
            error: null,
            pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
            filters: {},
            sort: { field: 'created_at', direction: 'desc' },

            fetchItems: async (params = {}) => {
                set({ loading: true, error: null });
                try {
                    const { page = 1, limit = 20, ...filters } = { ...get().filters, ...params };
                    const sort = get().sort;

                    let query = supabase.from(tableName).select('*', { count: 'exact' });

                    // Apply filters
                    Object.entries(filters).forEach(([key, value]) => {
                        if (value !== 'all' && value !== '') {
                            query = query.eq(key, value);
                        }
                    });

                    // Apply search
                    if (filters.search) {
                        const searchFields = getSearchFields(tableName);
                        query = query.or(searchFields.map(f => `${f}.ilike.%${filters.search}%`).join(','));
                    }

                    query = query
                        .order(sort.field, { ascending: sort.direction === 'asc' })
                        .range((page - 1) * limit, page * limit - 1);

                    const { data, error, count } = await query;

                    if (error) throw error;

                    set({
                        items: data || [],
                        pagination: { page, limit, total: count || 0, totalPages: Math.ceil((count || 0) / limit) },
                        loading: false,
                    });
                    return data;
                } catch (error) {
                    set({ error: error.message, loading: false });
                    throw error;
                }
            },

            fetchItem: async (id) => {
                set({ loading: true });
                try {
                    const { data, error } = await supabase
                        .from(tableName)
                        .select('*')
                        .eq('id', id)
                        .single();

                    if (error) throw error;
                    set({ selectedItem: data, loading: false });
                    return data;
                } catch (error) {
                    set({ error: error.message, loading: false });
                    throw error;
                }
            },

            createItem: async (itemData) => {
                set({ loading: true });
                try {
                    const { data, error } = await supabase
                        .from(tableName)
                        .insert({ ...itemData, created_at: new Date().toISOString() })
                        .select()
                        .single();

                    if (error) throw error;
                    set((state) => ({ items: [data, ...state.items], loading: false }));
                    return data;
                } catch (error) {
                    set({ error: error.message, loading: false });
                    throw error;
                }
            },

            updateItem: async (id, updates) => {
                set({ loading: true });
                try {
                    const { data, error } = await supabase
                        .from(tableName)
                        .update({ ...updates, updated_at: new Date().toISOString() })
                        .eq('id', id)
                        .select()
                        .single();

                    if (error) throw error;
                    set((state) => ({
                        items: state.items.map(item => item.id === id ? data : item),
                        selectedItem: state.selectedItem?.id === id ? data : state.selectedItem,
                        loading: false,
                    }));
                    return data;
                } catch (error) {
                    set({ error: error.message, loading: false });
                    throw error;
                }
            },

            deleteItem: async (id) => {
                set({ loading: true });
                try {
                    const { error } = await supabase
                        .from(tableName)
                        .update({ deleted_at: new Date().toISOString() })
                        .eq('id', id);

                    if (error) throw error;
                    set((state) => ({
                        items: state.items.filter(item => item.id !== id),
                        loading: false,
                    }));
                } catch (error) {
                    set({ error: error.message, loading: false });
                    throw error;
                }
            },

            setFilters: (filters) => set({ filters, pagination: { ...get().pagination, page: 1 } }),
            setSort: (sort) => set({ sort }),
            setPage: (page) => set({ pagination: { ...get().pagination, page } }),
            clearError: () => set({ error: null }),
            reset: () => set({ items: [], selectedItem: null, loading: false, error: null, pagination: { page: 1, limit: 20, total: 0, totalPages: 0 }, filters: {}, sort: { field: 'created_at', direction: 'desc' } }),
        }),
        { name: entityName }
    )
);

// Search fields for each table
const getSearchFields = (tableName) => {
    const fields = {
        leads: ['title', 'description', 'company', 'contact', 'email'],
        companies: ['name', 'domain', 'email', 'city'],
        contacts: ['first_name', 'last_name', 'email', 'phone', 'title'],
        deals: ['title', 'company', 'contact'],
        activities: ['title', 'notes', 'contact', 'company'],
    };
    return fields[tableName] || ['name'];
};

// Entity Stores
export const useLeadsStore = createCrudStore('leads', 'leads');
export const useCompaniesStore = createCrudStore('companies', 'companies');
export const useContactsStore = createCrudStore('contacts', 'contacts');
export const useDealsStore = createCrudStore('deals', 'deals');
export const useActivitiesStore = createCrudStore('activities', 'activities');

// UI Store
export const useUIStore = create(
    devtools(
        (set) => ({
            sidebarOpen: true,
            notifications: [],
            modals: {},

            toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
            setSidebarOpen: (open) => set({ sidebarOpen: open }),

            addNotification: (notification) => set((state) => ({
                notifications: [...state.notifications, { ...notification, id: Date.now() }]
            })),
            removeNotification: (id) => set((state) => ({
                notifications: state.notifications.filter(n => n.id !== id)
            })),

            openModal: (modalName, data = null) => set((state) => ({
                modals: { ...state.modals, [modalName]: { open: true, data } }
            })),
            closeModal: (modalName) => set((state) => {
                const newModals = { ...state.modals };
                delete newModals[modalName];
                return { modals: newModals };
            }),
            closeAllModals: () => set({ modals: {} }),
        }),
        { name: 'ui' }
    )
);

// Dashboard Stats Store
export const useDashboardStore = create(
    devtools(
        (set, get) => ({
            stats: null,
            pipelineByStage: [],
            leadsByStatus: [],
            monthlyTrends: [],
            teamPerformance: [],
            loading: false,

            fetchStats: async (days = 30) => {
                set({ loading: true });
                try {
                    // In real app, this would call an analytics API endpoint
                    // For now, we'll fetch from individual stores
                    const { data: leads } = await supabase.from('leads').select('status, temperature, estimated_value, created_at').is('deleted_at', null);
                    const { data: deals } = await supabase.from('deals').select('stage, value, probability, updated_at').is('deleted_at', null);
                    const { data: contacts } = await supabase.from('contacts').select('status, is_decision_maker').is('deleted_at', null);

                    const stats = {
                        totalLeads: leads?.length || 0,
                        qualifiedLeads: leads?.filter(l => l.status === 'qualified').length || 0,
                        activeDeals: deals?.filter(d => ['qualified', 'proposal', 'negotiation'].includes(d.stage)).length || 0,
                        wonDeals: deals?.filter(d => d.stage === 'won').length || 0,
                        lostDeals: deals?.filter(d => d.stage === 'lost').length || 0,
                        pipelineValue: deals?.filter(d => ['qualified', 'proposal', 'negotiation'].includes(d.stage)).reduce((sum, d) => sum + (parseFloat(d.value) || 0), 0) || 0,
                        weightedPipeline: deals?.filter(d => ['qualified', 'proposal', 'negotiation'].includes(d.stage)).reduce((sum, d) => sum + (parseFloat(d.value) || 0) * (parseFloat(d.probability) || 0) / 100, 0) || 0,
                        conversionRate: deals?.filter(d => d.stage === 'won').length && leads?.length ? ((deals.filter(d => d.stage === 'won').length / leads.length) * 100).toFixed(1) : 0,
                    };

                    set({ stats, loading: false });
                    return stats;
                } catch (error) {
                    set({ loading: false });
                    throw error;
                }
            },
        }),
        { name: 'dashboard' }
    )
);

// AI Store
export const useAIStore = create(
    devtools(
        (set, get) => ({
            history: [],
            usage: null,
            loading: false,

            generate: async (type, input, provider = 'openai', model = 'gpt-4o') => {
                set({ loading: true });
                try {
                    // Call backend AI endpoint
                    const response = await fetch('/api/v1/ai/generate', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ type, input, provider, model }),
                    });
                    const data = await response.json();
                    if (!response.ok) throw new Error(data.error || 'AI generation failed');

                    set((state) => ({
                        history: [data, ...state.history].slice(0, 50),
                        loading: false,
                    }));
                    return data;
                } catch (error) {
                    set({ loading: false });
                    throw error;
                }
            },

            fetchHistory: async () => {
                const { data, error } = await supabase.from('ai_results').select('*').order('created_at', { ascending: false }).limit(50);
                if (error) throw error;
                set({ history: data || [] });
            },

            fetchUsage: async () => {
                const { data, error } = await supabase.from('ai_results').select('type, provider, tokens_used, cost_usd');
                if (error) throw error;
                const usage = {
                    totalRequests: data?.length || 0,
                    totalTokens: data?.reduce((sum, r) => sum + (r.tokens_used || 0), 0) || 0,
                    totalCost: data?.reduce((sum, r) => sum + parseFloat(r.cost_usd || 0), 0) || 0,
                };
                set({ usage });
            },
        }),
        { name: 'ai' }
    )
);

// Export all stores
export const useStore = {
    auth: useAuthStore,
    leads: useLeadsStore,
    companies: useCompaniesStore,
    contacts: useContactsStore,
    deals: useDealsStore,
    activities: useActivitiesStore,
    ui: useUIStore,
    dashboard: useDashboardStore,
    ai: useAIStore,
};