import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

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
import Page404 from './pages/Page404'
import Leads from './pages/admin/Leads'
import Companies from './pages/admin/Companies'
import Contacts from './pages/admin/Contacts'
import Deals from './pages/admin/Deals'
import Activities from './pages/admin/Activities'
import Analytics from './pages/admin/Analytics'
import AIAssistant from './pages/admin/AIAssistant'

const App = () => {
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
          <Route path="leads" element={<Leads />} />
          <Route path="companies" element={<Companies />} />
          <Route path="contacts" element={<Contacts />} />
          <Route path="deals" element={<Deals />} />
          <Route path="activities" element={<Activities />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="ai" element={<AIAssistant />} />
          {/* <Route path="users" element={<Users />} /> */}
        </Route>
        <Route path='/login' element={<Login />} />
        <Route path='/signup' element={<Signup />} />
        <Route path='*' element={<Page404 />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App