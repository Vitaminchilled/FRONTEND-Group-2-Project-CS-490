import NavBar from './components/NavBar.jsx'
import Home from './pages/Home.jsx'
import { Routes, Route } from "react-router-dom"

function App() {
  return (
    <div>
        {/* Controls Links */}
        <NavBar />

        {/* Controls Routing to Pages */}
        <Routes>
            <Route path="/" element={<Home />} />
        </Routes>
    </div>
  )
}

export default App
