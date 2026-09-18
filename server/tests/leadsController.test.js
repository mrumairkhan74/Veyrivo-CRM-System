const { supabase } = require('../config/supabase');

jest.mock('../config/supabase', () => ({
  supabase: { from: jest.fn(), rpc: jest.fn() },
}));

const {
  getLeads,
  getLead,
  createLead,
  updateLead,
  deleteLead,
  getLeadStats,
} = require('../controllers/leadsController');

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

describe('Leads Controller', () => {
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
  describe('getLeads', () => {
    it('should fetch leads with pagination and filters', async () => {
      const mockLeads = [
        { id: 'lead-1', title: 'Lead 1', status: 'new' },
        { id: 'lead-2', title: 'Lead 2', status: 'qualified' },
      ];

      supabase.from.mockReturnValue(buildChain(ok(mockLeads, { count: 2 })));

      mockReq.query = { page: '1', limit: '10', status: 'new' };

      await getLeads(mockReq, mockRes, mockNext);

      expect(supabase.from).toHaveBeenCalledWith('leads');
      expect(mockRes.json).toHaveBeenCalledWith({
        data: mockLeads,
        pagination: { page: 1, limit: 10, total: 2, totalPages: 1 },
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should apply default pagination when none provided', async () => {
      supabase.from.mockReturnValue(buildChain(ok([], { count: 0 })));

      mockReq.query = {};

      await getLeads(mockReq, mockRes, mockNext);

      expect(mockRes.json).toHaveBeenCalledWith({
        data: [],
        pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
      });
    });

    it('should cap limit at 100', async () => {
      supabase.from.mockReturnValue(buildChain(ok([], { count: 0 })));

      mockReq.query = { page: '1', limit: '500' };

      await getLeads(mockReq, mockRes, mockNext);

      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          pagination: expect.objectContaining({ limit: 100 }),
        })
      );
    });

    it('should apply all allow-listed filters', async () => {
      const chain = buildChain(ok([], { count: 0 }));
      supabase.from.mockReturnValue(chain);

      mockReq.query = {
        status: 'new',
        temperature: 'hot',
        source_id: 'src-1',
        industry_id: 'ind-1',
        owner_id: 'owner-1',
        company_id: 'comp-1',
        search: 'acme',
        sortBy: 'title',
        sortOrder: 'asc',
      };

      await getLeads(mockReq, mockRes, mockNext);

      expect(chain.eq).toHaveBeenCalledWith('status', 'new');
      expect(chain.eq).toHaveBeenCalledWith('temperature', 'hot');
      expect(chain.eq).toHaveBeenCalledWith('source_id', 'src-1');
      expect(chain.eq).toHaveBeenCalledWith('industry_id', 'ind-1');
      expect(chain.eq).toHaveBeenCalledWith('owner_id', 'owner-1');
      expect(chain.eq).toHaveBeenCalledWith('company_id', 'comp-1');
      expect(chain.or).toHaveBeenCalledWith(
        'title.ilike.%acme%,description.ilike.%acme%,company.ilike.%acme%'
      );
      expect(chain.order).toHaveBeenCalledWith('title', { ascending: true });
      expect(chain.is).toHaveBeenCalledWith('deleted_at', null);
    });

    it('should pass an error to next() on supabase failure', async () => {
      supabase.from.mockReturnValue(buildChain(fail('db down')));

      mockReq.query = {};

      await getLeads(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Object));
      const error = mockNext.mock.calls[0][0];
      expect(error.message).toBe('db down');
      expect(error.statusCode).toBe(400);
    });
  });

  // =================================================================
  describe('getLead', () => {
    it('should return a single lead', async () => {
      const lead = { id: 'lead-123', title: 'Test Lead', activities: [] };

      supabase.from.mockReturnValue(buildChain(ok(lead)));

      mockReq.params = { id: 'lead-123' };

      await getLead(mockReq, mockRes, mockNext);

      expect(supabase.from).toHaveBeenCalledWith('leads');
      expect(mockRes.json).toHaveBeenCalledWith({ data: lead });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 404 when lead is not found (PGRST116)', async () => {
      supabase.from.mockReturnValue(buildChain(fail('No rows found', 'PGRST116')));

      mockReq.params = { id: 'nonexistent' };

      await getLead(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Object));
      const error = mockNext.mock.calls[0][0];
      expect(error.message).toBe('Lead not found');
      expect(error.statusCode).toBe(404);
    });

    it('should return 400 for other supabase errors', async () => {
      supabase.from.mockReturnValue(buildChain(fail('db down')));

      mockReq.params = { id: 'lead-123' };

      await getLead(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Object));
      const error = mockNext.mock.calls[0][0];
      expect(error.statusCode).toBe(400);
    });
  });

  // =================================================================
  describe('createLead', () => {
    it('should create a new lead', async () => {
      const created = { id: 'new-lead', title: 'New Lead' };

      supabase.from.mockReturnValue(buildChain(ok(created)));

      mockReq.body = { title: 'New Lead', description: 'Test lead' };

      await createLead(mockReq, mockRes, mockNext);

      expect(supabase.from).toHaveBeenCalledWith('leads');
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        data: created,
        message: 'Lead created successfully',
      });
    });

    it('should default owner_id to the current user', async () => {
      const chain = buildChain(ok({ id: 'new-lead' }));
      supabase.from.mockReturnValue(chain);

      mockReq.body = { title: 'New Lead' };

      await createLead(mockReq, mockRes, mockNext);

      expect(chain.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          organization_id: 'user-123',
          owner_id: 'user-123',
        })
      );
    });

    it('should respect an explicit owner_id', async () => {
      const chain = buildChain(ok({ id: 'new-lead' }));
      supabase.from.mockReturnValue(chain);

      mockReq.body = { title: 'New Lead', owner_id: 'owner-456' };

      await createLead(mockReq, mockRes, mockNext);

      expect(chain.insert).toHaveBeenCalledWith(
        expect.objectContaining({ owner_id: 'owner-456' })
      );
    });

    it('should pass an error to next() on supabase failure', async () => {
      supabase.from.mockReturnValue(buildChain(fail('insert failed')));

      mockReq.body = { title: 'New Lead' };

      await createLead(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Object));
      const error = mockNext.mock.calls[0][0];
      expect(error.statusCode).toBe(400);
    });
  });

  // =================================================================
  // updateLead makes TWO supabase.from calls:
  //   1. existence check   select → eq → is → single
  //   2. the actual update update → eq → is → select → single
  describe('updateLead', () => {
    it('should update an existing lead', async () => {
      const existing = { id: 'lead-123', status: 'new' };
      const updated = { id: 'lead-123', title: 'Updated Lead', status: 'qualified' };

      supabase.from
        .mockReturnValueOnce(buildChain(ok(existing)))   // existence check
        .mockReturnValueOnce(buildChain(ok(updated)));   // the update

      mockReq.params = { id: 'lead-123' };
      mockReq.body = { status: 'qualified' };

      await updateLead(mockReq, mockRes, mockNext);

      expect(supabase.from).toHaveBeenCalledTimes(2);
      expect(mockRes.json).toHaveBeenCalledWith({
        data: updated,
        message: 'Lead updated successfully',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should set qualified_at when status changes to qualified', async () => {
      const existing = { id: 'lead-123', status: 'new' };
      const updated = { id: 'lead-123', status: 'qualified' };

      const updateChain = buildChain(ok(updated));

      supabase.from
        .mockReturnValueOnce(buildChain(ok(existing)))
        .mockReturnValueOnce(updateChain);

      mockReq.params = { id: 'lead-123' };
      mockReq.body = { status: 'qualified' };

      await updateLead(mockReq, mockRes, mockNext);

      expect(updateChain.update).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'qualified',
          qualified_at: expect.any(String),
          updated_at: expect.any(String),
        })
      );
    });

    it('should return 404 when the lead does not exist', async () => {
      // First call's single() resolves to { data: null } — the existence check fails
      supabase.from.mockReturnValueOnce(buildChain(ok(null)));

      mockReq.params = { id: 'missing' };
      mockReq.body = { status: 'qualified' };

      await updateLead(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Object));
      const error = mockNext.mock.calls[0][0];
      expect(error.message).toBe('Lead not found');
      expect(error.statusCode).toBe(404);
      // Only the existence check should have run — the update never fires
      expect(supabase.from).toHaveBeenCalledTimes(1);
    });

    it('should pass an error to next() when the update fails', async () => {
      const existing = { id: 'lead-123', status: 'new' };

      supabase.from
        .mockReturnValueOnce(buildChain(ok(existing)))
        .mockReturnValueOnce(buildChain(fail('update failed')));

      mockReq.params = { id: 'lead-123' };
      mockReq.body = { title: 'x' };

      await updateLead(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Object));
      const error = mockNext.mock.calls[0][0];
      expect(error.statusCode).toBe(400);
    });
  });

  // =================================================================
  describe('deleteLead', () => {
    it('should soft delete a lead', async () => {
      const chain = buildChain(ok(null));
      supabase.from.mockReturnValue(chain);

      mockReq.params = { id: 'lead-123' };

      await deleteLead(mockReq, mockRes, mockNext);

      expect(supabase.from).toHaveBeenCalledWith('leads');
      expect(chain.update).toHaveBeenCalledWith(
        expect.objectContaining({ deleted_at: expect.any(String) })
      );
      expect(chain.eq).toHaveBeenCalledWith('id', 'lead-123');
      expect(chain.is).toHaveBeenCalledWith('deleted_at', null);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Lead deleted successfully' });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should pass an error to next() on supabase failure', async () => {
      supabase.from.mockReturnValue(buildChain(fail('delete failed')));

      mockReq.params = { id: 'lead-123' };

      await deleteLead(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Object));
      const error = mockNext.mock.calls[0][0];
      expect(error.statusCode).toBe(400);
    });
  });

  // =================================================================
  // getLeadStats makes THREE supabase.from calls:
  //   1. select status           → statusCounts
  //   2. select temperature      → tempCounts
  //   3. select estimated_value  → valueData
  describe('getLeadStats', () => {
    it('should return lead statistics', async () => {
      const statuses = [
        { status: 'new' },
        { status: 'qualified' },
        { status: 'lost' },
      ];
      const temperatures = [
        { temperature: 'hot' },
        { temperature: 'warm' },
        { temperature: 'cold' },
      ];
      const values = [
        { estimated_value: 1000 },
        { estimated_value: 2000 },
        { estimated_value: 500 },
      ];

      supabase.from
        .mockReturnValueOnce(buildChain(ok(statuses)))
        .mockReturnValueOnce(buildChain(ok(temperatures)))
        .mockReturnValueOnce(buildChain(ok(values)));

      await getLeadStats(mockReq, mockRes, mockNext);

      expect(supabase.from).toHaveBeenCalledWith('leads');
      expect(supabase.from).toHaveBeenCalledTimes(3);
      expect(mockRes.json).toHaveBeenCalledWith({
        data: {
          byStatus: { new: 1, qualified: 1, lost: 1 },
          byTemperature: { hot: 1, warm: 1, cold: 1 },
          totalValue: 3500,
          totalLeads: 3,
        },
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should handle empty data', async () => {
      supabase.from
        .mockReturnValueOnce(buildChain(ok([])))
        .mockReturnValueOnce(buildChain(ok([])))
        .mockReturnValueOnce(buildChain(ok([])));

      await getLeadStats(mockReq, mockRes, mockNext);

      expect(mockRes.json).toHaveBeenCalledWith({
        data: {
          byStatus: {},
          byTemperature: {},
          totalValue: 0,
          totalLeads: 0,
        },
      });
    });

    it('should tolerate null data without throwing', async () => {
      // `(statusCounts || [])` and `parseFloat(...) || 0` guard against nulls
      supabase.from
        .mockReturnValueOnce(buildChain(ok(null)))
        .mockReturnValueOnce(buildChain(ok(null)))
        .mockReturnValueOnce(buildChain(ok(null)));

      await getLeadStats(mockReq, mockRes, mockNext);

      expect(mockRes.json).toHaveBeenCalledWith({
        data: {
          byStatus: {},
          byTemperature: {},
          totalValue: 0,
          totalLeads: 0,
        },
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should treat missing estimated_value as zero', async () => {
      supabase.from
        .mockReturnValueOnce(buildChain(ok([{ status: 'new' }])))
        .mockReturnValueOnce(buildChain(ok([{ temperature: 'hot' }])))
        .mockReturnValueOnce(buildChain(ok([
          { estimated_value: null },
          { estimated_value: '1000' },
        ])));

      await getLeadStats(mockReq, mockRes, mockNext);

      expect(mockRes.json).toHaveBeenCalledWith({
        data: {
          byStatus: { new: 1 },
          byTemperature: { hot: 1 },
          totalValue: 1000,
          totalLeads: 1,
        },
      });
    });
  });
});