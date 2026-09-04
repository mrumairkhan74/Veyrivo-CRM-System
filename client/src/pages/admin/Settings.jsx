import { useState, useEffect } from 'react';
import {
    User, Users, Shield, Plug, Bell, Lock, CreditCard,
    Save, Edit, Trash2, Plus, Mail, Phone, Key,
    Eye, EyeOff, ChevronDown, MoreVertical, CheckCircle,
    AlertCircle, X
} from 'lucide-react';
import { supabase } from '../../services/api';

const Settings = () => {
    const [activeTab, setActiveTab] = useState('profile');
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteRole, setInviteRole] = useState('member');

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

    useEffect(() => {
        if (activeTab === 'team') {
            fetchUsers();
        }
    }, [activeTab]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('id, email, full_name, role, avatar_url, created_at, last_sign_in_at')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setUsers(data || []);
        } catch (error) {
            console.error('Failed to fetch users:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateUserRole = async (userId, newRole) => {
        try {
            const { error } = await supabase
                .from('profiles')
                .update({ role: newRole, updated_at: new Date().toISOString() })
                .eq('id', userId);

            if (error) throw error;
            setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
        } catch (error) {
            console.error('Failed to update role:', error);
        }
    };

    const removeUser = async (userId) => {
        if (!confirm('Are you sure you want to remove this team member?')) return;
        try {
            const { error } = await supabase
                .from('profiles')
                .delete()
                .eq('id', userId);

            if (error) throw error;
            setUsers(users.filter(u => u.id !== userId));
        } catch (error) {
            console.error('Failed to remove user:', error);
        }
    };

    const sendInvite = async () => {
        if (!inviteEmail) return;
        try {
            const { error } = await supabase.auth.admin.inviteUserByEmail(inviteEmail, {
                data: { role: inviteRole },
                redirectTo: `${window.location.origin}/login`
            });
            if (error) throw error;
            setShowInviteModal(false);
            setInviteEmail('');
            fetchUsers();
        } catch (error) {
            console.error('Failed to send invite:', error);
        }
    };

    const getRoleBadge = (role) => {
        const config = {
            admin: 'bg-red-50 text-red-700',
            manager: 'bg-blue-50 text-blue-700',
            member: 'bg-green-50 text-green-700',
            viewer: 'bg-gray-50 text-gray-700',
        };
        return config[role] || 'bg-gray-50 text-gray-700';
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'profile':
                return <ProfileTab />;
            case 'team':
                return <TeamTab users={users} loading={loading} onUpdateRole={updateUserRole} onRemove={removeUser} onRefresh={fetchUsers} />;
            case 'roles':
                return <RolesTab roles={roles} permissions={permissions} />;
            case 'integrations':
                return <IntegrationsTab />;
            case 'notifications':
                return <NotificationsTab />;
            case 'security':
                return <SecurityTab />;
            case 'billing':
                return <BillingTab />;
            default:
                return <ProfileTab />;
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
                <p className="text-sm text-gray-500 mt-1">Manage your account, team, and application settings</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Sidebar Navigation */}
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

                {/* Content Area */}
                <div className="lg:col-span-3">
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                        <div className="p-6 border-b border-gray-200">
                            <h2 className="text-lg font-semibold text-gray-900 capitalize">{tabs.find(t => t.id === activeTab)?.label}</h2>
                        </div>
                        <div className="p-6">
                            {renderContent()}
                        </div>
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
                                    {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                                </select>
                            </div>
                            <div className="flex justify-end gap-3 pt-4">
                                <button onClick={() => setShowInviteModal(false)} className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg text-sm font-medium">Cancel</button>
                                <button onClick={sendInvite} disabled={!inviteEmail} className="inline-flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-lg hover:opacity-90 text-sm font-medium disabled:opacity-50">Send Invite</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// Sub-components
const ProfileTab = () => (
    <form className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
                <label className="block text-sm font-medium text-gray-700">Full Name</label>
                <input type="text" defaultValue="Ahmed Khan" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none" />
            </div>
            <div className="space-y-1.5">
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input type="email" defaultValue="ahmed@company.com" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none" />
            </div>
            <div className="space-y-1.5">
                <label className="block text-sm font-medium text-gray-700">Phone</label>
                <input type="tel" defaultValue="+92 300 1234567" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none" />
            </div>
            <div className="space-y-1.5">
                <label className="block text-sm font-medium text-gray-700">Role</label>
                <input type="text" defaultValue="Admin" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-50" readOnly />
            </div>
        </div>
        <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700">Avatar</label>
            <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold">AK</div>
                <button type="button" className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">Change Avatar</button>
            </div>
        </div>
        <div className="pt-4 border-t border-gray-200">
            <button type="submit" className="inline-flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-lg hover:opacity-90 text-sm font-medium">
                <Save className="w-4 h-4" />
                Save Changes
            </button>
        </div>
    </form>
);

const TeamTab = ({ users, loading, onUpdateRole, onRemove, onRefresh }) => (
    <div className="space-y-6">
        <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Team Members ({users.length})</h3>
            <button onClick={() => setShowInviteModal(true)} className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-lg hover:opacity-90 text-sm font-medium">
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
                        <div className="w-24 h-6 bg-gray-200 rounded" />
                    </div>
                ))}
            </div>
        ) : users.length === 0 ? (
            <div className="text-center py-12">
                <Users className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500">No team members yet</p>
                <button onClick={() => setShowInviteModal(true)} className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-lg hover:opacity-90 text-sm font-medium">
                    <Plus className="w-4 h-4" />
                    Invite First Member
                </button>
            </div>
        ) : (
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-gray-200">
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Member</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Active</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Joined</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {users.map(user => (
                            <tr key={user.id} className="hover:bg-gray-50">
                                <td className="px-4 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center text-white font-medium">
                                            {user.full_name?.charAt(0) || user.email?.charAt(0) || 'U'}
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">{user.full_name || 'Unnamed'}</p>
                                            <p className="text-sm text-gray-500">{user.email}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-4 py-4">
                                    <select
                                        value={user.role || 'member'}
                                        onChange={(e) => onUpdateRole(user.id, e.target.value)}
                                        className={`px-2 py-1 rounded-full text-xs font-medium border ${getRoleBadge(user.role || 'member')} cursor-pointer`}
                                    >
                                        <option value="admin">Admin</option>
                                        <option value="manager">Manager</option>
                                        <option value="member">Member</option>
                                        <option value="viewer">Viewer</option>
                                    </select>
                                </td>
                                <td className="px-4 py-4 text-sm text-gray-500">
                                    {user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString() : 'Never'}
                                </td>
                                <td className="px-4 py-4 text-sm text-gray-500">
                                    {user.created_at ? new Date(user.created_at).toLocaleDateString() : '-'}
                                </td>
                                <td className="px-4 py-4 text-right">
                                    <button onClick={() => onRemove(user.id)} className="text-red-600 hover:text-red-800 text-sm font-medium">Remove</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )}
    </div>
);

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
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${role.id === 'admin' ? 'bg-red-50 text-red-700' : role.id === 'manager' ? 'bg-blue-50 text-blue-700' : role.id === 'member' ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-700'}`}>
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
                                    className="w-4 h-4 text-cyan-600 rounded border-gray-300 focus:ring-cyan-500"
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

const IntegrationsTab = () => (
    <div className="space-y-6">
        <h3 className="text-lg font-semibold text-gray-900">Third-Party Integrations</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
                { name: 'Gmail', description: 'Sync emails and contacts', connected: false },
                { name: 'Outlook', description: 'Calendar and email sync', connected: false },
                { name: 'Slack', description: 'Team notifications', connected: false },
                { name: 'Zoom', description: 'Video meeting integration', connected: false },
                { name: 'HubSpot', description: 'Marketing automation', connected: false },
                { name: 'Zapier', description: 'Workflow automation', connected: false },
            ].map(item => (
                <div key={item.name} className="flex items-center justify-between p-4 border border-gray-200 rounded-xl">
                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                                            <Plug className="w-5 h-5 text-gray-500" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">{item.name}</p>
                                            <p className="text-sm text-gray-500">{item.description}</p>
                                        </div>
                                    </div>
                                    <button className={`px-4 py-2 rounded-lg text-sm font-medium ${item.connected ? 'bg-gray-100 text-gray-600' : 'bg-cyan-50 text-cyan-700 hover:bg-cyan-100'}`}>
                                        {item.connected ? 'Connected' : 'Connect'}
                                    </button>
                                </div>
            ))}
        </div>
    </div>
);

