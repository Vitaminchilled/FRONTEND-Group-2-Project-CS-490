import NavBar from './components/NavBar.jsx'
import Home from './pages/Home.jsx'
import SearchSalons from './pages/SearchSalons.jsx'
import Account from './pages/AccountDetails.jsx'
import MyAppointments from './pages/MyAppointments.jsx'
import Rewards from './pages/Rewards.jsx'
import Verify from './pages/Verify.jsx'
import Salons from './pages/Salons.jsx'
import Users from './pages/Users.jsx'
import { useUser } from "./context/UserContext"
//Salon Dashboard Pages put into one folder to keep it together
import SalonDashboard from './pages/SalonPages/SalonDashboard.jsx'
import SalonServices from './pages/SalonPages/Services.jsx'
import SalonProducts from './pages/SalonPages/Products.jsx'
import SalonGallery from './pages/SalonPages/Gallery.jsx'
import SalonReviews from './pages/SalonPages/Reviews.jsx'

import Login from './pages/Login.jsx'
import Logout from './pages/Logout.jsx'
import SalonRegistration from "./pages/SalonRegistration.jsx";
import CustomerRegistration from './pages/CustomerRegistration.jsx'
import BusinessCalendar from './pages/BusinessCalendar.jsx'
import AdminAnalytics from './pages/AdminAnalytics.jsx'
import ManageEmployeeSchedule from './pages/SalonPages/ManageEmployeeSchedule';


import { Routes, Route, Navigate } from "react-router-dom"
import './App.css'

function App() {
  const {user, setUser} = useUser()

  return (
    <div>
        {/* Controls Links */}
        <NavBar />

        {/* Controls Routing to Pages */}
        <div className="AppContent"> 
          <Routes >
            {/* temp owner directed here will change later */}
            {(user.type === 'none' || user.type === 'customer') && (
              <Route path="/" element={<Home />} />
            )}
            {(user.type === 'owner') && (
              <Route path="/" element={
                user.salon_id ? (
                  <Navigate to={`/salon/${user.salon_id}`} replace />
                ) : (
                  <div style={{padding: '20px', textAlign: 'center'}}>
                    <h2>No Salon Associated</h2>
                    <p>Please contact support if you believe this is an error.</p>
                  </div>
                )
              } />
            )}
            {(user.type === 'admin') && (
              <Route path="/" element={<Salons />} />
            )}
            <Route path="/search" element={<SearchSalons />} />
            <Route path="/account" element={<Account />}/>
            <Route path="/verify" element={<Verify />}/>
            <Route path="/salon/:salon_id" element={<SalonDashboard />} />
            <Route path="/salon/:salon_id/services" element={<SalonServices />} />
            <Route path="/salon/:salon_id/products" element={<SalonProducts />} />
            <Route path="/salon/:salon_id/gallery" element={<SalonGallery />} />
            <Route path="/salon/:salon_id/reviews" element={<SalonReviews />} />
            <Route path="/users" element={<Users />}/>
            <Route path="/appointments" element={<MyAppointments />}/>
            <Route path="/rewards" element={<Rewards/>}/>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<CustomerRegistration />} />
            <Route path="/register-salon" element={<SalonRegistration />} />
            <Route path="/business-calendar" element={<BusinessCalendar />} />
            <Route path="/salon/:salon_id/manage-schedules" element={<ManageEmployeeSchedule />} />
            <Route path="/logout" element={<Logout />} />
            <Route path="/users" element={<Users />}/>
            <Route path="/admin/analytics" element={<AdminAnalytics />}/>
          </Routes>
        </div>
    </div>
  )
}

export default App