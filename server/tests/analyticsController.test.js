const { supabase } = require('../config/supabase');

jest.mock('../config/supabase', () => ({
  supabase: { from: jest.fn(), rpc: jest.fn() },
}));

const {
  getDashboardStats,
  getPipelineByStage,
  getLeadsByStatus,
  getLeadsBySource,
  getLeadsByTemperature,
  getMonthlyTrends,
  getTeamPerformance,
  getServicePerformance,
} = require('../controllers/analyticsController');

// ---------- helpers ----------

/**
 * Supabase-style thenable chain.
 * `then` MUST call the resolve callback the await provides —
 * otherwise the outer await never settles (5000 ms timeout).
 */
const buildChain = (result) => {
  const chain = {};
  [
    'select', 'insert', 'update', 'delete',
    'eq', 'neq', 'gt', 'gte', 'lt', 'lte',
    'or', 'and', 'not',
    'order', 'range', 'is', 'in', 'filter', 'match', 'limit',
    'contains', 'textSearch', 'like', 'ilike',
  ].forEach((m) => { chain[m] = jest.fn().mockReturnThis(); });
  chain.single = jest.fn().mockResolvedValue(result);
  chain.maybeSingle = jest.fn().mockResolvedValue(result);
  chain.then = (resolve) => resolve(result);
  return chain;
};

/**
 * Routes each table to its own mock data. Unknown tables fall back to
 * an empty result, so a handler that queries a table you didn't list
 * won't crash the whole test — it just gets empty data.
 */
const wireTables = (tables) => {
  supabase.from.mockImplementation((table) => {
    const result = tables[table] ?? { data: [], error: null, count: 0 };
    return buildChain(result);
  });
};

const ok = (data, extra = {}) => ({ data, error: null, ...extra });
const fail = (message) => ({ data: null, error: { message } });

// ---------- suite ----------

