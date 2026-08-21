import { BrowserRouter, Routes, Route } from 'react-router'

// Public pages with public layout. 
// In this none login user can view as he want
import PublicLayouts from './layouts/PublicLayouts'
import Home from './pages/public/Home'


// Admin pages with admin layouts.
// In this user need to login to check out data
import AdminLayouts from './layouts/AdminLayouts'
import AdminDashboard from './pages/admin/AdminDashboard'

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
          <Route index element={<AdminDashboard />} />
          {/* <Route path="users" element={<Users />} /> */}
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App