const NotificationsTab = () => (
    <div className="space-y-6">
        <h3 className="text-lg font-semibold text-gray-900">Notification Preferences</h3>
        <div className="space-y-4">
            {[
                { label: 'New Lead Assigned', description: 'When a lead is assigned to you', enabled: true },
                { label: 'Lead Status Changes', description: 'When lead status is updated', enabled: true },
                { label: 'Deal Stage Updates', description: 'When deal moves to next stage', enabled: true },
                { label: 'Activity Reminders', description: 'Upcoming meetings and calls', enabled: true },
                { label: 'Overdue Tasks', description: 'Daily summary of overdue items', enabled: true },
                { label: 'Weekly Reports', description: 'Weekly performance summary', enabled: false },
                { label: 'Team Mentions', description: 'When mentioned in comments', enabled: true },
                { label: 'System Updates', description: 'Maintenance and feature announcements', enabled: false },
            ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-4 border border-gray-200 rounded-xl">
                    <div>
                        <p className="font-medium text-gray-900">{item.label}</p>
                        <p className="text-sm text-gray-500">{item.description}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" defaultChecked={item.enabled} className="sr-only peer" />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-cyan-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
                                    </label>
                                </div>
            ))}
        </div>
    </div>
);

const SecurityTab = () => (
    <div className="space-y-6">
        <h3 className="text-lg font-semibold text-gray-900">Security Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2"><Lock className="w-5 h-5" /> Change Password</h4>
                <form className="space-y-4">
                    <div className="space-y-1.5">
                        <label className="block text-sm font-medium text-gray-700">Current Password</label>
                        <input type="password" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none" />
                    </div>
                    <div className="space-y-1.5">
                        <label className="block text-sm font-medium text-gray-700">New Password</label>
                        <input type="password" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none" />
                    </div>
                    <div className="space-y-1.5">
                        <label className="block text-sm font-medium text-gray-700">Confirm New Password</label>
                        <input type="password" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none" />
                    </div>
                    <button type="submit" className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-lg hover:opacity-90 text-sm font-medium">Update Password</button>
                </form>
            </div>
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2"><Shield className="w-5 h-5" /> Two-Factor Authentication</h4>
                <p className="text-sm text-gray-500 mb-4">Add an extra layer of security to your account.</p>
                <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-100">Enable 2FA</button>
            </div>
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2"><Key className="w-5 h-5" /> API Keys</h4>
                <p className="text-sm text-gray-500 mb-4">Manage API keys for integrations.</p>
                <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-100">Generate New Key</button>
            </div>
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2"><AlertCircle className="w-5 h-5" /> Active Sessions</h4>
                <p className="text-sm text-gray-500 mb-4">View and manage your active login sessions.</p>
                <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-100">View Sessions</button>
            </div>
        </div>
    </div>
);

