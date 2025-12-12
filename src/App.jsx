import NavBar from './components/NavBar.jsx'
import Home from './pages/Home.jsx'
import SearchSalons from './pages/SearchSalons.jsx'
import Account from './pages/AccountDetails.jsx'
import Verify from './pages/Verify.jsx'
import Salons from './pages/Salons.jsx'
import Users from './pages/Users.jsx'
import { useUser } from "./context/UserContext";
//Salon Dashboard Pages put into one folder to keep it together
import SalonDashboard from './pages/SalonPages/SalonDashboard.jsx'
import SalonServices from './pages/SalonPages/Services.jsx'
import SalonProducts from './pages/SalonPages/Products.jsx'
import Rewards from './pages/Rewards.jsx'
import Cart from './pages/Cart.jsx'
import SalonRegistration from './pages/LoginRegistration/SalonRegistration.jsx'
import CustomerRegistration from './pages/LoginRegistration/CustomerRegistration.jsx'
import Logout from './pages/LoginRegistration/Logout.jsx'
import Login from './pages/LoginRegistration/Login.jsx'

import { Routes, Route, Navigate } from "react-router-dom"

import './App.css'

function App() {
  const {user} = useUser();

  return (
    <div>
        {/* Controls Links */}
        <NavBar />

        {/* Controls Routing to Pages */}
        <div className="AppContent"> 
          <Routes >
            {/* NEEDS TO REFRESH AFTER USER LOGS IN!! (might alredy do)*/}
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

            {/* LOGIN/LOGOUT/SIGNUP/REGISTRATION ROUTES */}
            <Route path="/signup" element={<CustomerRegistration />} />
            <Route path="/register-salon" element={<SalonRegistration />} />
            <Route path="/login" element={<Login />} />
            <Route path="/logout" element={<Logout />} />

            {/* GEN ROUTES */}
            <Route path="/search" element={<SearchSalons />} />
            <Route path="/account" element={<Account />}/>

            {/* SALON ROUTES */}
            <Route path="/salon/:salon_id" element={<SalonDashboard />} />
            <Route path="/salon/:salon_id/services" element={<SalonServices />} />
            <Route path="/salon/:salon_id/products" element={<SalonProducts />} />
            <Route path="/rewards" element={<Rewards />}/>
            <Route path="/shopping-cart" element={<Cart />}/>
            
            {/* ADMIN ROUTES */}
            <Route path="/verify" element={<Verify />}/>
            <Route path="/users" element={<Users />}/>
            
          </Routes>
        </div>
    </div>
  )
}

export default App