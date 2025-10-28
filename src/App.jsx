import NavBar from './components/NavBar.jsx'
import Home from './pages/Home.jsx'
import SearchSalons from './pages/SearchSalons.jsx'
import Account from './pages/AccountDetails.jsx'
import Login from './pages/Login.jsx'
import CustomerRegistration from './pages/CustomerRegistration.jsx'
import SalonRegistration from './pages/SalonRegistration.jsx'
import { Routes, Route } from "react-router-dom"

function App() {
  return (
    <div>
        {/* Controls Links */}
        <NavBar />

        {/* Controls Routing to Pages */}
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/search" element={<SearchSalons />} />
            <Route path="/account" element={<Account/>}/>
            <Route path="/login" element={<Login />}/>
            <Route path="/signup" element={<CustomerRegistration />}/>
            <Route path="/register-salon" element={<SalonRegistration />}/>
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
  )
}

export default App