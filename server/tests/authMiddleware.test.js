const { authenticate, generateTokens, verifyRefreshToken, JWT_SECRET } = require('../middleware/auth');
const jwt = require('jsonwebtoken');

// Mock supabaseAdmin
jest.mock('../config/supabase', () => ({
  supabaseAdmin: {
    auth: {
      admin: {
        getUserById: jest.fn(),
      },
    },
  },
}));

const { supabaseAdmin } = require('../config/supabase');

describe('Auth Middleware', () => {
  let mockReq, mockRes, mockNext;

  beforeEach(() => {
    jest.clearAllMocks();
    mockReq = {
      headers: {},
      cookies: {},
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('authenticate', () => {
    it('should return 401 if no token provided', async () => {
      mockReq.headers = {};
      mockReq.cookies = {};

      await authenticate(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Authentication required' });
    });

    it('should return 401 for invalid token', async () => {
      mockReq.headers = { authorization: 'Bearer invalid-token' };

      jest.spyOn(jwt, 'verify').mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await authenticate(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Invalid token' });
    });

    it('should return 401 for expired token', async () => {
      mockReq.headers = { authorization: 'Bearer expired-token' };

      const error = new Error('jwt expired');
      error.name = 'TokenExpiredError';
      jest.spyOn(jwt, 'verify').mockImplementation(() => { throw error; });

      await authenticate(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Token expired', code: 'TOKEN_EXPIRED' });
    });

    it('should authenticate valid token and set user', async () => {
      mockReq.headers = { authorization: 'Bearer valid-token' };

      jest.spyOn(jwt, 'verify').mockReturnValue({
        userId: 'user-123',
        email: 'test@example.com',
        role: 'admin',
      });

      supabaseAdmin.auth.admin.getUserById.mockResolvedValue({
        data: { user: { id: 'user-123', email: 'test@example.com' } },
        error: null,
      });

      await authenticate(mockReq, mockRes, mockNext);

      expect(mockReq.user).toEqual({
        id: 'user-123',
        email: 'test@example.com',
        role: 'admin',
        userData: { id: 'user-123', email: 'test@example.com' },
      });
      expect(mockNext).toHaveBeenCalled();
    });

    it('should work with cookie token', async () => {
      mockReq.headers = {};
      mockReq.cookies = { token: 'cookie-token' };

      jest.spyOn(jwt, 'verify').mockReturnValue({
        userId: 'user-123',
        email: 'test@example.com',
        role: 'user',
      });

      supabaseAdmin.auth.admin.getUserById.mockResolvedValue({
        data: { user: { id: 'user-123', email: 'test@example.com' } },
        error: null,
      });

      await authenticate(mockReq, mockRes, mockNext);

      expect(mockReq.user).toEqual({
        id: 'user-123',
        email: 'test@example.com',
        role: 'user',
        userData: { id: 'user-123', email: 'test@example.com' },
      });
      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('generateTokens', () => {
    it('should generate access and refresh tokens', () => {
      const user = { id: 'user-123', email: 'test@example.com', role: 'admin' };

      const tokens = generateTokens(user);

      expect(tokens).toHaveProperty('accessToken');
      expect(tokens).toHaveProperty('refreshToken');
      expect(typeof tokens.accessToken).toBe('string');
      expect(typeof tokens.refreshToken).toBe('string');

      // Verify tokens can be decoded with real jwt
      const accessDecoded = jwt.verify(tokens.accessToken, JWT_SECRET);
      const refreshDecoded = jwt.verify(tokens.refreshToken, JWT_SECRET);

      expect(accessDecoded.userId).toBe('user-123');
      expect(accessDecoded.email).toBe('test@example.com');
      expect(accessDecoded.role).toBe('admin');
      expect(refreshDecoded.userId).toBe('user-123');
      expect(refreshDecoded.type).toBe('refresh');
    });
  });

  describe('verifyRefreshToken', () => {
    it('should return decoded token for valid refresh token', () => {
      const refreshToken = jwt.sign(
        { userId: 'user-123', type: 'refresh' },
        JWT_SECRET,
        { expiresIn: '30d' }
      );

      const decoded = verifyRefreshToken(refreshToken);

      expect(decoded).toEqual({
        userId: 'user-123',
        type: 'refresh',
        iat: expect.any(Number),
        exp: expect.any(Number),
      });
    });

    it('should return null for invalid token', () => {
      const decoded = verifyRefreshToken('invalid-token');
      expect(decoded).toBeNull();
    });

    it('should return null for expired token', () => {
      const expiredToken = jwt.sign(
        { userId: 'user-123', type: 'refresh' },
        JWT_SECRET,
        { expiresIn: '-1h' }
      );
      const decoded = verifyRefreshToken(expiredToken);
      expect(decoded).toBeNull();
    });
  });
});