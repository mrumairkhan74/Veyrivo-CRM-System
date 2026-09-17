import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../store/hooks";

const ProtectedRoute = ({ requiredRole = "user" }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-cyan-500 border-t-transparent"></div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    const userRole = user?.role || "user";

    // Admin can access everything
    if (userRole === "admin") {
        return <Outlet />;
    }

    // Regular users can only access dashboard and limited features
    if (requiredRole === "admin" && userRole !== "admin") {
        return <Navigate to="/admin/dashboard" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;