import { act } from '@testing-library/react';
import { useAuthStore } from '../store';
import { useLeadsStore } from '../store';
import { useCompaniesStore } from '../store';
import { useContactsStore } from '../store';
import { useDealsStore } from '../store';
import { useActivitiesStore } from '../store';
import { useUIStore } from '../store';
import { useDashboardStore } from '../store';
import { useAIStore } from '../store';

// Mock Supabase
vi.mock('../../services/api', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      or: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      range: vi.fn().mockReturnThis(),
      single: vi.fn(),
      is: vi.fn().mockReturnThis(),
      then: vi.fn().mockResolvedValue({ data: [], error: null, count: 0 }),
    })),
    auth: {
      signInWithPassword: vi.fn().mockResolvedValue({ data: { user: { id: '1' }, session: {} }, error: null }),
      signUp: vi.fn().mockResolvedValue({ data: { user: { id: '1' }, session: {} }, error: null }),
      signInWithOAuth: vi.fn().mockResolvedValue({ data: {}, error: null }),
      signOut: vi.fn().mockResolvedValue({ error: null }),
      getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
      getUser: vi.fn().mockResolvedValue({ data: { user: { id: '1' } } }),
      updateUser: vi.fn().mockResolvedValue({ data: { user: { id: '1' } }, error: null }),
      onAuthStateChange: vi.fn((cb) => cb('SIGNED_IN', { user: { id: '1' } })),
    },
    storage: {
      from: vi.fn(() => ({
        upload: vi.fn().mockResolvedValue({ data: { path: 'avatar.png' }, error: null }),
        getPublicUrl: vi.fn().mockReturnValue({ data: { publicUrl: 'https://example.com/avatar.png' } }),
      })),
    },
  },
}));

describe('Auth Store', () => {
  beforeEach(() => {
    // Reset store
    act(() => {
      useAuthStore.getState().logout();
    });
    vi.clearAllMocks();
  });

  it('initializes with correct default state', () => {
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.session).toBeNull();
    expect(state.loading).toBe(true);
  });

  it('sets user and session on login', async () => {
    const { login } = useAuthStore.getState();
    const result = await login('test@example.com', 'password123');
    
    expect(result).toEqual({ user: { id: '1' }, session: {} });
    expect(useAuthStore.getState().user).toEqual({ id: '1' });
    expect(useAuthStore.getState().session).toEqual({});
  });

  it('clears user on logout', async () => {
    const { login, logout } = useAuthStore.getState();
    
    // First login
    await login('test@example.com', 'password123');
    expect(useAuthStore.getState().user).not.toBeNull();
    
    // Then logout
    await logout();
    expect(useAuthStore.getState().user).toBeNull();
    expect(useAuthStore.getState().session).toBeNull();
  });

  it('persists user in localStorage', async () => {
    const { login } = useAuthStore.getState();
    await login('test@example.com', 'password123');
    
    // Check localStorage
    const stored = localStorage.getItem('auth-storage');
    expect(stored).toBeTruthy();
    const parsed = JSON.parse(stored);
    expect(parsed.state.user).toEqual({ id: '1' });
  });
});

describe('Leads Store', () => {
  beforeEach(() => {
    act(() => {
      useLeadsStore.getState().reset();
    });
    vi.clearAllMocks();
  });

  it('initializes with correct default state', () => {
    const state = useLeadsStore.getState();
    expect(state.items).toEqual([]);
    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();
    expect(state.pagination).toEqual({ page: 1, limit: 20, total: 0, totalPages: 0 });
  });

  it('fetches leads and updates state', async () => {
    const { fetchLeads } = useLeadsStore.getState();
    const leads = await fetchLeads();
    
    expect(Array.isArray(leads)).toBe(true);
    expect(useLeadsStore.getState().items).toEqual([]);
    expect(useLeadsStore.getState().loading).toBe(false);
  });

  it('sets filters and resets page', async () => {
    const { setFilters } = useLeadsStore.getState();
    
    act(() => {
      setFilters({ status: 'new', temperature: 'hot' });
    });
    
    const state = useLeadsStore.getState();
    expect(state.filters.status).toBe('new');
    expect(state.filters.temperature).toBe('hot');
    expect(state.pagination.page).toBe(1);
  });

  it('sets sort and resets page', async () => {
    const { setSort } = useLeadsStore.getState();
    
    act(() => {
      setSort({ field: 'created_at', direction: 'asc' });
    });
    
    const state = useLeadsStore.getState();
    expect(state.sort.field).toBe('created_at');
    expect(state.sort.direction).toBe('asc');
  });
});

describe('Companies Store', () => {
  beforeEach(() => {
    act(() => {
      useCompaniesStore.getState().reset();
    });
    vi.clearAllMocks();
  });

  it('fetches companies with filters', async () => {
    const { fetchCompanies } = useCompaniesStore.getState();
    await fetchCompanies();
    
    expect(useCompaniesStore.getState().loading).toBe(false);
  });
});

describe('UI Store', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('toggles sidebar', () => {
    const { sidebarOpen, toggleSidebar, setSidebarOpen } = useUIStore.getState();
    
    expect(sidebarOpen).toBe(true);
    
    act(() => { toggleSidebar(); });
    expect(useUIStore.getState().sidebarOpen).toBe(false);
    
    act(() => { setSidebarOpen(true); });
    expect(useUIStore.getState().sidebarOpen).toBe(true);
  });

  it('manages notifications', () => {
    const { notifications, addNotification, removeNotification } = useUIStore.getState();
    
    expect(notifications).toEqual([]);
    
    act(() => {
      addNotification({ type: 'success', message: 'Test notification' });
    });
    
    expect(useUIStore.getState().notifications).toHaveLength(1);
    expect(useUIStore.getState().notifications[0].message).toBe('Test notification');
    
    const id = useUIStore.getState().notifications[0].id;
    act(() => { removeNotification(id); });
    
    expect(useUIStore.getState().notifications).toHaveLength(0);
  });

  it('manages modals', () => {
    const { modals, openModal, closeModal, closeAllModals } = useUIStore.getState();
    
    expect(modals).toEqual({});
    
    act(() => { openModal('testModal', { id: 123 }); });
    expect(useUIStore.getState().modals.testModal).toEqual({ open: true, data: { id: 123 } });
    
    act(() => { closeModal('testModal'); });
    expect(useUIStore.getState().modals.testModal).toBeUndefined();
  });
});

describe('Dashboard Store', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches dashboard stats', async () => {
    const { fetchStats } = useDashboardStore.getState();
    const stats = await fetchStats(30);
    
    expect(stats).toHaveProperty('totalLeads');
    expect(stats).toHaveProperty('activeDeals');
    expect(stats).toHaveProperty('pipelineValue');
    expect(stats).toHaveProperty('conversionRate');
    expect(useDashboardStore.getState().loading).toBe(false);
  });
});

describe('AI Store', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('generates AI response', async () => {
    const { generate } = useAIStore.getState();
    
    const response = await generate('leadGeneration', { industry: 'SaaS' });
    
    expect(response).toHaveProperty('leads');
    expect(Array.isArray(response.leads)).toBe(true);
    expect(useAIStore.getState().loading).toBe(false);
  });

  it('tracks history', async () => {
    const { generate, history } = useAIStore.getState();
    
    await generate('leadQualification', { company: 'Test Corp' });
    
    expect(useAIStore.getState().history.length).toBeGreaterThan(0);
    expect(useAIStore.getState().history[0]).toHaveProperty('type', 'leadQualification');
  });
});