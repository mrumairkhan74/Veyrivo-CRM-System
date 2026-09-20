
const { supabaseAdmin } = require('../config/supabase');
const { AppError } = require('../middleware/errorHandler');

const inviteUser = async (req, res, next) => {
    try {
        const { email, role = 'member' } = req.body;

        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            throw new AppError('Valid email is required', 400);
        }

        // Only admins can invite
        if (req.user.role !== 'admin') {
            throw new AppError('Only admins can invite team members', 403);
        }

        const orgId = req.user.organization_id;
        if (!orgId) {
            throw new AppError('Your account has no organization assigned', 400);
        }

        const { data, error } = await supabaseAdmin.auth.admin.inviteUserByEmail(
            email,
            {
                data: {
                    role,
                    organization_id: orgId,
                    invited_by: req.user.id,
                },
                redirectTo: `${process.env.FRONTEND_URL}/login`,
            }
        );

        if (error) {
            // Supabase returns "User already registered" for existing emails
            throw new AppError(error.message, 400);
        }

        res.json({
            data: {
                id: data.user?.id,
                email: data.user?.email,
                role,
            },
        });
    } catch (error) {
        next(error);
    }
};

const listTeam = async (req, res, next) => {
    try {
        const { data, error } = await supabaseAdmin
            .from('profiles')
            .select('id, email, full_name, role, avatar_url, created_at, last_sign_in_at')
            .eq('organization_id', req.user.organization_id)
            .order('created_at', { ascending: false });

        if (error) throw new AppError(error.message, 400);
        res.json({ data });
    } catch (error) {
        next(error);
    }
};

const updateRole = async (req, res, next) => {
    try {
        const { userId } = req.params;
        const { role } = req.body;

        if (req.user.role !== 'admin') {
            throw new AppError('Only admins can change roles', 403);
        }
        if (!['admin', 'manager', 'member', 'viewer'].includes(role)) {
            throw new AppError('Invalid role', 400);
        }

        const { error } = await supabaseAdmin
            .from('profiles')
            .update({ role, updated_at: new Date().toISOString() })
            .eq('id', userId)
            .eq('organization_id', req.user.organization_id);

        if (error) throw new AppError(error.message, 400);
        res.json({ data: { id: userId, role } });
    } catch (error) {
        next(error);
    }
};

const removeMember = async (req, res, next) => {
    try {
        const { userId } = req.params;

        if (req.user.role !== 'admin') {
            throw new AppError('Only admins can remove team members', 403);
        }
        if (userId === req.user.id) {
            throw new AppError('You cannot remove yourself', 400);
        }

        // Remove from profiles first, then auth.users
        await supabaseAdmin
            .from('profiles')
            .delete()
            .eq('id', userId)
            .eq('organization_id', req.user.organization_id);

        const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
        if (error) throw new AppError(error.message, 400);

        res.json({ data: { id: userId } });
    } catch (error) {
        next(error);
    }
};

module.exports = { inviteUser, listTeam, updateRole, removeMember };