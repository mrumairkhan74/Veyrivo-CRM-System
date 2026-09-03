const jwt = require('jsonwebtoken');
const { supabaseAdmin } = require('../config/supabase');

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production';

const authenticate = async (req, res, next) => {
  try {
    // Get token from Authorization header or cookie
    const authHeader = req.headers.authorization;
    const cookieToken = req.cookies?.token;
    const token = authHeader?.startsWith('Bearer ')
      ? authHeader.substring(7)
      : cookieToken;

    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Verify JWT
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ error: 'Token expired', code: 'TOKEN_EXPIRED' });
      }
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Optionally verify user exists in Supabase
    if (supabaseAdmin && decoded.userId) {
      const { data: user, error } = await supabaseAdmin.auth.admin.getUserById(decoded.userId);
      if (error || !user) {
        return res.status(401).json({ error: 'User not found' });
      }
      req.user = {
        id: decoded.userId,
        email: decoded.email,
        role: decoded.role || 'user',
        userData: user.user,
      };
    } else {
      req.user = {
        id: decoded.userId,
        email: decoded.email,
        role: decoded.role || 'user',
      };
    }

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
};

const generateTokens = (user) => {
  const accessToken = jwt.sign(
    { userId: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

  const refreshToken = jwt.sign(
    { userId: user.id, type: 'refresh' },
    JWT_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d' }
  );

  return { accessToken, refreshToken };
};

const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

module.exports = { authenticate, generateTokens, verifyRefreshToken, JWT_SECRET };