import { useState } from "react";
import { User, Menu, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../store/hooks";

const Header = ({ setIsSidebarOpen }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const meta = user?.user_metadata || {};

    const userName =
        meta.full_name ||
        meta.name ||
        user?.email?.split("@")[0] ||
        "Admin";

    const avatarUrl =
        meta.avatar_url ||
        meta.picture ||
        null;                       // null → render the icon fallback

    const userRole = user?.role || "admin";

    const handleLogout = async () => {
        if (isLoggingOut) return; // prevent double-clicks
        setIsLoggingOut(true);
        try {
            await logout?.();
        } catch (err) {
            console.error("Logout error:", err);
        } finally {
            // Always redirect, even if the API call failed
            navigate("/login", { replace: true });
            setIsLoggingOut(false);
        }
    };

    return (
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-4 text-slate-900 md:px-8">
            <div className="flex items-center gap-3">
                <button
                    onClick={() => setIsSidebarOpen(true)}
                    aria-label="Open sidebar"
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
                <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 text-white">
                    {avatarUrl ? (
                        <img
                            src={avatarUrl}
                            alt={userName}
                            className="h-full w-full object-cover"
                            onError={(e) => { e.currentTarget.style.display = "none"; }}
                        />
                    ) : (
                        <User size={20} />
                    )}
                </div>
                <div className="hidden text-right sm:block">
                    <p className="text-sm font-bold text-slate-800">
                        {userName}
                    </p>
                    <p className="text-xs capitalize text-slate-500">
                        {userRole}
                    </p>
                </div>

                <button
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-red-50 text-red-600 transition-colors hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                    title={isLoggingOut ? "Logging out..." : "Logout"}
                    aria-label="Logout"
                >
                    <LogOut size={20} />
                </button>
            </div>
        </header>
    );
};

export default Header;