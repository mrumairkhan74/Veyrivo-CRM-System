import { useState } from "react";
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
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const userName =
        user?.full_name || user?.email?.split("@")[0] || "Admin";
    const userRole = user?.role || "user";

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
        // {
        //     name: "Users",
        //     icon: <User size={20} />,
        //     path: "/admin/users",
        //     roles: ["admin"],
        // },
    ];

    const menuItems = allMenuItems.filter((item) =>
        item.roles.includes(userRole)
    );

    const handleLogout = async () => {
        if (isLoggingOut) return; // prevent double-clicks
        setIsLoggingOut(true);
        try {
            await logout?.(); // clear token / state / cache
        } catch (err) {
            console.error("Logout error:", err);
        } finally {
            // Always redirect, even if the API call failed
            navigate("/login", { replace: true });
            setIsLoggingOut(false);
        }
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

            {/* Sidebar shell: fixed height, flex column, never grows past viewport */}
            <aside
                className={`
                    fixed left-0 top-0 z-50 flex h-screen h-dvh w-64 flex-col
                    border-r border-slate-200 bg-white
                    transition-transform duration-300

                    ${isOpen ? "translate-x-0" : "-translate-x-full"}

                    md:static md:h-screen md:h-dvh md:translate-x-0
                `}
            >
                {/* Mobile Close Button — fixed at top */}
                <div className="flex shrink-0 justify-end p-3 md:hidden">
                    <button
                        onClick={() => setIsOpen(false)}
                        aria-label="Close sidebar"
                        className="rounded-lg p-2 hover:bg-slate-100"
                    >
                        <X size={22} />
                    </button>
                </div>

                {/* User Profile — fixed at top */}
                <div className="flex shrink-0 items-center gap-3 px-5 pb-4 pt-3 md:pt-6">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 text-white">
                        <User size={20} />
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-slate-800">
                            {userName}
                        </p>
                        <p className="truncate text-xs capitalize text-slate-500">
                            {userRole}
                        </p>
                    </div>
                </div>

                {/* Scrollable area — takes remaining height and scrolls internally */}
                <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-4 [scrollbar-width:thin]">
                    <p className="mb-4 px-3 text-xs font-bold uppercase tracking-wider text-slate-400">
                        Main Menu
                    </p>

                    <nav>
                        <ul className="space-y-2">
                            {menuItems.map((item) => (
                                <li key={item.name}>
                                    <NavLink
                                        to={item.path}
                                        end={
                                            item.path === "/admin/dashboard"
                                        }
                                        onClick={() => setIsOpen(false)}
                                        className={({ isActive }) =>
                                            `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                                                isActive
                                                    ? "bg-gradient-to-r from-cyan-500 to-purple-600 text-white"
                                                    : "text-slate-600 hover:bg-cyan-50 hover:text-cyan-600"
                                            }`
                                        }
                                    >
                                        {item.icon}
                                        {item.name}
                                    </NavLink>
                                </li>
                            ))}
                        </ul>
                    </nav>

                    {/* Bottom section — scrolls with the menu on short screens */}
                    <div className="mt-8 space-y-2 border-t border-slate-200 pt-4">
                        <NavLink
                            to="/admin/settings"
                            onClick={() => setIsOpen(false)}
                            className={({ isActive }) =>
                                `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                                    isActive
                                        ? "bg-gradient-to-r from-cyan-500 to-purple-600 text-white"
                                        : "text-slate-600 hover:bg-cyan-50 hover:text-cyan-600"
                                }`
                            }
                        >
                            <Settings size={20} />
                            Settings
                        </NavLink>

                        <button
                            onClick={handleLogout}
                            disabled={isLoggingOut}
                            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-red-600 transition hover:bg-red-50 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            <LogOut size={20} />
                            {isLoggingOut ? "Logging out..." : "Logout"}
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;