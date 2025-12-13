import NavBar from './components/NavBar.jsx'
import Home from './pages/Home.jsx'
import SearchSalons from './pages/SearchSalons.jsx'
import Account from './pages/AccountDetails.jsx'
import Verify from './pages/Verify.jsx'
import Salons from './pages/Salons.jsx'
import Users from './pages/Users.jsx'
import { useUser } from "./context/UserContext";
import SalonDashboard from './pages/SalonPages/SalonDashboard.jsx'
import SalonServices from './pages/SalonPages/Services.jsx'
import SalonProducts from './pages/SalonPages/Products.jsx'
import Reviews from './pages/SalonPages/Reviews.jsx'
import ManageEmployeeSchedule from './pages/SalonPages/ManageEmployeeSchedule';
import OperatingHours from './pages/SalonPages/OperatingHours.jsx'
import Rewards from './pages/Rewards.jsx'
import SalonRegistration from "./pages/LoginRegistration/SalonRegistration.jsx";
import CustomerRegistration from './pages/LoginRegistration/CustomerRegistration.jsx'
import Logout from './pages/LoginRegistration/Logout.jsx'
import Login from './pages/LoginRegistration/Login.jsx'
import BusinessCalendar from './pages/BusinessCalendar.jsx'
import MyAppointments from './pages/MyAppointments.jsx'
import AdminAnalytics from './pages/AdminAnalytics.jsx'
import SendNotifications from './pages/SendNotifications.jsx'
import Cart from './pages/Cart.jsx'
import { Routes, Route, Navigate } from "react-router-dom"
import './App.css'

function App() {
  const {user, setUser, loading} = useUser();

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
        <NavBar />

        <div className="AppContent"> 
          <Routes >
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
            <Route path="/salon/:salon_id/reviews" element={<Reviews />} />
            <Route path="/salon/:salon_id/manage-schedules" element={<ManageEmployeeSchedule />} />
            <Route path="/salon/:salon_id/operating-hours" element={<OperatingHours />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<CustomerRegistration />} />
            <Route path="/register-salon" element={<SalonRegistration />} />
            <Route path="/logout" element={<Logout />} />
            <Route path="/business-calendar" element={<BusinessCalendar />} />
            <Route path="/appointments" element={<MyAppointments/>} />
            <Route path="/rewards" element={<Rewards />}/>
            <Route path="/users" element={<Users />}/>
            <Route path="/admin/analytics" element={<AdminAnalytics />}/>
            <Route path="/send-notifications" element={<SendNotifications />} />
             <Route path="/shopping-cart" element={<Cart />}/>
          </Routes>
        </div>
    </div>
  )
}

export default App