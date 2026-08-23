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
} from "lucide-react";
import { NavLink } from "react-router-dom";

const Sidebar = ({ isOpen, setIsOpen }) => {
    const menuItems = [
        {
            name: "Dashboard",
            icon: <LayoutDashboard size={20} />,
            path: "/dashboard",
        },
        {
            name: "Leads",
            icon: <Users size={20} />,
            path: "/leads",
        },
        {
            name: "Companies",
            icon: <Building2 size={20} />,
            path: "/companies",
        },
        {
            name: "Contacts",
            icon: <Contact size={20} />,
            path: "/contacts",
        },
        {
            name: "Deals",
            icon: <Handshake size={20} />,
            path: "/deals",
        },
        {
            name: "Activities",
            icon: <CalendarCheck size={20} />,
            path: "/activities",
        },
        {
            name: "Analytics",
            icon: <BarChart3 size={20} />,
            path: "/analytics",
        },
    ];

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
                {/* Mobile Close Button */}
                <div className="mb-6 flex justify-end md:hidden">
                    <button
                        onClick={() => setIsOpen(false)}
                        className="rounded-lg p-2 hover:bg-slate-100"
                    >
                        <X size={22} />
                    </button>
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
                                    onClick={() => setIsOpen(false)}
                                    className={({ isActive }) =>
                                        `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                                            isActive
                                                ? "bg-blue-600 text-white"
                                                : "text-slate-600 hover:bg-blue-50 hover:text-blue-600"
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

                <div className="mt-8 border-t border-slate-200 pt-4">
                    <NavLink
                        to="/settings"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-600 transition hover:bg-blue-50 hover:text-blue-600"
                    >
                        <Settings size={20} />
                        Settings
                    </NavLink>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;