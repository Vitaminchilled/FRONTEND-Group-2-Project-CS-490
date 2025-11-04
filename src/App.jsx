import NavBar from './components/NavBar.jsx'
import Home from './pages/Home.jsx'
import SearchSalons from './pages/SearchSalons.jsx'
import Account from './pages/AccountDetails.jsx'
import Verify from './pages/Verify.jsx'

//Salon Dashboard Pages put into one folder to keep it together
import SalonDashboard from './pages/SalonPages/SalonDashboard.jsx'
import SalonServices from './pages/SalonPages/Services.jsx'

import { Routes, Route } from "react-router-dom"
import './App.css'

function App() {
  return (
    <div>
        {/* Controls Links */}
        <NavBar />

        {/* Controls Routing to Pages */}
        <div className="AppContent"> 
          <Routes >
            <Route path="/" element={<Home />} />
            <Route path="/search" element={<SearchSalons />} />
            <Route path="/account" element={<Account />}/>
            <Route path="/verify" element={<Verify />}/>
            <Route path="/salon/:salon_id" element={<SalonDashboard />} />
            <Route path="/salon/:salon_id/services" element={<SalonServices />} />
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