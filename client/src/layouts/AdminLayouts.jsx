
import Header from '../components/AdminLayout/Header'
import Sidebar from '../components/AdminLayout/Sidebar'
import { Outlet } from 'react-router'

const AdminLayouts = () => {
    return (
        <>
            <Header />
            <aside>
                <Sidebar />
            </aside>
            <main>
                <Outlet />
            </main>
            <footer />
        </>
    )
}

export default AdminLayouts