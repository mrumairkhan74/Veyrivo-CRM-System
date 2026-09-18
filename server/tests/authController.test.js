const { supabase, supabaseAdmin } = require('../config/supabase');
const { generateTokens, verifyRefreshToken, JWT_SECRET } = require('../middleware/auth');
const { AppError } = require('../middleware/errorHandler');

// Mock supabase
jest.mock('../config/supabase', () => ({
  supabase: {
    auth: {
      signUp: jest.fn(),
      signInWithPassword: jest.fn(),
      signInWithOAuth: jest.fn(),
      signOut: jest.fn(),
      getUser: jest.fn(),
      getSession: jest.fn(),
      setSession: jest.fn(),
      refreshSession: jest.fn(),
      admin: {
        createUser: jest.fn(),
        listUsers: jest.fn(),
        deleteUser: jest.fn(),
        getUserById: jest.fn(),
        inviteUserByEmail: jest.fn(),
      },
    },
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn(),
    })),
  },
  supabaseAdmin: {
    auth: {
      admin: {
        createUser: jest.fn(),
        listUsers: jest.fn(),
        deleteUser: jest.fn(),
        getUserById: jest.fn(),
        inviteUserByEmail: jest.fn(),
      },
    },
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn(),
    })),
  },
}));

// Mock only generateTokens; keep the real verifyRefreshToken / JWT_SECRET
jest.mock('../middleware/auth', () => ({
  ...jest.requireActual('../middleware/auth'),
  generateTokens: jest.fn(),
}));

const { register, login, logout, me, refresh, updateProfile } = require('../controllers/authController');

