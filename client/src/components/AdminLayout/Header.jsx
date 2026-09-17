import { User, Menu, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../store/hooks";

const Header = ({ setIsSidebarOpen }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const userName = user?.full_name || user?.email?.split('@')[0] || 'Admin';

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-4 text-slate-900 md:px-8">
            <div className="flex items-center gap-3">
                <button
                    onClick={() => setIsSidebarOpen(true)}
                    className="rounded-lg p-2 hover:bg-slate-100 md:hidden"
                >
                    <Menu size={24} />
                </button>
                {/* Logo */}
                <div className="flex items-center gap-3">
                    <span className="bg-gradient-to-b from-cyan-500 to-purple-500 bg-clip-text text-3xl font-black text-transparent">
                        V
                    </span>

                    <h2 className="text-2xl font-bold tracking-tight">
                        Veyrivo
                        <span className="ml-1 bg-gradient-to-b from-cyan-500 to-purple-500 bg-clip-text text-transparent">
                            CRM
                        </span>
                    </h2>
                </div>
            </div>

            {/* User */}
            <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 text-white">
                    <User size={20} />
                </div>

                <div className="hidden sm:block text-right">
                    <p className="text-sm font-bold text-slate-800">{userName}</p>
                    <p className="text-xs text-slate-500">Admin</p>
                </div>

                <button
                    onClick={handleLogout}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                    title="Logout"
                >
                    <LogOut size={20} />
                </button>
            </div>
        </header>
    );
};

export default Header;