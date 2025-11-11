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

import { Routes, Route } from "react-router-dom"
import './App.css'

function App() {
  const {user, setUser} = useUser();

  return (
    <div>
        {/* Controls Links */}
        <NavBar />

        {/* Controls Routing to Pages */}
        <div className="AppContent"> 
          <Routes >
            {/* NEEDS TO REFRESH AFTER USER LOGS IN!! (might alredy do)*/}
            {(user.type === 'none' || user.type === 'customer' || user.type === 'owner') && (
              <Route path="/" element={<Home />} />
            )}
            {(user.type === 'admin') && (
              <Route path="/" element={<Salons />} />
            )}
            <Route path="/search" element={<SearchSalons />} />
            <Route path="/account" element={<Account />}/>
            <Route path="/verify" element={<Verify />}/>
            <Route path="/salon/:salon_id" element={<SalonDashboard />} />
            
            <Route path="/users" element={<Users />}/>
            {/*
            Routes to include:
              /account is account details and should depend on the account type
              /appointment-rewards is customer "My Appointments & Rewards"

              /business-calendar
              /manage-service
              /manage-employee
              /manage-product
              /manage-gallery
              /services
              /products
              /gallery

              /login
              /signup
              /register-salon

              / for admin which is tentatively the salons list to view analytics
              /users for admin list of users and some analytics
              /verify for admin list of businesses to verify

              consider adding a path to view a specific salon dashboard as a customer
              /salons/:salon_id
            */}
          </Routes>
        </div>
    </div>
  )
}

export default App