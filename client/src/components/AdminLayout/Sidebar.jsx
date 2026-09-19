import {
    LayoutDashboard,
    Users,
    Building2,
    Contact,
    Handshake,
    CalendarCheck,
    BarChart3,
    Settings,
    X,
    Bot,
    LogOut,
    User,
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../store/hooks";

const Sidebar = ({ isOpen, setIsOpen }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const userName = user?.full_name || user?.email?.split('@')[0] || 'Admin';
    const userRole = user?.role || 'user';
    
    // Filter menu items based on user role
    const allMenuItems = [
        {
            name: "Dashboard",
            icon: <LayoutDashboard size={20} />,
            path: "/admin/dashboard",
            roles: ["admin", "user"],
        },
        {
            name: "Leads",
            icon: <Users size={20} />,
            path: "/admin/leads",
            roles: ["admin"],
        },
        {
            name: "Companies",
            icon: <Building2 size={20} />,
            path: "/admin/companies",
            roles: ["admin"],
        },
        {
            name: "Contacts",
            icon: <Contact size={20} />,
            path: "/admin/contacts",
            roles: ["admin"],
        },
        {
            name: "Deals",
            icon: <Handshake size={20} />,
            path: "/admin/deals",
            roles: ["admin"],
        },
        {
            name: "Activities",
            icon: <CalendarCheck size={20} />,
            path: "/admin/activities",
            roles: ["admin"],
        },
        {
            name: "Analytics",
            icon: <BarChart3 size={20} />,
            path: "/admin/analytics",
            roles: ["admin"],
        },
        {
            name: "AI Assistant",
            icon: <Bot size={20} />,
            path: "/admin/ai",
            roles: ["admin"],
        },
    ];


    // Filter menu items based on user role
    const menuItems = allMenuItems.filter(item => item.roles.includes(userRole));

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    onClick={() => setIsOpen(false)}
                    className="fixed inset-0 z-40 bg-black/40 md:hidden"
                />
            )}

            <aside
                className={`
                    fixed left-0 top-0 z-50 h-screen w-64
                    border-r border-slate-200 bg-white p-4
                    transition-transform duration-300

                    ${isOpen ? "translate-x-0" : "-translate-x-full"}

                    md:static md:min-h-screen md:translate-x-0
                `}
            >
                <div className="h-full flex flex-col overflow-y-auto md:overflow-visible md:h-auto">
                    {/* Mobile Close Button */}
                    <div className="mb-6 flex justify-end md:hidden">
                        <button
                            onClick={() => setIsOpen(false)}
                            className="rounded-lg p-2 hover:bg-slate-100"
                        >
                            <X size={22} />
                        </button>
                    </div>

                    {/* User Profile */}
                    <div className="mb-6 flex items-center gap-3 px-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 text-white">
                            <User size={20} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-slate-800 truncate">{userName}</p>
                            <p className="text-xs text-slate-500 truncate">Admin</p>
                        </div>
                    </div>

                    <p className="mb-4 px-3 text-xs font-bold uppercase tracking-wider text-slate-400">
                        Main Menu
                    </p>

                    <nav>
                        <ul className="space-y-2">
                            {menuItems.map((item) => (
                                <li key={item.name}>
                                    <NavLink
                                        to={item.path}
                                        end={item.path === "/admin/dashboard"}
                                        onClick={() => setIsOpen(false)}
                                        className={({ isActive }) =>
                                            `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${isActive
                                                ? "bg-gradient-to-r from-cyan-500 to-purple-600 text-white"
                                                : "text-slate-600 hover:bg-cyan-50 hover:text-cyan-600"
                                            }`}
                                    >
                                        {item.icon}
                                        {item.name}
                                    </NavLink>
                                </li>
                            ))}
                        </ul>
                    </nav>

                    <div className="mt-8 border-t border-slate-200 pt-4 space-y-2">
                        <NavLink
                            to="/admin/settings"
                            onClick={() => setIsOpen(false)}
                            className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-600 transition hover:bg-cyan-50 hover:text-cyan-600"
                        >
                            <Settings size={20} />
                            Settings
                        </NavLink>

                        <button
                            onClick={handleLogout}
                            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-red-600 transition hover:bg-red-50 hover:text-red-700"
                        >
                            <LogOut size={20} />
                            Logout
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;