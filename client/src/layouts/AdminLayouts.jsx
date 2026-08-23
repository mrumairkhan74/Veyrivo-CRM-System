
import { Outlet } from 'react-router';
import Header from '../components/AdminLayout/Header'
import Sidebar from '../components/AdminLayout/Sidebar'
import { useState } from 'react';

const AdminLayouts = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen bg-[#F8FAFC]">
            <Header
                setIsSidebarOpen={setIsSidebarOpen}
            />

            <div className="flex">
                <Sidebar
                    isOpen={isSidebarOpen}
                    setIsOpen={setIsSidebarOpen}
                />

                <main className="min-h-screen flex-1 p-4 md:p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}

export default AdminLayouts