import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react';
import { useAuthStore } from './store';
import ProtectedRoute from './components/AdminLayout/ProtectedRoute';
import AuthCallback from './pages/AuthCallback';
// Public pages with public layout. 
// In this none login user can view as he want
import PublicLayouts from './layouts/PublicLayouts'
import Home from './pages/public/Home'


// Admin pages with admin layouts.
// In this user need to login to check out data
import AdminLayouts from './layouts/AdminLayouts'
import AdminDashboard from './pages/admin/AdminDashboard'
import Login from './pages/Login'
import Signup from './pages/Signup'
import ConfirmEmail from './pages/ConfirmEmail'
import Page404 from './pages/Page404'
import Leads from './pages/admin/Leads'
import Companies from './pages/admin/Companies'
import Contacts from './pages/admin/Contacts'
import Deals from './pages/admin/Deals'
import Activities from './pages/admin/Activities'
import Analytics from './pages/admin/Analytics'
import AIAssistant from './pages/admin/AIAssistant'
import Settings from './pages/admin/Settings'
// import Users from './pages/admin/Users'
// import Users from './pages/admin/Users'

const App = () => {
  const initialize = useAuthStore((state) => state.initialize);

  useEffect(() => {
    let subscription;
    initialize().then((sub) => { subscription = sub; });
    return () => subscription?.unsubscribe();
  }, [initialize]);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Route */}
        <Route path="/" element={<PublicLayouts />}>
          <Route index element={<Home />} />
          {/* <Route path="about" element={<About />} /> */}
        </Route>
        {/* Protected Admin Layout */}
        <Route path="/admin" element={<AdminLayouts />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          {/* Admin-only routes - wrapped with ProtectedRoute */}
          <Route path="leads" element={<ProtectedRoute requiredRole="admin"><Leads /></ProtectedRoute>} />
          <Route path="companies" element={<ProtectedRoute requiredRole="admin"><Companies /></ProtectedRoute>} />
          <Route path="contacts" element={<ProtectedRoute requiredRole="admin"><Contacts /></ProtectedRoute>} />
          <Route path="deals" element={<ProtectedRoute requiredRole="admin"><Deals /></ProtectedRoute>} />
          <Route path="activities" element={<ProtectedRoute requiredRole="admin"><Activities /></ProtectedRoute>} />
          <Route path="analytics" element={<ProtectedRoute requiredRole="admin"><Analytics /></ProtectedRoute>} />
          <Route path="ai" element={<ProtectedRoute requiredRole="admin"><AIAssistant /></ProtectedRoute>} />
          <Route path="settings" element={<ProtectedRoute requiredRole="admin"><Settings /></ProtectedRoute>} />
          {/* <Route path="users" element={<ProtectedRoute requiredRole="admin"><Users /></ProtectedRoute>} /> */}
          {/* <Route path="users" element={<Users />} /> */}
        </Route>
        <Route path='/login' element={<Login />} />
        <Route path='/signup' element={<Signup />} />
        <Route path='/confirm-email' element={<ConfirmEmail />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path='*' element={<Page404 />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App