const { supabase } = require('../config/supabase');

jest.mock('../config/supabase', () => ({
  supabase: { from: jest.fn(), rpc: jest.fn() },
}));

const {
  getContacts,
  getContact,
  createContact,
  updateContact,
  deleteContact,
  getContactStats,
} = require('../controllers/contactsController');

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

describe('Contacts Controller', () => {
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
  describe('getContacts', () => {
    it('should fetch contacts with pagination', async () => {
      const mockContacts = [{ id: 'contact-1', first_name: 'John', last_name: 'Doe' }];

      supabase.from.mockReturnValue(buildChain(ok(mockContacts, { count: 1 })));

      mockReq.query = { page: '1', limit: '10' };

      await getContacts(mockReq, mockRes, mockNext);

      expect(supabase.from).toHaveBeenCalledWith('contacts');
      expect(mockRes.json).toHaveBeenCalledWith({
        data: mockContacts,
        pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should apply default pagination when none provided', async () => {
      supabase.from.mockReturnValue(buildChain(ok([], { count: 0 })));

      mockReq.query = {};

      await getContacts(mockReq, mockRes, mockNext);

      expect(mockRes.json).toHaveBeenCalledWith({
        data: [],
        pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
      });
    });

    it('should cap limit at 100', async () => {
      supabase.from.mockReturnValue(buildChain(ok([], { count: 0 })));

      mockReq.query = { page: '1', limit: '500' };

      await getContacts(mockReq, mockRes, mockNext);

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
        search: 'john',
        status: 'active',
        company_id: 'comp-1',
        consent_status: 'granted',
        sortBy: 'first_name',
        sortOrder: 'asc',
      };

      await getContacts(mockReq, mockRes, mockNext);

      expect(chain.eq).toHaveBeenCalledWith('status', 'active');
      expect(chain.eq).toHaveBeenCalledWith('company_id', 'comp-1');
      expect(chain.eq).toHaveBeenCalledWith('consent_status', 'granted');
      expect(chain.or).toHaveBeenCalledWith(
        'first_name.ilike.%john%,last_name.ilike.%john%,email.ilike.%john%'
      );
      expect(chain.order).toHaveBeenCalledWith('first_name', { ascending: true });
      expect(chain.is).toHaveBeenCalledWith('deleted_at', null);
    });

    it('should convert is_decision_maker query string to boolean', async () => {
      const chain = buildChain(ok([], { count: 0 }));
      supabase.from.mockReturnValue(chain);

      mockReq.query = { is_decision_maker: 'true' };

      await getContacts(mockReq, mockRes, mockNext);

      expect(chain.eq).toHaveBeenCalledWith('is_decision_maker', true);
    });

    it('should pass an error to next() on supabase failure', async () => {
      supabase.from.mockReturnValue(buildChain(fail('db down')));

      mockReq.query = {};

      await getContacts(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Object));
      const error = mockNext.mock.calls[0][0];
      expect(error.message).toBe('db down');
      expect(error.statusCode).toBe(400);
    });
  });

  // =================================================================
  describe('getContact', () => {
    it('should return a single contact', async () => {
      const contact = { id: 'contact-1', first_name: 'John', last_name: 'Doe', leads: [] };

      supabase.from.mockReturnValue(buildChain(ok(contact)));

      mockReq.params = { id: 'contact-1' };

      await getContact(mockReq, mockRes, mockNext);

      expect(supabase.from).toHaveBeenCalledWith('contacts');
      expect(mockRes.json).toHaveBeenCalledWith({ data: contact });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 404 when contact is not found (PGRST116)', async () => {
      supabase.from.mockReturnValue(
        buildChain(fail('No rows found', 'PGRST116'))
      );

      mockReq.params = { id: 'missing' };

      await getContact(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Object));
      const error = mockNext.mock.calls[0][0];
      expect(error.message).toBe('Contact not found');
      expect(error.statusCode).toBe(404);
    });

    it('should return 400 for other supabase errors', async () => {
      supabase.from.mockReturnValue(buildChain(fail('db down')));

      mockReq.params = { id: 'contact-1' };

      await getContact(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Object));
      const error = mockNext.mock.calls[0][0];
      expect(error.statusCode).toBe(400);
    });
  });

  // =================================================================
  describe('createContact', () => {
    it('should create a new contact', async () => {
      const created = { id: 'contact-123', first_name: 'John', last_name: 'Doe' };

      supabase.from.mockReturnValue(buildChain(ok(created)));

      mockReq.body = { first_name: 'John', last_name: 'Doe', email: 'john@example.com' };

      await createContact(mockReq, mockRes, mockNext);

      expect(supabase.from).toHaveBeenCalledWith('contacts');
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        data: created,
        message: 'Contact created successfully',
      });
    });

    it('should default owner_id to the current user', async () => {
      const chain = buildChain(ok({ id: 'contact-123' }));
      supabase.from.mockReturnValue(chain);

      mockReq.body = { first_name: 'John' };

      await createContact(mockReq, mockRes, mockNext);

      expect(chain.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          organization_id: 'user-123',
          owner_id: 'user-123',
        })
      );
    });

    it('should respect an explicit owner_id', async () => {
      const chain = buildChain(ok({ id: 'contact-123' }));
      supabase.from.mockReturnValue(chain);

      mockReq.body = { first_name: 'John', owner_id: 'owner-456' };

      await createContact(mockReq, mockRes, mockNext);

      expect(chain.insert).toHaveBeenCalledWith(
        expect.objectContaining({ owner_id: 'owner-456' })
      );
    });

    it('should pass an error to next() on supabase failure', async () => {
      supabase.from.mockReturnValue(buildChain(fail('insert failed')));

      mockReq.body = { first_name: 'John' };

      await createContact(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Object));
      const error = mockNext.mock.calls[0][0];
      expect(error.statusCode).toBe(400);
    });
  });

  // =================================================================
  describe('updateContact', () => {
    it('should update a contact', async () => {
      const updated = { id: 'contact-1', first_name: 'Johnny' };

      supabase.from.mockReturnValue(buildChain(ok(updated)));

      mockReq.params = { id: 'contact-1' };
      mockReq.body = { first_name: 'Johnny' };

      await updateContact(mockReq, mockRes, mockNext);

      expect(supabase.from).toHaveBeenCalledWith('contacts');
      expect(mockRes.json).toHaveBeenCalledWith({
        data: updated,
        message: 'Contact updated successfully',
      });
    });

    it('should return 404 when contact is not found (PGRST116)', async () => {
      supabase.from.mockReturnValue(
        buildChain(fail('No rows found', 'PGRST116'))
      );

      mockReq.params = { id: 'missing' };
      mockReq.body = { first_name: 'x' };

      await updateContact(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Object));
      const error = mockNext.mock.calls[0][0];
      expect(error.statusCode).toBe(404);
      expect(error.message).toBe('Contact not found');
    });

    it('should pass an error to next() on other supabase failures', async () => {
      supabase.from.mockReturnValue(buildChain(fail('update failed')));

      mockReq.params = { id: 'contact-1' };
      mockReq.body = { first_name: 'x' };

      await updateContact(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Object));
    });
  });

  // =================================================================
  describe('deleteContact', () => {
    it('should soft-delete a contact', async () => {
      const chain = buildChain(ok(null));
      supabase.from.mockReturnValue(chain);

      mockReq.params = { id: 'contact-1' };

      await deleteContact(mockReq, mockRes, mockNext);

      expect(supabase.from).toHaveBeenCalledWith('contacts');
      expect(chain.update).toHaveBeenCalledWith(
        expect.objectContaining({ deleted_at: expect.any(String) })
      );
      expect(chain.eq).toHaveBeenCalledWith('id', 'contact-1');
      expect(chain.is).toHaveBeenCalledWith('deleted_at', null);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Contact deleted successfully',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should pass an error to next() on supabase failure', async () => {
      supabase.from.mockReturnValue(buildChain(fail('delete failed')));

      mockReq.params = { id: 'contact-1' };

      await deleteContact(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Object));
      const error = mockNext.mock.calls[0][0];
      expect(error.statusCode).toBe(400);
    });
  });

  // =================================================================
  describe('getContactStats', () => {
    it('should return aggregated stats', async () => {
      const contacts = [
        { status: 'active', is_decision_maker: true,  consent_status: 'granted' },
        { status: 'active', is_decision_maker: false, consent_status: 'pending' },
        { status: 'inactive', is_decision_maker: true, consent_status: 'granted' },
      ];

      supabase.from.mockReturnValue(buildChain(ok(contacts)));

      await getContactStats(mockReq, mockRes, mockNext);

      expect(supabase.from).toHaveBeenCalledWith('contacts');
      expect(mockRes.json).toHaveBeenCalledWith({
        data: {
          byStatus: { active: 2, inactive: 1 },
          decisionMakers: 2,
          byConsent: { granted: 2, pending: 1 },
          total: 3,
        },
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return zeroed stats when there are no contacts', async () => {
      supabase.from.mockReturnValue(buildChain(ok([])));

      await getContactStats(mockReq, mockRes, mockNext);

      expect(mockRes.json).toHaveBeenCalledWith({
        data: {
          byStatus: {},
          decisionMakers: 0,
          byConsent: {},
          total: 0,
        },
      });
    });

    it('should not throw when supabase returns null data', async () => {
      // getContactStats reads `contacts?.length || 0` and `(contacts || []).forEach`
      // so a null payload should produce an empty stats object, not an error.
      supabase.from.mockReturnValue(buildChain(ok(null)));

      await getContactStats(mockReq, mockRes, mockNext);

      expect(mockRes.json).toHaveBeenCalledWith({
        data: {
          byStatus: {},
          decisionMakers: 0,
          byConsent: {},
          total: 0,
        },
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });
});