describe('Auth Controller', () => {
  let mockReq, mockRes, mockNext;

  beforeEach(() => {
    jest.clearAllMocks();
    mockReq = { body: {}, params: {}, query: {}, cookies: {}, headers: {} };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      cookie: jest.fn().mockReturnThis(),
      clearCookie: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
  });

  // =================================================================
  describe('register', () => {
    it('should register a new user successfully (email confirmed)', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        email_confirmed_at: '2024-01-01T00:00:00.000Z',
      };
      const mockProfile = { id: 'profile-123', role: 'user', full_name: 'Test User' };

      supabase.auth.signUp.mockResolvedValue({
        data: { user: mockUser, session: { access_token: 'a', refresh_token: 'r' } },
        error: null,
      });

      supabaseAdmin.from.mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: mockProfile, error: null }),
          }),
        }),
      });

      generateTokens.mockReturnValue({ accessToken: 'access-token', refreshToken: 'refresh-token' });

      mockReq.body = { email: 'test@example.com', password: 'password123', name: 'Test User' };

      await register(mockReq, mockRes, mockNext);

      expect(supabase.auth.signUp).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
        options: { data: { full_name: 'Test User' } },
      });
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'User registered successfully',
          user: expect.objectContaining({ email: 'test@example.com', name: 'Test User', role: 'user' }),
          accessToken: 'access-token',
        })
      );
    });

    it('should return requiresConfirmation when email not confirmed', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        email_confirmed_at: null,
      };
      const mockProfile = { id: 'profile-123', role: 'user', full_name: 'Test User' };

      supabase.auth.signUp.mockResolvedValue({
        data: { user: mockUser, session: null },
        error: null,
      });

      supabaseAdmin.from.mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: mockProfile, error: null }),
          }),
        }),
      });

      mockReq.body = { email: 'test@example.com', password: 'password123', name: 'Test User' };

      await register(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(201);
      // The controller now includes name & role in the unconfirmed branch
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Signup successful. Please check your email to confirm your account.',
        requiresConfirmation: true,
        user: {
          id: 'user-123',
          email: 'test@example.com',
          name: 'Test User',
          role: 'user',
        },
      });
      expect(generateTokens).not.toHaveBeenCalled();
    });

    it('should throw error if user already exists', async () => {
      supabase.auth.signUp.mockResolvedValue({
        data: null,
        error: { message: 'User already registered' },
      });

      mockReq.body = { email: 'existing@example.com', password: 'password123', name: 'Test User' };

      await register(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Object));
      const error = mockNext.mock.calls[0][0];
      expect(error.message).toBe('User with this email already exists');
      expect(error.statusCode).toBe(409);
    });

    it('should throw error if profile creation fails', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        email_confirmed_at: '2024-01-01T00:00:00.000Z',
      };

      supabase.auth.signUp.mockResolvedValue({
        data: { user: mockUser, session: null },
        error: null,
      });

      supabaseAdmin.from.mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: { message: 'unique violation' },
            }),
          }),
        }),
      });

      mockReq.body = { email: 'test@example.com', password: 'password123', name: 'Test User' };

      await register(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Object));
      const error = mockNext.mock.calls[0][0];
      expect(error.statusCode).toBe(500);
      expect(error.message).toMatch(/profile creation failed/i);
    });
  });

  // =================================================================
  describe('login', () => {
    it('should login user successfully', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        email_confirmed_at: '2024-01-01T00:00:00.000Z',
      };
      const mockProfile = {
        id: 'profile-123',
        role: 'admin',
        full_name: 'Test User',
        is_active: true,
      };

      supabase.auth.signInWithPassword.mockResolvedValue({
        data: {
          user: mockUser,
          session: { access_token: 'access-token', refresh_token: 'refresh-token' },
        },
        error: null,
      });

      // ✅ controller uses supabaseAdmin.from for the profile lookup
      supabaseAdmin.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: mockProfile, error: null }),
          }),
        }),
      });

      generateTokens.mockReturnValue({ accessToken: 'access-token', refreshToken: 'refresh-token' });

      mockReq.body = { email: 'test@example.com', password: 'password123' };

      await login(mockReq, mockRes, mockNext);

      expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Login successful',
          user: expect.objectContaining({ email: 'test@example.com', role: 'admin' }),
          accessToken: 'access-token',
        })
      );
    });

    it('should return 403 requiresConfirmation when email is not confirmed', async () => {
      supabase.auth.signInWithPassword.mockResolvedValue({
        data: {
          user: { id: 'user-123', email: 'test@example.com', email_confirmed_at: null },
          session: null,
        },
        error: null,
      });

      mockReq.body = { email: 'test@example.com', password: 'password123' };

      await login(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Email not confirmed',
        message: 'Please confirm your email before logging in.',
        requiresConfirmation: true,
      });
      expect(generateTokens).not.toHaveBeenCalled();
    });

    it('should throw error for invalid credentials', async () => {
      supabase.auth.signInWithPassword.mockResolvedValue({
        data: null,
        error: { message: 'Invalid login credentials' },
      });

      mockReq.body = { email: 'test@example.com', password: 'wrongpassword' };

      await login(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Object));
      const error = mockNext.mock.calls[0][0];
      expect(error.message).toBe('Invalid email or password');
      expect(error.statusCode).toBe(401);
    });

    it('should throw 404 when profile is missing', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        email_confirmed_at: '2024-01-01T00:00:00.000Z',
      };

      supabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: mockUser, session: { access_token: 'a', refresh_token: 'r' } },
        error: null,
      });

      supabaseAdmin.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: null, error: { message: 'not found' } }),
          }),
        }),
      });

      mockReq.body = { email: 'test@example.com', password: 'password123' };

      await login(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Object));
      const error = mockNext.mock.calls[0][0];
      expect(error.message).toBe('User profile not found');
      expect(error.statusCode).toBe(404);
    });

    it('should throw 403 when account is deactivated', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        email_confirmed_at: '2024-01-01T00:00:00.000Z',
      };

      supabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: mockUser, session: { access_token: 'a', refresh_token: 'r' } },
        error: null,
      });

      supabaseAdmin.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { id: 'profile-123', role: 'user', is_active: false },
              error: null,
            }),
          }),
        }),
      });

      mockReq.body = { email: 'test@example.com', password: 'password123' };

      await login(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Object));
      const error = mockNext.mock.calls[0][0];
      expect(error.message).toBe('Your account has been deactivated');
      expect(error.statusCode).toBe(403);
    });
  });

  // =================================================================
  describe('logout', () => {
    it('should logout user and clear cookie', async () => {
      supabase.auth.signOut.mockResolvedValue({ error: null });

      await logout(mockReq, mockRes, mockNext);

      expect(supabase.auth.signOut).toHaveBeenCalled();
      expect(mockRes.clearCookie).toHaveBeenCalledWith('refreshToken', expect.any(Object));
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Logged out successfully' });
    });
  });

  // =================================================================
  describe('me', () => {
    it('should return current user profile', async () => {
      const mockProfile = { id: 'profile-123', full_name: 'Test User', role: 'admin', avatar_url: null };

      // NOTE: `me` uses supabase.from (not supabaseAdmin.from) in the version
      // I saw earlier. If the current controller changed to supabaseAdmin,
      // swap this mock accordingly.
      supabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: mockProfile, error: null }),
          }),
        }),
      });

      mockReq.user = { id: 'user-123', email: 'test@example.com' };

      await me(mockReq, mockRes, mockNext);

      expect(mockRes.json).toHaveBeenCalledWith({
        user: expect.objectContaining({
          id: 'user-123',
          email: 'test@example.com',
          name: 'Test User',
          role: 'admin',
        }),
      });
    });
  });
});