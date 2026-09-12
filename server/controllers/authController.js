const { supabase, supabaseAdmin } = require('../config/supabase');
const { generateTokens, verifyRefreshToken, JWT_SECRET } = require('../middleware/auth');
const { AppError } = require('../middleware/errorHandler');
const { validateSchema, schemas } = require('../middleware/validators');

const register = async (req, res, next) => {
  try {
    const { email, password, name } = req.body;

    // Create user in Supabase Auth using regular signup (public)
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name },
      }
    });

    if (authError) {
      if (authError.message.includes('already registered') || authError.message.includes('already exists')) {
        throw new AppError('User with this email already exists', 409);
      }
      throw new AppError(authError.message, 400);
    }

    // If email confirmation is required, user might not be immediately available
    if (!authData.user) {
      return res.status(201).json({
        message: 'Signup successful. Please check your email to confirm your account.',
        requiresConfirmation: true,
      });
    }

    // If email confirmation is required but user exists without confirmation
    if (authData.user && !authData.user.email_confirmed_at) {
      return res.status(201).json({
        message: 'Signup successful. Please check your email to confirm your account.',
        requiresConfirmation: true,
        user: {
          id: authData.user.id,
          email: authData.user.email,
        }
      });
    }

    // Create user profile in database (use admin client for profile creation)
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        id: authData.user.id,
        email,
        full_name: name,
        role: 'user',
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (profileError) {
      console.error('Profile creation error:', profileError);
      // Don't delete the auth user, just log the error
      console.error('Profile creation failed for user:', authData.user.id, profileError);
      // Still return success since auth user was created
      const { accessToken, refreshToken } = generateTokens({
        id: authData.user.id,
        email,
        role: 'user',
      });

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 30 * 24 * 60 * 60 * 1000,
      });

      return res.status(201).json({
        message: 'User registered successfully (profile creation pending)',
        user: {
          id: authData.user.id,
          email,
          name,
          role: 'user',
        },
        accessToken,
      });
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens({
      id: authData.user.id,
      email,
      role: 'user',
    });

    // Set refresh token in httpOnly cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: authData.user.id,
        email,
        name,
        role: 'user',
      },
      accessToken,
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Sign in with Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new AppError('Invalid email or password', 401);
    }

    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    const { accessToken, refreshToken } = generateTokens({
      id: data.user.id,
      email: data.user.email,
      role: profile?.role || 'user',
    });

    // Set refresh token in httpOnly cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    res.json({
      message: 'Login successful',
      user: {
        id: data.user.id,
        email: data.user.email,
        name: profile?.full_name || data.user.user_metadata?.full_name,
        role: profile?.role || 'user',
      },
      accessToken,
    });
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res, next) => {
  try {
    // Sign out from Supabase (optional, mainly for server-side session cleanup)
    await supabase.auth.signOut();

    // Clear refresh token cookie
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });

    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
};

const me = async (req, res, next) => {
  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', req.user.id)
      .single();

    res.json({
      user: {
        id: req.user.id,
        email: req.user.email,
        name: profile?.full_name,
        role: profile?.role || 'user',
        avatar_url: profile?.avatar_url,
      },
    });
  } catch (error) {
    next(error);
  }
};

const refresh = async (req, res, next) => {
  try {
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      throw new AppError('Refresh token not provided', 401);
    }

    const decoded = verifyRefreshToken(refreshToken);

    if (!decoded || decoded.type !== 'refresh') {
      throw new AppError('Invalid refresh token', 401);
    }

    // Verify user still exists
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, email, role')
      .eq('id', decoded.userId)
      .single();

    if (!profile) {
      throw new AppError('User not found', 404);
    }

    const { accessToken, refreshToken: newRefreshToken } = generateTokens({
      id: profile.id,
      email: profile.email,
      role: profile.role,
    });

    // Set new refresh token
    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    res.json({ accessToken });
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const { name, avatar_url } = req.body;

    const { data: profile, error } = await supabase
      .from('profiles')
      .update({
        full_name: name,
        avatar_url,
        updated_at: new Date().toISOString(),
      })
      .eq('id', req.user.id)
      .select()
      .single();

    if (error) throw new AppError(error.message, 400);

    res.json({ user: profile });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register: [validateSchema(schemas.register), register],
  login: [validateSchema(schemas.login), login],
  logout,
  me,
  refresh,
  updateProfile,
};