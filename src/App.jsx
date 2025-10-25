import NavBar from './components/NavBar.jsx'
import Home from './pages/Home.jsx'
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
          </Routes> 
        </div>
    </div>
  )
}

export default App
