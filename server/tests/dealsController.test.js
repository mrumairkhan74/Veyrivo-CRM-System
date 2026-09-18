const { supabase } = require('../config/supabase');

jest.mock('../config/supabase', () => ({
  supabase: { from: jest.fn(), rpc: jest.fn() },
}));

const {
  getDeals,
  getDeal,
  createDeal,
  updateDeal,
  deleteDeal,
  getDealStats,
} = require('../controllers/dealsController');

// ---------- helpers ----------

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

const ok = (data, extra = {}) => ({ data, error: null, ...extra });
const fail = (message, code) => ({
  data: null,
  error: code ? { message, code } : { message },
});

// ---------- suite ----------

describe('Deals Controller', () => {
  let mockReq, mockRes, mockNext;

  beforeEach(() => {
    jest.clearAllMocks();
    mockReq = {
      body: {}, params: {}, query: {},
      user: { id: 'user-123' },
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
  });

  // =================================================================
  describe('getDeals', () => {
    it('should fetch deals with pagination', async () => {
      const mockDeals = [{ id: 'deal-1', title: 'Deal 1', value: 10000 }];

      supabase.from.mockReturnValue(buildChain(ok(mockDeals, { count: 1 })));

      mockReq.query = { page: '1', limit: '10' };

      await getDeals(mockReq, mockRes, mockNext);

      expect(supabase.from).toHaveBeenCalledWith('deals');
      expect(mockRes.json).toHaveBeenCalledWith({
        data: mockDeals,
        pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should apply default pagination when none provided', async () => {
      supabase.from.mockReturnValue(buildChain(ok([], { count: 0 })));

      mockReq.query = {};

      await getDeals(mockReq, mockRes, mockNext);

      expect(mockRes.json).toHaveBeenCalledWith({
        data: [],
        pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
      });
    });

    it('should cap limit at 100', async () => {
      supabase.from.mockReturnValue(buildChain(ok([], { count: 0 })));

      mockReq.query = { page: '1', limit: '500' };

      await getDeals(mockReq, mockRes, mockNext);

      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          pagination: expect.objectContaining({ limit: 100 }),
        })
      );
    });

    it('should apply stage, owner, and search filters', async () => {
      const chain = buildChain(ok([], { count: 0 }));
      supabase.from.mockReturnValue(chain);

      mockReq.query = {
        stage: 'qualified',
        owner_id: 'owner-1',
        company_id: 'comp-1',
        search: 'acme',
        sortBy: 'value',
        sortOrder: 'asc',
      };

      await getDeals(mockReq, mockRes, mockNext);

      expect(chain.eq).toHaveBeenCalledWith('stage', 'qualified');
      expect(chain.eq).toHaveBeenCalledWith('owner_id', 'owner-1');
      expect(chain.eq).toHaveBeenCalledWith('company_id', 'comp-1');
      expect(chain.or).toHaveBeenCalledWith(
        'title.ilike.%acme%,company.ilike.%acme%'
      );
      expect(chain.order).toHaveBeenCalledWith('value', { ascending: true });
      expect(chain.is).toHaveBeenCalledWith('deleted_at', null);
    });

    it('should pass an error to next() on supabase failure', async () => {
      supabase.from.mockReturnValue(buildChain(fail('db down')));

      mockReq.query = {};

      await getDeals(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Object));
      const error = mockNext.mock.calls[0][0];
      expect(error.message).toBe('db down');
      expect(error.statusCode).toBe(400);
    });
  });

  // =================================================================
  describe('getDeal', () => {
    it('should return a single deal', async () => {
      const deal = { id: 'deal-1', title: 'Deal 1', activities: [] };

      supabase.from.mockReturnValue(buildChain(ok(deal)));

      mockReq.params = { id: 'deal-1' };

      await getDeal(mockReq, mockRes, mockNext);

      expect(supabase.from).toHaveBeenCalledWith('deals');
      expect(mockRes.json).toHaveBeenCalledWith({ data: deal });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 404 when deal is not found (PGRST116)', async () => {
      supabase.from.mockReturnValue(
        buildChain(fail('No rows found', 'PGRST116'))
      );

      mockReq.params = { id: 'missing' };

      await getDeal(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Object));
      const error = mockNext.mock.calls[0][0];
      expect(error.message).toBe('Deal not found');
      expect(error.statusCode).toBe(404);
    });

    it('should return 400 for other supabase errors', async () => {
      supabase.from.mockReturnValue(buildChain(fail('db down')));

      mockReq.params = { id: 'deal-1' };

      await getDeal(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Object));
      const error = mockNext.mock.calls[0][0];
      expect(error.statusCode).toBe(400);
    });
  });

  // =================================================================
  describe('createDeal', () => {
    it('should create a new deal', async () => {
      const created = { id: 'deal-new', title: 'New Deal', value: 5000 };

      supabase.from.mockReturnValue(buildChain(ok(created)));

      mockReq.body = { title: 'New Deal', value: 5000, stage: 'new' };

      await createDeal(mockReq, mockRes, mockNext);

      expect(supabase.from).toHaveBeenCalledWith('deals');
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        data: created,
        message: 'Deal created successfully',
      });
    });

    it('should default owner_id to the current user', async () => {
      const chain = buildChain(ok({ id: 'deal-new' }));
      supabase.from.mockReturnValue(chain);

      mockReq.body = { title: 'New Deal' };

      await createDeal(mockReq, mockRes, mockNext);

      expect(chain.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          organization_id: 'user-123',
          owner_id: 'user-123',
        })
      );
    });

    it('should respect an explicit owner_id', async () => {
      const chain = buildChain(ok({ id: 'deal-new' }));
      supabase.from.mockReturnValue(chain);

      mockReq.body = { title: 'New Deal', owner_id: 'owner-456' };

      await createDeal(mockReq, mockRes, mockNext);

      expect(chain.insert).toHaveBeenCalledWith(
        expect.objectContaining({ owner_id: 'owner-456' })
      );
    });

    it('should pass an error to next() on supabase failure', async () => {
      supabase.from.mockReturnValue(buildChain(fail('insert failed')));

      mockReq.body = { title: 'New Deal' };

      await createDeal(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Object));
      const error = mockNext.mock.calls[0][0];
      expect(error.statusCode).toBe(400);
    });
  });

  // =================================================================
  describe('updateDeal', () => {
    it('should update a deal', async () => {
      const updated = { id: 'deal-1', title: 'Updated Deal', stage: 'won' };

      supabase.from.mockReturnValue(buildChain(ok(updated)));

      mockReq.params = { id: 'deal-1' };
      mockReq.body = { title: 'Updated Deal', stage: 'won' };

      await updateDeal(mockReq, mockRes, mockNext);

      expect(supabase.from).toHaveBeenCalledWith('deals');
      expect(mockRes.json).toHaveBeenCalledWith({
        data: updated,
        message: 'Deal updated successfully',
      });
    });

    it('should include updated_at in the update payload', async () => {
      const chain = buildChain(ok({ id: 'deal-1' }));
      supabase.from.mockReturnValue(chain);

      mockReq.params = { id: 'deal-1' };
      mockReq.body = { title: 'x' };

      await updateDeal(mockReq, mockRes, mockNext);

      expect(chain.update).toHaveBeenCalledWith(
        expect.objectContaining({ updated_at: expect.any(String) })
      );
    });

    it('should return 404 when deal is not found (PGRST116)', async () => {
      supabase.from.mockReturnValue(
        buildChain(fail('No rows found', 'PGRST116'))
      );

      mockReq.params = { id: 'missing' };
      mockReq.body = { title: 'x' };

      await updateDeal(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Object));
      const error = mockNext.mock.calls[0][0];
      expect(error.statusCode).toBe(404);
      expect(error.message).toBe('Deal not found');
    });

    it('should pass an error to next() on other supabase failures', async () => {
      supabase.from.mockReturnValue(buildChain(fail('update failed')));

      mockReq.params = { id: 'deal-1' };
      mockReq.body = { title: 'x' };

      await updateDeal(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Object));
    });
  });

  // =================================================================
  describe('deleteDeal', () => {
    it('should soft-delete a deal', async () => {
      const chain = buildChain(ok(null));
      supabase.from.mockReturnValue(chain);

      mockReq.params = { id: 'deal-1' };

      await deleteDeal(mockReq, mockRes, mockNext);

      expect(supabase.from).toHaveBeenCalledWith('deals');
      expect(chain.update).toHaveBeenCalledWith(
        expect.objectContaining({ deleted_at: expect.any(String) })
      );
      expect(chain.eq).toHaveBeenCalledWith('id', 'deal-1');
      expect(chain.is).toHaveBeenCalledWith('deleted_at', null);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Deal deleted successfully',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should pass an error to next() on supabase failure', async () => {
      supabase.from.mockReturnValue(buildChain(fail('delete failed')));

      mockReq.params = { id: 'deal-1' };

      await deleteDeal(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Object));
      const error = mockNext.mock.calls[0][0];
      expect(error.statusCode).toBe(400);
    });
  });

  // =================================================================
  describe('getDealStats', () => {
    it('should return aggregated stats', async () => {
      const deals = [
        { stage: 'won',         value: 10000, probability: 100 },
        { stage: 'qualified',   value: 20000, probability: 50  },
        { stage: 'qualified',   value: 5000,  probability: 50  },
        { stage: 'lost',        value: 3000,  probability: 0   },
      ];

      supabase.from.mockReturnValue(buildChain(ok(deals)));

      await getDealStats(mockReq, mockRes, mockNext);

      expect(supabase.from).toHaveBeenCalledWith('deals');
      // totalValue: 10000 + 20000 + 5000 + 3000 = 38000
      // weightedValue: 10000*1 + 20000*0.5 + 5000*0.5 + 3000*0 = 22500
      expect(mockRes.json).toHaveBeenCalledWith({
        data: {
          byStage: { won: 1, qualified: 2, lost: 1 },
          totalValue: 38000,
          weightedValue: 22500,
          totalDeals: 4,
        },
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return zeroed stats when there are no deals', async () => {
      supabase.from.mockReturnValue(buildChain(ok([])));

      await getDealStats(mockReq, mockRes, mockNext);

      expect(mockRes.json).toHaveBeenCalledWith({
        data: {
          byStage: {},
          totalValue: 0,
          weightedValue: 0,
          totalDeals: 0,
        },
      });
    });

    it('should tolerate null data without throwing', async () => {
      supabase.from.mockReturnValue(buildChain(ok(null)));

      await getDealStats(mockReq, mockRes, mockNext);

      expect(mockRes.json).toHaveBeenCalledWith({
        data: {
          byStage: {},
          totalValue: 0,
          weightedValue: 0,
          totalDeals: 0,
        },
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should treat missing value or probability as zero', async () => {
      const deals = [
        { stage: 'won', value: null, probability: null },
        { stage: 'won', value: '1000', probability: '50' },
      ];

      supabase.from.mockReturnValue(buildChain(ok(deals)));

      await getDealStats(mockReq, mockRes, mockNext);

      // null values contribute 0; the string ones coerce to numbers
      // totalValue: 0 + 1000 = 1000
      // weightedValue: 0 + (1000 * 50 / 100) = 500
      expect(mockRes.json).toHaveBeenCalledWith({
        data: {
          byStage: { won: 2 },
          totalValue: 1000,
          weightedValue: 500,
          totalDeals: 2,
        },
      });
    });
  });
});