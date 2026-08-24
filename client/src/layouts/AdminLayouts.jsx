import { Outlet } from "react-router-dom";
import Header from "../components/AdminLayout/Header";
import Sidebar from "../components/AdminLayout/Sidebar";
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

                {/* Outlet Content */}
                <main className="min-w-0 flex-1 overflow-y-auto p-2 md:p-4">
                    <Outlet />
                </main>

            </div>
        </div>
    );
};

export default AdminLayouts;