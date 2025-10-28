import NavBar from './components/NavBar.jsx'
import Login from './pages/Login.jsx'
import CustomerRegistration from './pages/CustomerRegistration.jsx'
import SalonRegistration from './pages/SalonRegistration.jsx'
import Home from './pages/Home.jsx'
import SearchSalons from './pages/SearchSalons.jsx'
import Account from './pages/AccountDetails.jsx'
import SalonDashboard from './pages/SalonDashboard.jsx'
import Services from './pages/Services.jsx'
import Products from './pages/Products.jsx'
import Gallery from './pages/Gallery.jsx'
import { Routes, Route, useLocation } from "react-router-dom"
import { useEffect } from 'react'

function App() {
  const location = useLocation()
  useEffect(() => {
    if (location.pathname === '/account') {
      document.body.style.backgroundColor = '#f0d9b9'
    } else {
      document.body.style.backgroundColor = 'white'
    }
  }, [location])

  return (
    <div>
        {/* Controls Links */}
        <NavBar />

        {/* Controls Routing to Pages */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<SearchSalons />} />
          <Route path="/salon/:salon_id" element={<SalonDashboard />} />
          <Route path="/salon/:salon_id/services" element={<Services/>} />
          <Route path="/salon/:salon_id/products" element={<Products/>} />
          <Route path="/salon/:salon_id/gallery" element={<Gallery/>} />
          <Route path="/account" element={<Account/>} />
          <Route path="/login" element={<Login />}/>
          <Route path="/signup" element={<CustomerRegistration />}/>
          <Route path="/register-salon" element={<SalonRegistration />}/>
        </Routes>
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
    </div>
  )
}

export default App