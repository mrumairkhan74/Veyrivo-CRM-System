import { Outlet } from "react-router-dom";
import Header from "../components/AdminLayout/Header";
import Sidebar from "../components/AdminLayout/Sidebar";
import ProtectedRoute from "../components/AdminLayout/ProtectedRoute";
import { useState } from "react";

const AdminLayouts = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="h-screen overflow-hidden bg-[#F8FAFC]">
            <Header
                setIsSidebarOpen={setIsSidebarOpen}
            />

            {/* Main Layout */}
            <div className="flex h-[calc(100vh-73px)]">
                <Sidebar
                    isOpen={isSidebarOpen}
                    setIsOpen={setIsSidebarOpen}
                />

                {/* Protected Content */}
                <main className="min-w-0 flex-1 overflow-y-auto p-2 md:p-4">
                    <ProtectedRoute>
                        <Outlet />
                    </ProtectedRoute>
                </main>
            </div>
        </div>
    );
};

export default AdminLayouts;