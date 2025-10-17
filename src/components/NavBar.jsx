import { NavLink } from "react-router-dom";
import './NavBar.css'

function NavBar() {
  return (
    <nav className='NavBar'>
      <ul className="NavLeft">
        {/* NavLinks have a built in function to see what the active link is */}
        {/* End determines if it will partially match a link, or if it must be exact */}
        <li><NavLink  to="/" end={false} className={({ isActive }) => isActive ? "Selected" : ""}>Home</NavLink ></li>
        <li><NavLink  to="/search" end={false} className={({ isActive }) => isActive ? "Selected" : ""}>Search</NavLink ></li>
      </ul>
      <ul className="NavRight">
        <li><NavLink  to="/login" end={false} className={({ isActive }) => isActive ? "Selected" : ""}>Login</NavLink ></li>
        <li><NavLink  to="/signup" end={false} className={({ isActive }) => isActive ? "Selected" : ""}>Sign Up</NavLink ></li>
        <li><NavLink  to="/register-salon" className="Register">Register Salon</NavLink ></li>
      </ul>
    </nav>
  )
}

export default NavBar