const BillingTab = () => (
    <div className="space-y-6">
        <h3 className="text-lg font-semibold text-gray-900">Billing & Subscription</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white border-2 border-cyan-500 rounded-xl p-6">
                <h4 className="font-semibold text-gray-900">Current Plan</h4>
                <p className="text-3xl font-bold text-cyan-600 mt-2">Professional</p>
                <p className="text-sm text-gray-500 mt-1">$49/month</p>
                <ul className="mt-4 space-y-2 text-sm text-gray-600">
                    <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-500" /> Up to 10 team members</li>
                    <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-500" /> 10,000 leads/month</li>
                    <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-500" /> AI Assistant included</li>
                    <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-500" /> Advanced analytics</li>
                    <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-500" /> Priority support</li>
                </ul>
                <button className="mt-6 w-full px-4 py-2 bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-lg hover:opacity-90 text-sm font-medium">Manage Subscription</button>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
                <h4 className="font-semibold text-gray-900">Starter</h4>
                <p className="text-3xl font-bold text-gray-600 mt-2">$19/month</p>
                <ul className="mt-4 space-y-2 text-sm text-gray-600">
                    <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-500" /> Up to 3 team members</li>
                    <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-500" /> 2,000 leads/month</li>
                    <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-500" /> Basic analytics</li>
                    <li className="flex items-center gap-2"><X className="w-4 h-4 text-gray-300" /> AI Assistant</li>
                    <li className="flex items-center gap-2"><X className="w-4 h-4 text-gray-300" /> Priority support</li>
                </ul>
                <button className="mt-6 w-full px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-100">Upgrade</button>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
                <h4 className="font-semibold text-gray-900">Enterprise</h4>
                <p className="text-3xl font-bold text-purple-600 mt-2">Custom</p>
                <ul className="mt-4 space-y-2 text-sm text-gray-600">
                    <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-500" /> Unlimited team members</li>
                    <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-500" /> Unlimited leads</li>
                    <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-500" /> Custom AI models</li>
                    <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-500" /> Dedicated support</li>
                    <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-500" /> SLA guarantee</li>
                </ul>
                <button className="mt-6 w-full px-4 py-2 border border-purple-300 text-purple-600 rounded-lg text-sm font-medium hover:bg-purple-50">Contact Sales</button>
            </div>
        </div>
        <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
            <h4 className="font-semibold text-gray-900 mb-4">Billing History</h4>
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-gray-200">
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Plan</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Invoice</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {[
                            { date: '2026-08-01', plan: 'Professional', amount: '$49.00', status: 'Paid' },
                            { date: '2026-07-01', plan: 'Professional', amount: '$49.00', status: 'Paid' },
                            { date: '2026-06-01', plan: 'Professional', amount: '$49.00', status: 'Paid' },
                        ].map((item, i) => (
                            <tr key={i} className="hover:bg-gray-50">
                                <td className="px-4 py-4 text-sm text-gray-700">{item.date}</td>
                                <td className="px-4 py-4 text-sm text-gray-700">{item.plan}</td>
                                <td className="px-4 py-4 text-sm font-medium text-gray-900">{item.amount}</td>
                                <td className="px-4 py-4"><span className="px-2 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700">{item.status}</span></td>
                                <td className="px-4 py-4 text-right"><button className="text-cyan-600 hover:text-cyan-800 text-sm font-medium">Download</button></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
);

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