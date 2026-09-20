import { useState, useEffect, useCallback } from 'react';
import {
    User, Users, Shield, Plug, Bell, Lock, CreditCard,
    Save, Plus, Upload, CheckCircle, AlertCircle, 
    Loader2, Key, Mail,
} from 'lucide-react';
import { supabase } from '../../services/api';

const API_URL = import.meta.env.VITE_API_URL;

const Settings = () => {
    const [activeTab, setActiveTab] = useState('profile');
    const [currentUser, setCurrentUser] = useState(null);
    const [currentProfile, setCurrentProfile] = useState(null);
    const [loadingUser, setLoadingUser] = useState(true);

    // Team state
    const [users, setUsers] = useState([]);
    const [usersLoading, setUsersLoading] = useState(false);
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteRole, setInviteRole] = useState('member');
    const [inviting, setInviting] = useState(false);
    const [inviteError, setInviteError] = useState('');

    const tabs = [
        { id: 'profile', label: 'Profile', icon: User },
        { id: 'team', label: 'Team Members', icon: Users },
        { id: 'roles', label: 'Roles & Permissions', icon: Shield },
        { id: 'integrations', label: 'Integrations', icon: Plug },
        { id: 'notifications', label: 'Notifications', icon: Bell },
        { id: 'security', label: 'Security', icon: Lock },
        { id: 'billing', label: 'Billing', icon: CreditCard },
    ];

    const roles = [
        { id: 'admin', name: 'Admin', description: 'Full access to all features and settings', permissions: ['all'] },
        { id: 'manager', name: 'Manager', description: 'Can manage leads, deals, and team members', permissions: ['leads', 'deals', 'companies', 'contacts', 'activities', 'analytics', 'team'] },
        { id: 'member', name: 'Member', description: 'Can view and edit assigned leads and activities', permissions: ['leads', 'activities', 'contacts'] },
        { id: 'viewer', name: 'Viewer', description: 'Read-only access to dashboard and reports', permissions: ['dashboard', 'analytics'] },
    ];

    const permissions = [
        { id: 'leads', name: 'Leads Management', description: 'Create, edit, delete leads' },
        { id: 'deals', name: 'Deals & Pipeline', description: 'Manage deals and pipeline stages' },
        { id: 'companies', name: 'Companies', description: 'Manage company records' },
        { id: 'contacts', name: 'Contacts', description: 'Manage contact records' },
        { id: 'activities', name: 'Activities', description: 'Schedule and manage activities' },
        { id: 'analytics', name: 'Analytics', description: 'View reports and dashboards' },
        { id: 'ai', name: 'AI Assistant', description: 'Use AI lead generation and qualification' },
        { id: 'settings', name: 'Settings', description: 'Manage team and application settings' },
        { id: 'billing', name: 'Billing', description: 'Manage subscription and billing' },
    ];

    // ─── Load the current user + their profile once ──────────────
    useEffect(() => {
        let cancelled = false;

        const loadCurrentUser = async () => {
            setLoadingUser(true);
            try {
                const { data: { user }, error: authError } = await supabase.auth.getUser();
                if (authError) throw authError;
                if (!user) return;

                const { data: profile, error: profileError } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single();

                if (profileError && profileError.code !== 'PGRST116') {
                    // PGRST116 = "no rows" — a new user without a profile row yet
                    throw profileError;
                }

                if (!cancelled) {
                    setCurrentUser(user);
                    setCurrentProfile(profile || { id: user.id, email: user.email });
                }
            } catch (err) {
                console.error('Failed to load current user:', err);
            } finally {
                if (!cancelled) setLoadingUser(false);
            }
        };

        loadCurrentUser();
        return () => { cancelled = true; };
    }, []);

    // ─── Team tab loads on demand ────────────────────────────────
    const fetchUsers = useCallback(async () => {
        setUsersLoading(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const res = await fetch(`${API_URL}/team`, {
                headers: { Authorization: `Bearer ${session?.access_token}` },
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const { data } = await res.json();
            setUsers(data || []);
        } catch (err) {
            console.error('Failed to fetch team:', err);
        } finally {
            setUsersLoading(false);
        }
    }, []);

    useEffect(() => {
        if (activeTab === 'team') fetchUsers();
    }, [activeTab, fetchUsers]);

    const updateUserRole = async (userId, newRole) => {
        // Optimistic update
        const prev = users;
        setUsers(users.map(u => (u.id === userId ? { ...u, role: newRole } : u)));
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const res = await fetch(`${API_URL}/team/${userId}/role`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${session?.access_token}`,
                },
                body: JSON.stringify({ role: newRole }),
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
        } catch (err) {
            console.error('Failed to update role:', err);
            setUsers(prev); // rollback
        }
    };

    const removeUser = async (userId) => {
        if (!confirm('Remove this team member? This cannot be undone.')) return;
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const res = await fetch(`${API_URL}/team/${userId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${session?.access_token}` },
            });
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.error || `HTTP ${res.status}`);
            }
            setUsers(users.filter(u => u.id !== userId));
        } catch (err) {
            console.error('Failed to remove user:', err);
            alert(err.message || 'Failed to remove user');
        }
    };

    const sendInvite = async () => {
        if (!inviteEmail) return;
        setInviting(true);
        setInviteError('');
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const res = await fetch(`${API_URL}/team/invite`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${session?.access_token}`,
                },
                body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
            });
            const body = await res.json();
            if (!res.ok) throw new Error(body.error || `HTTP ${res.status}`);

            setShowInviteModal(false);
            setInviteEmail('');
            setInviteRole('member');
            fetchUsers();
        } catch (err) {
            setInviteError(err.message || 'Failed to send invite');
        } finally {
            setInviting(false);
        }
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'profile':
                return (
                    <ProfileTab
                        user={currentUser}
                        profile={currentProfile}
                        onSaved={setCurrentProfile}
                    />
                );
            case 'team':
                return (
                    <TeamTab
                        users={users}
                        loading={usersLoading}
                        onUpdateRole={updateUserRole}
                        onRemove={removeUser}
                        setShowInviteModal={setShowInviteModal}
                    />
                );
            case 'roles':
                return <RolesTab roles={roles} permissions={permissions} />;
            case 'integrations':
                return <IntegrationsTab />;
            case 'notifications':
                return <NotificationsTab profile={currentProfile} onSaved={setCurrentProfile} />;
            case 'security':
                return <SecurityTab />;
            case 'billing':
                return <BillingTab />;
            default:
                return (
                    <ProfileTab
                        user={currentUser}
                        profile={currentProfile}
                        onSaved={setCurrentProfile}
                    />
                );
        }
    };

    if (loadingUser) {
        return (
            <div className="flex items-center justify-center py-24">
                <Loader2 className="w-8 h-8 animate-spin text-cyan-600" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
                <p className="text-sm text-gray-500 mt-1">
                    Manage your account, team, and application settings
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-1">
                    <nav className="bg-white rounded-xl border border-gray-200 p-2 shadow-sm sticky top-24 h-fit">
                        <ul className="space-y-1">
                            {tabs.map(tab => (
                                <li key={tab.id}>
                                    <button
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                                            activeTab === tab.id
                                                ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white shadow-sm'
                                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                        }`}
                                    >
                                        <tab.icon className="w-5 h-5" />
                                        {tab.label}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </nav>
                </div>

                <div className="lg:col-span-3">
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                        <div className="p-6 border-b border-gray-200">
                            <h2 className="text-lg font-semibold text-gray-900 capitalize">
                                {tabs.find(t => t.id === activeTab)?.label}
                            </h2>
                        </div>
                        <div className="p-6">{renderContent()}</div>
                    </div>
                </div>
            </div>

            {/* Invite Modal */}
            {showInviteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
                        <div className="p-6 border-b border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900">Invite Team Member</h3>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="space-y-1.5">
                                <label className="block text-sm font-medium text-gray-700">Email</label>
                                <input
                                    type="email"
                                    value={inviteEmail}
                                    onChange={(e) => setInviteEmail(e.target.value)}
                                    placeholder="colleague@company.com"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="block text-sm font-medium text-gray-700">Role</label>
                                <select
                                    value={inviteRole}
                                    onChange={(e) => setInviteRole(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none"
                                >
                                    {roles.map(r => (
                                        <option key={r.id} value={r.id}>{r.name}</option>
                                    ))}
                                </select>
                            </div>
                            {inviteError && (
                                <p className="text-sm text-red-600 flex items-center gap-1">
                                    <AlertCircle className="w-4 h-4" />
                                    {inviteError}
                                </p>
                            )}
                            <div className="flex justify-end gap-3 pt-4">
                                <button
                                    onClick={() => { setShowInviteModal(false); setInviteError(''); }}
                                    className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg text-sm font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={sendInvite}
                                    disabled={!inviteEmail || inviting}
                                    className="inline-flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-lg hover:opacity-90 text-sm font-medium disabled:opacity-50"
                                >
                                    {inviting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
                                    {inviting ? 'Sending...' : 'Send Invite'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// ─────────────────────────────────────────────────────────────
// Profile Tab
// ─────────────────────────────────────────────────────────────
const ProfileTab = ({ user, profile, onSaved }) => {
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        phone: '',
    });
    const [avatar, setAvatar] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [saving, setSaving] = useState(false);

    // Sync form when profile arrives
    useEffect(() => {
        if (profile) {
            setFormData({
                full_name: profile.full_name || '',
                email: profile.email || user?.email || '',
                phone: profile.phone || '',
            });
            setAvatarPreview(profile.avatar_url || null);
        }
    }, [profile, user]);

    const handleChange = (e) =>
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setAvatar(file);
        const reader = new FileReader();
        reader.onloadend = () => setAvatarPreview(reader.result);
        reader.readAsDataURL(file);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!user?.id) return;
        setSaving(true);
        try {
            let avatarUrl = profile?.avatar_url;
            if (avatar) {
               const fileName = `${user.id}/${Date.now()}-${avatar.name}`;
                const { error: upErr } = await supabase.storage
                    .from('avatars')
                    .upload(fileName, avatar, { upsert: true });
                if (upErr) throw upErr;
                const { data: urlData } = supabase.storage
                    .from('avatars')
                    .getPublicUrl(fileName);
                avatarUrl = urlData.publicUrl;
            }

            const { data, error } = await supabase
                .from('profiles')
                .upsert({
                    id: user.id,
                    ...formData,
                    avatar_url: avatarUrl,
                    updated_at: new Date().toISOString(),
                })
                .select()
                .single();

            if (error) throw error;
            onSaved?.(data);
            alert('Profile saved successfully');
        } catch (err) {
            console.error('Save error:', err);
            alert(`Failed to save profile: ${err.message}`);
        } finally {
            setSaving(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <input
                type="file"
                id="avatar-upload"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-gray-700">Full Name</label>
                    <input
                        type="text"
                        name="full_name"
                        value={formData.full_name}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none"
                    />
                </div>
                <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-50"
                        readOnly
                    />
                </div>
                <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-gray-700">Phone</label>
                    <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none"
                    />
                </div>
                <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-gray-700">Role</label>
                    <input
                        type="text"
                        value={profile?.role || 'member'}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-50 capitalize"
                        readOnly
                    />
                </div>
            </div>

            <div className="space-y-1.5">
                <label className="block text-sm font-medium text-gray-700">Avatar</label>
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold relative overflow-hidden">
                        {avatarPreview ? (
                            <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                            <span>{formData.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}</span>
                        )}
                        <label
                            htmlFor="avatar-upload"
                            className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
                        >
                            <Upload className="w-6 h-6 text-white" />
                        </label>
                    </div>
                    <label
                        htmlFor="avatar-upload"
                        className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 cursor-pointer"
                    >
                        Change Avatar
                    </label>
                </div>
            </div>

            <div className="pt-4 border-t border-gray-200">
                <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-lg hover:opacity-90 text-sm font-medium disabled:opacity-50"
                >
                    <Save className="w-4 h-4" />
                    {saving ? 'Saving...' : 'Save Changes'}
                </button>
            </div>
        </form>
    );
};

// ─────────────────────────────────────────────────────────────
// Team Tab
// ─────────────────────────────────────────────────────────────
const TeamTab = ({ users, loading, onUpdateRole, onRemove, setShowInviteModal }) => (
    <div className="space-y-6">
        <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
                Team Members ({users.length})
            </h3>
            <button
                onClick={() => setShowInviteModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-lg hover:opacity-90 text-sm font-medium"
            >
                <Plus className="w-4 h-4" />
                Invite Member
            </button>
        </div>

        {loading ? (
            <div className="space-y-4">
                {[1, 2, 3].map(i => (
                    <div key={i} className="animate-pulse flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                        <div className="w-10 h-10 rounded-full bg-gray-200" />
                        <div className="flex-1 space-y-2">
                            <div className="h-4 w-40 bg-gray-200 rounded" />
                            <div className="h-3 w-60 bg-gray-200 rounded" />
                        </div>
                    </div>
                ))}
            </div>
        ) : users.length === 0 ? (
            <div className="text-center py-12">
                <Users className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500">No team members yet</p>
            </div>
        ) : (
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-gray-200">
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Member</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Active</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {users.map(u => (
                            <tr key={u.id} className="hover:bg-gray-50">
                                <td className="px-4 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center text-white font-medium">
                                            {u.full_name?.charAt(0) || u.email?.charAt(0) || 'U'}
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">{u.full_name || 'Unnamed'}</p>
                                            <p className="text-sm text-gray-500">{u.email}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-4 py-4">
                                    <select
                                        value={u.role || 'member'}
                                        onChange={(e) => onUpdateRole(u.id, e.target.value)}
                                        className={`px-2 py-1 rounded-full text-xs font-medium border cursor-pointer ${getRoleBadge(u.role || 'member')}`}
                                    >
                                        <option value="admin">Admin</option>
                                        <option value="manager">Manager</option>
                                        <option value="member">Member</option>
                                        <option value="viewer">Viewer</option>
                                    </select>
                                </td>
                                <td className="px-4 py-4 text-sm text-gray-500">
                                    {u.last_sign_in_at ? new Date(u.last_sign_in_at).toLocaleDateString() : 'Never'}
                                </td>
                                <td className="px-4 py-4 text-right">
                                    <button
                                        onClick={() => onRemove(u.id)}
                                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                                    >
                                        Remove
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )}
    </div>
);

// ─────────────────────────────────────────────────────────────
// Roles Tab (read-only display)
// ─────────────────────────────────────────────────────────────
const RolesTab = ({ roles, permissions }) => (
    <div className="space-y-6">
        <h3 className="text-lg font-semibold text-gray-900">Role Definitions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {roles.map(role => (
                <div key={role.id} className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <h4 className="font-semibold text-gray-900 capitalize">{role.name}</h4>
                            <p className="text-sm text-gray-500 mt-1">{role.description}</p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleBadge(role.id)}`}>
                            {role.id}
                        </span>
                    </div>
                    <div className="space-y-2">
                        {permissions.map(p => (
                            <label key={p.id} className="flex items-center gap-2 text-sm text-gray-700">
                                <input
                                    type="checkbox"
                                    checked={role.permissions.includes('all') || role.permissions.includes(p.id)}
                                    disabled
                                    className="w-4 h-4 text-cyan-600 rounded border-gray-300"
                                />
                                <span>{p.name}</span>
                            </label>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    </div>
);

// ─────────────────────────────────────────────────────────────
// Notifications Tab (persisted)
// ─────────────────────────────────────────────────────────────
const DEFAULT_PREFS = {
    'new-lead': true,
    'lead-status': true,
    'deal-stage': true,
    'activity-reminders': true,
    'overdue-tasks': true,
    'weekly-reports': false,
    'team-mentions': true,
    'system-updates': false,
};

const NOTIFICATION_META = [
    { id: 'new-lead', label: 'New Lead Assigned', description: 'When a lead is assigned to you' },
    { id: 'lead-status', label: 'Lead Status Changes', description: 'When lead status is updated' },
    { id: 'deal-stage', label: 'Deal Stage Updates', description: 'When deal moves to next stage' },
    { id: 'activity-reminders', label: 'Activity Reminders', description: 'Upcoming meetings and calls' },
    { id: 'overdue-tasks', label: 'Overdue Tasks', description: 'Daily summary of overdue items' },
    { id: 'weekly-reports', label: 'Weekly Reports', description: 'Weekly performance summary' },
    { id: 'team-mentions', label: 'Team Mentions', description: 'When mentioned in comments' },
    { id: 'system-updates', label: 'System Updates', description: 'Maintenance and feature announcements' },
];

const NotificationsTab = ({ profile, onSaved }) => {
    const [prefs, setPrefs] = useState(DEFAULT_PREFS);
    const [saving, setSaving] = useState(false);
    const [savedAt, setSavedAt] = useState(null);

    useEffect(() => {
        if (profile?.notification_preferences) {
            setPrefs({ ...DEFAULT_PREFS, ...profile.notification_preferences });
        }
    }, [profile]);

    const toggle = (id) =>
        setPrefs(prev => ({ ...prev, [id]: !prev[id] }));

    const save = async () => {
        if (!profile?.id) return;
        setSaving(true);
        try {
            const { data, error } = await supabase
                .from('profiles')
                .update({
                    notification_preferences: prefs,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', profile.id)
                .select()
                .single();
            if (error) throw error;
            onSaved?.(data);
            setSavedAt(new Date());
        } catch (err) {
            console.error('Failed to save notifications:', err);
            alert(`Failed to save: ${err.message}`);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Notification Preferences</h3>
                {savedAt && (
                    <span className="text-xs text-emerald-600 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> Saved
                    </span>
                )}
            </div>
            <div className="space-y-4">
                {NOTIFICATION_META.map(item => (
                    <div key={item.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-xl">
                        <div>
                            <p className="font-medium text-gray-900">{item.label}</p>
                            <p className="text-sm text-gray-500">{item.description}</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={!!prefs[item.id]}
                                onChange={() => toggle(item.id)}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:ring-4 peer-focus:ring-cyan-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
                        </label>
                    </div>
                ))}
            </div>
            <div className="pt-4 border-t border-gray-200">
                <button
                    onClick={save}
                    disabled={saving}
                    className="inline-flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-lg hover:opacity-90 text-sm font-medium disabled:opacity-50"
                >
                    <Save className="w-4 h-4" />
                    {saving ? 'Saving...' : 'Save Preferences'}
                </button>
            </div>
        </div>
    );
};

// ─────────────────────────────────────────────────────────────
// Security Tab (password works; 2FA via Supabase MFA; rest TODO)
// ─────────────────────────────────────────────────────────────
const SecurityTab = () => {
    const [passwordForm, setPasswordForm] = useState({
        newPassword: '',
        confirmPassword: '',
    });
    const [changing, setChanging] = useState(false);
    const [error, setError] = useState('');

    const submit = async (e) => {
        e.preventDefault();
        setError('');
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            return setError('Passwords do not match');
        }
        if (passwordForm.newPassword.length < 8) {
            return setError('Password must be at least 8 characters');
        }
        setChanging(true);
        try {
            const { error } = await supabase.auth.updateUser({
                password: passwordForm.newPassword,
            });
            if (error) throw error;
            setPasswordForm({ newPassword: '', confirmPassword: '' });
            alert('Password updated');
        } catch (err) {
            setError(err.message);
        } finally {
            setChanging(false);
        }
    };

    return (
        <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Security Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                    <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Lock className="w-5 h-5" /> Change Password
                    </h4>
                    <form onSubmit={submit} className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="block text-sm font-medium text-gray-700">New Password</label>
                            <input
                                type="password"
                                value={passwordForm.newPassword}
                                onChange={e => setPasswordForm(p => ({ ...p, newPassword: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none"
                                required
                                minLength={8}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="block text-sm font-medium text-gray-700">Confirm New Password</label>
                            <input
                                type="password"
                                value={passwordForm.confirmPassword}
                                onChange={e => setPasswordForm(p => ({ ...p, confirmPassword: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none"
                                required
                            />
                        </div>
                        {error && (
                            <p className="text-sm text-red-600 flex items-center gap-1">
                                <AlertCircle className="w-4 h-4" /> {error}
                            </p>
                        )}
                        <button
                            type="submit"
                            disabled={changing}
                            className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-lg hover:opacity-90 text-sm font-medium disabled:opacity-50"
                        >
                            {changing ? 'Updating...' : 'Update Password'}
                        </button>
                    </form>
                </div>

                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                    <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Shield className="w-5 h-5" /> Two-Factor Authentication
                    </h4>
                    <p className="text-sm text-gray-500 mb-4">
                        Supabase MFA is available but not yet wired here. Add an
                        enrollment flow using <code>supabase.auth.mfa.enroll()</code>.
                    </p>
                    <button
                        disabled
                        className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-400 cursor-not-allowed"
                    >
                        Not configured
                    </button>
                </div>

                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                    <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Key className="w-5 h-5" /> API Keys
                    </h4>
                    <p className="text-sm text-gray-500 mb-4">
                        Requires an <code>api_keys</code> table and backend routes.
                    </p>
                    <button
                        disabled
                        className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-400 cursor-not-allowed"
                    >
                        Not configured
                    </button>
                </div>

                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                    <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <AlertCircle className="w-5 h-5" /> Active Sessions
                    </h4>
                    <p className="text-sm text-gray-500 mb-4">
                        Supabase does not expose session listing on the client.
                        Backend admin route required.
                    </p>
                    <button
                        disabled
                        className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-400 cursor-not-allowed"
                    >
                        Not configured
                    </button>
                </div>
            </div>
        </div>
    );
};

// ─────────────────────────────────────────────────────────────
// Billing Tab — UI only. Real integration requires Stripe.
// ─────────────────────────────────────────────────────────────
const BillingTab = () => {
    const openPortal = async () => {
        // TODO: BACKEND — create `/api/v1/billing/portal-session` route
        // that calls stripe.billingPortal.sessions.create and returns the URL.
        alert('Billing portal not configured yet. Backend Stripe route required.');
    };

    return (
        <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Billing & Subscription</h3>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
                <strong>Not live.</strong> This tab is a UI preview. Real
                billing requires a Stripe account and backend routes for
                checkout, portal, and webhooks.
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white border-2 border-cyan-500 rounded-xl p-6">
                    <h4 className="font-semibold text-gray-900">Current Plan</h4>
                    <p className="text-3xl font-bold text-cyan-600 mt-2">Professional</p>
                    <p className="text-sm text-gray-500 mt-1">$49/month</p>
                    <button
                        onClick={openPortal}
                        className="mt-6 w-full px-4 py-2 bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-lg hover:opacity-90 text-sm font-medium"
                    >
                        Manage Subscription
                    </button>
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
                    <h4 className="font-semibold text-gray-900">Starter</h4>
                    <p className="text-3xl font-bold text-gray-600 mt-2">$19/month</p>
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
                    <h4 className="font-semibold text-gray-900">Enterprise</h4>
                    <p className="text-3xl font-bold text-purple-600 mt-2">Custom</p>
                </div>
            </div>
        </div>
    );
};

// ─────────────────────────────────────────────────────────────
// Integrations Tab — UI only. Real integration requires OAuth.
// ─────────────────────────────────────────────────────────────
const IntegrationsTab = () => {
    const integrations = [
        { name: 'Gmail', description: 'Sync emails and contacts' },
        { name: 'Outlook', description: 'Calendar and email sync' },
        { name: 'Slack', description: 'Team notifications' },
        { name: 'Zoom', description: 'Video meeting integration' },
        { name: 'HubSpot', description: 'Marketing automation' },
        { name: 'Zapier', description: 'Workflow automation' },
    ];

    return (
        <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Third-Party Integrations</h3>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
                <strong>Not live.</strong> Each integration requires an OAuth
                app registered with the provider and a callback route on your
                backend.
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {integrations.map(item => (
                    <div key={item.name} className="flex items-center justify-between p-4 border border-gray-200 rounded-xl opacity-60">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                                <Plug className="w-5 h-5 text-gray-500" />
                            </div>
                            <div>
                                <p className="font-medium text-gray-900">{item.name}</p>
                                <p className="text-sm text-gray-500">{item.description}</p>
                            </div>
                        </div>
                        <button
                            disabled
                            className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-400 cursor-not-allowed"
                        >
                            Not configured
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

function getRoleBadge(role) {
    const config = {
        admin: 'bg-red-50 text-red-700',
        manager: 'bg-blue-50 text-blue-700',
        member: 'bg-green-50 text-green-700',
        viewer: 'bg-gray-50 text-gray-700',
    };
    return config[role] || 'bg-gray-50 text-gray-700';
}

export default Settings;