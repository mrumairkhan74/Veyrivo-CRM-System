import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { supabase } from '../services/api';

// ============================================================
// Auth Store
// ============================================================
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

                    if (data.user) {
                        const { data: profile } = await supabase
                            .from('profiles')
                            .select('*')
                            .eq('id', data.user.id)
                            .single();

                        const userWithProfile = {
                            ...data.user,
                            role: profile?.role || 'user',
                            full_name: profile?.full_name || data.user.user_metadata?.full_name,
                        };

                        set({ user: userWithProfile, session: data.session });
                    } else {
                        set({ user: data.user, session: data.session });
                    }
                    return data;
                },

                loginWithGoogle: async () => {
                    const { data, error } = await supabase.auth.signInWithOAuth({
                        provider: 'google',
                        options: {
                            redirectTo: `${window.location.origin}/auth/callback`,
                        },
                    });
                    if (error) throw error;
                    return data;
                },

                register: async (email, password, name) => {
                    const { data, error } = await supabase.auth.signUp({
                        email,
                        password,
                        options: {
                            data: { full_name: name },
                        },
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

                fetchUserProfile: async (userId) => {
                    const { data: profile, error } = await supabase
                        .from('profiles')
                        .select('*')
                        .eq('id', userId)
                        .single();

                    if (!error && profile) {
                        set((state) => ({
                            user: state.user
                                ? { ...state.user, ...profile, role: profile.role || 'user' }
                                : null,
                        }));
                    }
                    return profile;
                },

                initialize: async () => {
                    const {
                        data: { session },
                    } = await supabase.auth.getSession();

                    if (session) {
                        const {
                            data: { user },
                        } = await supabase.auth.getUser();

                        if (user) {
                            const { data: profile } = await supabase
                                .from('profiles')
                                .select('*')
                                .eq('id', user.id)
                                .single();

                            const userWithProfile = {
                                ...user,
                                role: profile?.role || 'user',
                                full_name: profile?.full_name || user.user_metadata?.full_name,
                            };

                            set({ user: userWithProfile, session, loading: false });
                        } else {
                            set({ user: null, session, loading: false });
                        }
                    } else {
                        set({ loading: false });
                    }

                    // Synchronous callback — async work happens in a microtask
                    const {
                        data: { subscription },
                    } = supabase.auth.onAuthStateChange((event, session) => {
                        if (event === 'TOKEN_REFRESHED') {
                            set({ session });
                            return;
                        }

                        if (event === 'SIGNED_OUT') {
                            set({ user: null, session: null, loading: false });
                            return;
                        }

                        if (session?.user) {
                            queueMicrotask(async () => {
                                try {
                                    const { data: profile } = await supabase
                                        .from('profiles')
                                        .select('*')
                                        .eq('id', session.user.id)
                                        .single();

                                    const userWithProfile = {
                                        ...session.user,
                                        role: profile?.role || 'user',
                                        full_name:
                                            profile?.full_name ||
                                            session.user.user_metadata?.full_name,
                                    };

                                    set({ session, user: userWithProfile, loading: false });
                                } catch (err) {
                                    console.error(
                                        'Profile fetch in onAuthStateChange failed:',
                                        err
                                    );
                                    set({ session, user: session.user, loading: false });
                                }
                            });
                        } else {
                            set({ session: null, user: null, loading: false });
                        }
                    });

                    return subscription;
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

// ============================================================
// Search fields per table
// ============================================================
const SEARCH_FIELDS = {
    leads: ['title', 'description'],
    companies: ['name', 'domain', 'email', 'city'],
    contacts: ['first_name', 'last_name', 'email', 'phone', 'title'],
    deals: ['title', 'notes'],
    activities: ['title', 'notes', 'contact', 'company'],
};

const getSearchFields = (tableName) => SEARCH_FIELDS[tableName] || ['name'];

// Reserved query param keys that must never be treated as column filters
const RESERVED_KEYS = new Set(['page', 'limit', 'search', 'sort', 'order', 'select']);

// ============================================================
// Generic CRUD Store Factory
// ============================================================
const createCrudStore = (entityName, tableName) =>
    create(
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
                        const merged = { ...get().filters, ...params };
                        const page = merged.page ?? 1;
                        const limit = merged.limit ?? 20;
                        const search = merged.search;
                        const sort = get().sort;

                        // Everything that isn't a reserved control param is a column filter
                        const filters = Object.fromEntries(
                            Object.entries(merged).filter(([k]) => !RESERVED_KEYS.has(k))
                        );

                        let query = supabase.from(tableName).select('*', { count: 'exact' });

                        // Column filters — skip undefined/null/empty/'all'
                        Object.entries(filters).forEach(([key, value]) => {
                            if (value === undefined || value === null) return;
                            if (value === '' || value === 'all') return;
                            query = query.eq(key, value);
                        });

                        // Search across the table's searchable columns
                        const term = typeof search === 'string' ? search.trim() : '';
                        if (term && term !== 'undefined') {
                            const searchFields = getSearchFields(tableName);
                            query = query.or(
                                searchFields.map((f) => `${f}.ilike.%${term}%`).join(',')
                            );
                        }

                        query = query
                            .order(sort.field, { ascending: sort.direction === 'asc' })
                            .range((page - 1) * limit, page * limit - 1);

                        const { data, error, count } = await query;
                        if (error) throw error;

                        set({
                            items: data || [],
                            pagination: {
                                page,
                                limit,
                                total: count || 0,
                                totalPages: Math.ceil((count || 0) / limit),
                            },
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
                            .insert(itemData)
                            .select()
                            .single();

                        if (error) throw error;
                        set((state) => ({
                            items: [data, ...state.items],
                            loading: false,
                        }));
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
                            .update(updates)
                            .eq('id', id)
                            .select()
                            .single();

                        if (error) throw error;
                        set((state) => ({
                            items: state.items.map((item) =>
                                item.id === id ? data : item
                            ),
                            selectedItem:
                                state.selectedItem?.id === id
                                    ? data
                                    : state.selectedItem,
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
                            items: state.items.filter((item) => item.id !== id),
                            selectedItem:
                                state.selectedItem?.id === id ? null : state.selectedItem,
                            loading: false,
                        }));
                    } catch (error) {
                        set({ error: error.message, loading: false });
                        throw error;
                    }
                },

                setFilters: (filters) =>
                    set({
                        filters,
                        pagination: { ...get().pagination, page: 1 },
                    }),

                setSort: (sort) => {
                    if (typeof sort === 'string') {
                        const [field, direction] = sort.split(':');
                        set({
                            sort: {
                                field: field || 'created_at',
                                direction: direction === 'asc' ? 'asc' : 'desc',
                            },
                        });
                    } else if (sort && typeof sort === 'object') {
                        set({ sort });
                    }
                },

                setPage: (page) =>
                    set({ pagination: { ...get().pagination, page } }),

                setLimit: (limit) =>
                    set({
                        pagination: { ...get().pagination, limit, page: 1 },
                    }),

                clearError: () => set({ error: null }),

                reset: () =>
                    set({
                        items: [],
                        selectedItem: null,
                        loading: false,
                        error: null,
                        pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
                        filters: {},
                        sort: { field: 'created_at', direction: 'desc' },
                    }),
            }),
            { name: entityName }
        )
    );

// ============================================================
// Entity Stores
// ============================================================
export const useLeadsStore = createCrudStore('leads', 'leads');
export const useCompaniesStore = createCrudStore('companies', 'companies');
export const useContactsStore = createCrudStore('contacts', 'contacts');
export const useDealsStore = createCrudStore('deals', 'deals');
export const useActivitiesStore = createCrudStore('activities', 'activities');

// ============================================================
// Users Store (for team management)
// ============================================================
export const useUsersStore = create(
    devtools(
        (set, get) => ({
            users: [],
            loading: false,
            error: null,

            fetchUsers: async () => {
                set({ loading: true, error: null });
                try {
                    const { data, error } = await supabase
                        .from('profiles')
                        .select(
                            'id, email, full_name, role, avatar_url, created_at, last_sign_in_at'
                        )
                        .order('created_at', { ascending: false });

                    if (error) throw error;
                    set({ users: data || [], loading: false });
                    return data;
                } catch (error) {
                    set({ error: error.message, loading: false });
                    throw error;
                }
            },

            updateUserRole: async (userId, newRole) => {
                set({ loading: true });
                try {
                    const { error } = await supabase
                        .from('profiles')
                        .update({ role: newRole, updated_at: new Date().toISOString() })
                        .eq('id', userId);

                    if (error) throw error;
                    set((state) => ({
                        users: state.users.map((u) =>
                            u.id === userId ? { ...u, role: newRole } : u
                        ),
                        loading: false,
                    }));
                } catch (error) {
                    set({ error: error.message, loading: false });
                    throw error;
                }
            },

            removeUser: async (userId) => {
                set({ loading: true });
                try {
                    const { error } = await supabase
                        .from('profiles')
                        .delete()
                        .eq('id', userId);

                    if (error) throw error;
                    set((state) => ({
                        users: state.users.filter((u) => u.id !== userId),
                        loading: false,
                    }));
                } catch (error) {
                    set({ error: error.message, loading: false });
                    throw error;
                }
            },

            inviteUser: async (email, role) => {
                set({ loading: true });
                try {
                    const { error } = await supabase.auth.admin.inviteUserByEmail(email, {
                        data: { role },
                        redirectTo: `${window.location.origin}/login`,
                    });
                    if (error) throw error;
                    set({ loading: false });
                    await get().fetchUsers();
                } catch (error) {
                    set({ error: error.message, loading: false });
                    throw error;
                }
            },

            updateProfile: async (userId, updates) => {
                set({ loading: true });
                try {
                    const { data, error } = await supabase
                        .from('profiles')
                        .update({ ...updates, updated_at: new Date().toISOString() })
                        .eq('id', userId)
                        .select()
                        .single();

                    if (error) throw error;
                    set((state) => ({
                        users: state.users.map((u) =>
                            u.id === userId ? { ...u, ...data } : u
                        ),
                        loading: false,
                    }));
                    return data;
                } catch (error) {
                    set({ error: error.message, loading: false });
                    throw error;
                }
            },

            uploadAvatar: async (userId, file) => {
                set({ loading: true });
                try {
                    const fileName = `${userId}-${Date.now()}-${file.name}`;
                    const { error: uploadError } = await supabase.storage
                        .from('avatars')
                        .upload(fileName, file, { upsert: true });

                    if (uploadError) throw uploadError;

                    const { data: urlData } = supabase.storage
                        .from('avatars')
                        .getPublicUrl(fileName);
                    const avatarUrl = urlData.publicUrl;

                    const { error } = await supabase
                        .from('profiles')
                        .update({ avatar_url: avatarUrl, updated_at: new Date().toISOString() })
                        .eq('id', userId);

                    if (error) throw error;
                    set((state) => ({
                        users: state.users.map((u) =>
                            u.id === userId ? { ...u, avatar_url: avatarUrl } : u
                        ),
                        loading: false,
                    }));
                    return avatarUrl;
                } catch (error) {
                    set({ error: error.message, loading: false });
                    throw error;
                }
            },

            changePassword: async (newPassword) => {
                set({ loading: true });
                try {
                    const { error } = await supabase.auth.updateUser({
                        password: newPassword,
                    });
                    if (error) throw error;
                    set({ loading: false });
                } catch (error) {
                    set({ error: error.message, loading: false });
                    throw error;
                }
            },

            clearError: () => set({ error: null }),
        }),
        { name: 'users' }
    )
);

// ============================================================
// UI Store
// ============================================================
export const useUIStore = create(
    devtools(
        (set) => ({
            sidebarOpen: true,
            notifications: [],
            modals: {},

            toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
            setSidebarOpen: (open) => set({ sidebarOpen: open }),

            addNotification: (notification) =>
                set((state) => ({
                    notifications: [
                        ...state.notifications,
                        { ...notification, id: Date.now() },
                    ],
                })),

            removeNotification: (id) =>
                set((state) => ({
                    notifications: state.notifications.filter((n) => n.id !== id),
                })),

            openModal: (modalName, data = null) =>
                set((state) => ({
                    modals: { ...state.modals, [modalName]: { open: true, data } },
                })),

            closeModal: (modalName) =>
                set((state) => {
                    const newModals = { ...state.modals };
                    delete newModals[modalName];
                    return { modals: newModals };
                }),

            closeAllModals: () => set({ modals: {} }),
        }),
        { name: 'ui' }
    )
);

// ============================================================
// Dashboard Stats Store
// ============================================================
export const useDashboardStore = create(
    devtools(
        (set) => ({
            stats: null,
            pipelineByStage: [],
            leadsByStatus: [],
            leadsBySource: [],
            monthlyTrends: [],
            teamPerformance: [],
            servicePerformance: [],
            leadsByTemperature: [],
            loading: false,

            fetchStats: async (days = 30) => {
                set({ loading: true });
                try {
                    const { data: leads } = await supabase
                        .from('leads')
                        .select('status, temperature, estimated_value, created_at')
                        .is('deleted_at', null);

                    const { data: deals } = await supabase
                        .from('deals')
                        .select('stage, value, probability, updated_at')
                        .is('deleted_at', null);

                    const { data: contacts } = await supabase
                        .from('contacts')
                        .select('status, is_decision_maker')
                        .is('deleted_at', null);

                    const stats = {
                        totalLeads: leads?.length || 0,
                        qualifiedLeads:
                            leads?.filter((l) => l.status === 'qualified').length || 0,
                        activeDeals:
                            deals?.filter((d) =>
                                ['qualified', 'proposal', 'negotiation'].includes(d.stage)
                            ).length || 0,
                        wonDeals: deals?.filter((d) => d.stage === 'won').length || 0,
                        lostDeals: deals?.filter((d) => d.stage === 'lost').length || 0,
                        pipelineValue:
                            deals
                                ?.filter((d) =>
                                    ['qualified', 'proposal', 'negotiation'].includes(d.stage)
                                )
                                .reduce((sum, d) => sum + (parseFloat(d.value) || 0), 0) || 0,
                        weightedPipeline:
                            deals
                                ?.filter((d) =>
                                    ['qualified', 'proposal', 'negotiation'].includes(d.stage)
                                )
                                .reduce(
                                    (sum, d) =>
                                        sum +
                                        ((parseFloat(d.value) || 0) *
                                            (parseFloat(d.probability) || 0)) /
                                        100,
                                    0
                                ) || 0,
                        conversionRate:
                            deals?.filter((d) => d.stage === 'won').length && leads?.length
                                ? (
                                    (deals.filter((d) => d.stage === 'won').length /
                                        leads.length) *
                                    100
                                ).toFixed(1)
                                : 0,
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

// ============================================================
// AI Store
// ============================================================
export const useAIStore = create(
    devtools(
        (set) => ({
            history: [],
            usage: null,
            loading: false,

            generate: async (type, input, provider = 'openai', model = 'gpt-4o') => {
                set({ loading: true });
                try {
                    // Always read the token from Supabase — the Zustand snapshot
                    // may be stale if the session refreshed since initialize() ran.
                    const { data: { session }, error: sessionError } =
                        await supabase.auth.getSession();

                    if (sessionError) throw sessionError;

                    const token = session?.access_token;
                    if (!token) {
                        throw new Error('Not authenticated. Please log in again.');
                    }

                    const response = await fetch('/api/v1/ai/generate', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${token}`,
                        },
                        body: JSON.stringify({ type, input, provider, model }),
                    });

                    // Read as text first — the server may return HTML on failure,
                    // which would make response.json() throw a confusing error.
                    const raw = await response.text();
                    let data;
                    try {
                        data = raw ? JSON.parse(raw) : {};
                    } catch {
                        data = { error: raw || `HTTP ${response.status}` };
                    }

                    if (!response.ok) {
                        const msg =
                            data?.error ||
                            data?.message ||
                            `AI request failed (${response.status})`;
                        throw new Error(msg);
                    }

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
                const { data, error } = await supabase
                    .from('ai_results')
                    .select('*')
                    .order('created_at', { ascending: false })
                    .limit(50);
                if (error) throw error;
                set({ history: data || [] });
            },

            fetchUsage: async () => {
                const { data, error } = await supabase
                    .from('ai_results')
                    .select('type, provider, tokens_used, cost_usd');
                if (error) throw error;

                const usage = {
                    totalRequests: data?.length || 0,
                    totalTokens:
                        data?.reduce((sum, r) => sum + (r.tokens_used || 0), 0) || 0,
                    totalCost:
                        data?.reduce(
                            (sum, r) => sum + parseFloat(r.cost_usd || 0),
                            0
                        ) || 0,
                };
                set({ usage });
            },
        }),
        { name: 'ai' }
    )
);

// ============================================================
// Export all stores
// ============================================================
export const useStore = {
    auth: useAuthStore,
    leads: useLeadsStore,
    companies: useCompaniesStore,
    contacts: useContactsStore,
    deals: useDealsStore,
    activities: useActivitiesStore,
    users: useUsersStore,
    ui: useUIStore,
    dashboard: useDashboardStore,
    ai: useAIStore,
};