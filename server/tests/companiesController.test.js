const { supabase } = require('../config/supabase');

jest.mock('../config/supabase', () => ({
  supabase: { from: jest.fn(), rpc: jest.fn() },
}));

const {
  getCompanies,
  getCompany,
  createCompany,
  updateCompany,
  deleteCompany,
} = require('../controllers/companiesController');

// ---------- helpers ----------

/**
 * Supabase-style thenable chain.
 *  - `then` calls the resolve callback the await provides (fixes the
 *    "5-second timeout" trap).
 *  - Includes every method used by companiesController: eq, or, is,
 *    order, range, select, insert, update, single.
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

const ok = (data, extra = {}) => ({ data, error: null, ...extra });
const fail = (message, code) => ({
  data: null,
  error: code ? { message, code } : { message },
});

// ---------- suite ----------

describe('Companies Controller', () => {
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
  describe('getCompanies', () => {
    it('should fetch companies with pagination', async () => {
      const mockCompanies = [
        { id: 'comp-1', name: 'Company 1' },
        { id: 'comp-2', name: 'Company 2' },
      ];

      supabase.from.mockReturnValue(buildChain(ok(mockCompanies, { count: 2 })));

      mockReq.query = { page: '1', limit: '10' };

      await getCompanies(mockReq, mockRes, mockNext);

      expect(supabase.from).toHaveBeenCalledWith('companies');
      expect(mockRes.json).toHaveBeenCalledWith({
        data: mockCompanies,
        pagination: { page: 1, limit: 10, total: 2, totalPages: 1 },
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should apply default pagination when none provided', async () => {
      supabase.from.mockReturnValue(buildChain(ok([], { count: 0 })));

      mockReq.query = {};

      await getCompanies(mockReq, mockRes, mockNext);

      expect(mockRes.json).toHaveBeenCalledWith({
        data: [],
        pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
      });
    });

    it('should cap limit at 100', async () => {
      supabase.from.mockReturnValue(buildChain(ok([], { count: 0 })));

      mockReq.query = { page: '1', limit: '500' };

      await getCompanies(mockReq, mockRes, mockNext);

      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          pagination: expect.objectContaining({ limit: 100 }),
        })
      );
    });

    it('should apply search, status, and sorting filters', async () => {
      const chain = buildChain(ok([], { count: 0 }));
      supabase.from.mockReturnValue(chain);

      mockReq.query = {
        search: 'acme',
        status: 'active',
        company_size: 'small',
        sortBy: 'name',
        sortOrder: 'asc',
      };

      await getCompanies(mockReq, mockRes, mockNext);

      expect(chain.eq).toHaveBeenCalledWith('status', 'active');
      expect(chain.eq).toHaveBeenCalledWith('company_size', 'small');
      expect(chain.or).toHaveBeenCalledWith(
        'name.ilike.%acme%,domain.ilike.%acme%,email.ilike.%acme%'
      );
      expect(chain.order).toHaveBeenCalledWith('name', { ascending: true });
      expect(chain.is).toHaveBeenCalledWith('deleted_at', null);
    });

    it('should pass an error to next() on supabase failure', async () => {
      supabase.from.mockReturnValue(buildChain(fail('db down')));

      mockReq.query = {};

      await getCompanies(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Object));
      const error = mockNext.mock.calls[0][0];
      expect(error.message).toBe('db down');
      expect(error.statusCode).toBe(400);
    });
  });

  // =================================================================
  describe('getCompany', () => {
    it('should return a single company', async () => {
      const company = { id: 'comp-1', name: 'Company 1', contacts: [], leads: [] };

      supabase.from.mockReturnValue(buildChain(ok(company)));

      mockReq.params = { id: 'comp-1' };

      await getCompany(mockReq, mockRes, mockNext);

      expect(supabase.from).toHaveBeenCalledWith('companies');
      expect(mockRes.json).toHaveBeenCalledWith({ data: company });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 404 when company is not found (PGRST116)', async () => {
      supabase.from.mockReturnValue(
        buildChain(fail('No rows found', 'PGRST116'))
      );

      mockReq.params = { id: 'missing' };

      await getCompany(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Object));
      const error = mockNext.mock.calls[0][0];
      expect(error.message).toBe('Company not found');
      expect(error.statusCode).toBe(404);
    });

    it('should return 400 for other supabase errors', async () => {
      supabase.from.mockReturnValue(buildChain(fail('db down')));

      mockReq.params = { id: 'comp-1' };

      await getCompany(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Object));
      const error = mockNext.mock.calls[0][0];
      expect(error.statusCode).toBe(400);
    });
  });

  // =================================================================
  describe('createCompany', () => {
    it('should create a new company', async () => {
      const created = { id: 'comp-123', name: 'Test Company' };

      supabase.from.mockReturnValue(buildChain(ok(created)));

      mockReq.body = { name: 'Test Company', email: 'test@company.com' };

      await createCompany(mockReq, mockRes, mockNext);

      expect(supabase.from).toHaveBeenCalledWith('companies');
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        data: created,
        message: 'Company created successfully',
      });
    });

    it('should default owner_id to the current user', async () => {
      const chain = buildChain(ok({ id: 'comp-123' }));
      supabase.from.mockReturnValue(chain);

      mockReq.body = { name: 'Test Company' };

      await createCompany(mockReq, mockRes, mockNext);

      expect(chain.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          organization_id: 'user-123',
          owner_id: 'user-123',
        })
      );
    });

    it('should respect an explicit owner_id', async () => {
      const chain = buildChain(ok({ id: 'comp-123' }));
      supabase.from.mockReturnValue(chain);

      mockReq.body = { name: 'Test Company', owner_id: 'owner-456' };

      await createCompany(mockReq, mockRes, mockNext);

      expect(chain.insert).toHaveBeenCalledWith(
        expect.objectContaining({ owner_id: 'owner-456' })
      );
    });

    it('should pass an error to next() on supabase failure', async () => {
      supabase.from.mockReturnValue(buildChain(fail('insert failed')));

      mockReq.body = { name: 'Test Company' };

      await createCompany(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Object));
      const error = mockNext.mock.calls[0][0];
      expect(error.statusCode).toBe(400);
    });
  });

  // =================================================================
  describe('updateCompany', () => {
    it('should update a company', async () => {
      const updated = { id: 'comp-1', name: 'Updated Name' };

      supabase.from.mockReturnValue(buildChain(ok(updated)));

      mockReq.params = { id: 'comp-1' };
      mockReq.body = { name: 'Updated Name' };

      await updateCompany(mockReq, mockRes, mockNext);

      expect(supabase.from).toHaveBeenCalledWith('companies');
      expect(mockRes.json).toHaveBeenCalledWith({
        data: updated,
        message: 'Company updated successfully',
      });
    });

    it('should return 404 when company is not found (PGRST116)', async () => {
      supabase.from.mockReturnValue(
        buildChain(fail('No rows found', 'PGRST116'))
      );

      mockReq.params = { id: 'missing' };
      mockReq.body = { name: 'x' };

      await updateCompany(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Object));
      const error = mockNext.mock.calls[0][0];
      expect(error.statusCode).toBe(404);
      expect(error.message).toBe('Company not found');
    });

    it('should pass an error to next() on other supabase failures', async () => {
      supabase.from.mockReturnValue(buildChain(fail('update failed')));

      mockReq.params = { id: 'comp-1' };
      mockReq.body = { name: 'x' };

      await updateCompany(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Object));
    });
  });

  // =================================================================
  describe('deleteCompany', () => {
    it('should soft-delete a company', async () => {
      const chain = buildChain(ok(null));
      supabase.from.mockReturnValue(chain);

      mockReq.params = { id: 'comp-1' };

      await deleteCompany(mockReq, mockRes, mockNext);

      expect(supabase.from).toHaveBeenCalledWith('companies');
      expect(chain.update).toHaveBeenCalledWith(
        expect.objectContaining({ deleted_at: expect.any(String) })
      );
      expect(chain.eq).toHaveBeenCalledWith('id', 'comp-1');
      expect(chain.is).toHaveBeenCalledWith('deleted_at', null);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Company deleted successfully',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should pass an error to next() on supabase failure', async () => {
      supabase.from.mockReturnValue(buildChain(fail('delete failed')));

      mockReq.params = { id: 'comp-1' };

      await deleteCompany(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Object));
      const error = mockNext.mock.calls[0][0];
      expect(error.statusCode).toBe(400);
    });
  });
});