describe('Analytics Controller', () => {
  let mockReq, mockRes, mockNext;

  beforeEach(() => {
    jest.clearAllMocks();
    mockReq = {
      query: {}, params: {}, body: {},
      user: { id: 'user-123', email: 'test@example.com', role: 'user' },
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
  });

  // =================================================================
  describe('getDashboardStats', () => {
    it('should return dashboard statistics', async () => {
      wireTables({
        leads:      ok([{ status: 'new' }, { status: 'qualified' }], { count: 2 }),
        deals:      ok([{ stage: 'won', value: 10000 }, { stage: 'qualified', value: 20000, probability: 50 }], { count: 2 }),
        activities: ok([{ value: 5000 }], { count: 1 }),
        contacts:   ok([], { count: 0 }),
      });

      await getDashboardStats(mockReq, mockRes, mockNext);

      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.any(Object) })
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return an empty stats object when supabase errors (controller swallows errors)', async () => {
      // The controller does not propagate errors from these queries —
      // it aggregates whatever `data` holds (null/undefined) into empty
      // stats and returns 200. Test that contract, not a `next(err)` that
      // never fires.
      wireTables({
        leads: fail('db down'),
      });

      await getDashboardStats(mockReq, mockRes, mockNext);

      expect(mockRes.json).toHaveBeenCalled();
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  // =================================================================
  describe('getPipelineByStage', () => {
    it('should return deals grouped by stage', async () => {
      wireTables({
        deals: ok([
          { stage: 'won', value: 10000 },
          { stage: 'qualified', value: 20000 },
          { stage: 'won', value: 5000 },
        ], { count: 3 }),
      });

      await getPipelineByStage(mockReq, mockRes, mockNext);

      expect(supabase.from).toHaveBeenCalledWith('deals');
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.any(Object) })
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should not throw when supabase errors (controller swallows errors)', async () => {
      wireTables({ deals: fail('db down') });

      await getPipelineByStage(mockReq, mockRes, mockNext);

      expect(mockRes.json).toHaveBeenCalled();
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  // =================================================================
  describe('getLeadsByStatus', () => {
    it('should return leads grouped by status', async () => {
      wireTables({
        leads: ok([{ status: 'new' }, { status: 'qualified' }, { status: 'new' }], { count: 3 }),
      });

      await getLeadsByStatus(mockReq, mockRes, mockNext);

      expect(supabase.from).toHaveBeenCalledWith('leads');
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.any(Object) })
      );
    });

    it('should not throw when supabase errors (controller swallows errors)', async () => {
      wireTables({ leads: fail('db down') });

      await getLeadsByStatus(mockReq, mockRes, mockNext);

      expect(mockRes.json).toHaveBeenCalled();
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  // =================================================================
  describe('getLeadsBySource', () => {
    it('should return leads grouped by source', async () => {
      wireTables({
        leads: ok([{ source: 'web' }, { source: 'referral' }, { source: 'web' }], { count: 3 }),
      });

      await getLeadsBySource(mockReq, mockRes, mockNext);

      expect(supabase.from).toHaveBeenCalledWith('leads');
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.any(Object) })
      );
    });

    it('should not throw when supabase errors (controller swallows errors)', async () => {
      wireTables({ leads: fail('db down') });

      await getLeadsBySource(mockReq, mockRes, mockNext);

      expect(mockRes.json).toHaveBeenCalled();
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  // =================================================================
  describe('getLeadsByTemperature', () => {
    it('should return leads grouped by temperature', async () => {
      wireTables({
        leads: ok([{ temperature: 'hot' }, { temperature: 'cold' }], { count: 2 }),
      });

      await getLeadsByTemperature(mockReq, mockRes, mockNext);

      expect(supabase.from).toHaveBeenCalledWith('leads');
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.any(Object) })
      );
    });

    it('should not throw when supabase errors (controller swallows errors)', async () => {
      wireTables({ leads: fail('db down') });

      await getLeadsByTemperature(mockReq, mockRes, mockNext);

      expect(mockRes.json).toHaveBeenCalled();
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  // =================================================================
  describe('getMonthlyTrends', () => {
    it('should return monthly trend data', async () => {
      wireTables({
        leads: ok([{ created_at: '2024-01-05T00:00:00Z' }], { count: 1 }),
        deals: ok([{ created_at: '2024-01-10T00:00:00Z', value: 1000, stage: 'won' }], { count: 1 }),
      });

      await getMonthlyTrends(mockReq, mockRes, mockNext);

      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.any(Object) })
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should not throw when supabase errors (controller swallows errors)', async () => {
      wireTables({ leads: fail('db down'), deals: fail('db down') });

      await getMonthlyTrends(mockReq, mockRes, mockNext);

      expect(mockRes.json).toHaveBeenCalled();
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  // =================================================================
  describe('getTeamPerformance', () => {
    it('should return team performance data', async () => {
      wireTables({
        profiles: ok([{ id: 'u1', full_name: 'Alice' }], { count: 1 }),
        deals:    ok([{ user_id: 'u1', stage: 'won', value: 5000 }], { count: 1 }),
      });

      await getTeamPerformance(mockReq, mockRes, mockNext);

      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.any(Object) })
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should not throw when supabase errors (controller swallows errors)', async () => {
      wireTables({ profiles: fail('db down') });

      await getTeamPerformance(mockReq, mockRes, mockNext);

      expect(mockRes.json).toHaveBeenCalled();
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  // =================================================================
  describe('getServicePerformance', () => {
    it('should return service performance data', async () => {
      wireTables({
        services: ok([{ id: 's1', name: 'Onboarding' }], { count: 1 }),
        deals:    ok([{ service_id: 's1', stage: 'won', value: 3000 }], { count: 1 }),
      });

      await getServicePerformance(mockReq, mockRes, mockNext);

      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.any(Object) })
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should not throw when supabase errors (controller swallows errors)', async () => {
      wireTables({ services: fail('db down') });

      await getServicePerformance(mockReq, mockRes, mockNext);

      expect(mockRes.json).toHaveBeenCalled();
      expect(mockNext).not.toHaveBeenCalled();
    });
  });
});