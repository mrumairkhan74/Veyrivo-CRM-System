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

        // ---- 1. Try Supabase first (this is what the frontend sends) ----
        if (supabaseAdmin) {
            const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

            if (!error && user) {
                req.user = {
                    id: user.id,
                    email: user.email,
                    role: user.user_metadata?.role || user.app_metadata?.role || 'user',
                    userData: user,
                };
                return next();
            }

            // If Supabase explicitly says the token is expired, surface that.
            // Otherwise fall through and try the custom JWT below.
            if (error?.message?.toLowerCase().includes('expired')) {
                return res.status(401).json({
                    error: 'Token expired',
                    code: 'TOKEN_EXPIRED',
                });
            }
        }

        // ---- 2. Fall back to custom JWT (legacy / non-Supabase clients) ----
        let decoded;
        try {
            decoded = jwt.verify(token, JWT_SECRET);
        } catch (err) {
            if (err.name === 'TokenExpiredError') {
                return res.status(401).json({
                    error: 'Token expired',
                    code: 'TOKEN_EXPIRED',
                });
            }
            return res.status(401).json({ error: 'Invalid token' });
        }

        // Custom tokens use `userId`; Supabase uses `sub`. Accept both.
        const userId = decoded.userId || decoded.sub;
        if (!userId) {
            return res.status(401).json({ error: 'Invalid token payload' });
        }

        req.user = {
            id: userId,
            email: decoded.email,
            role: decoded.role || 'user',
        };

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