import { NavLink } from "react-router-dom";
import { useUser } from "../context/UserContext";
import './NavBar.css'

function NavBar() {
  const {user, setUser} = useUser();
  return (
    <nav className='NavBar'>
      <ul className="NavLeft">
        {/* LEFT: None, Customer */}
        {(user.type === 'none' || user.type === 'customer') && (
          <>
            {/* NavLinks have a built in function to see what the active link is */}
            {/* End determines if it will partially match a link, or if it must be exact */}
            <li><NavLink  to="/" end={false} className={({ isActive }) => isActive ? "Selected" : ""}>Home</NavLink ></li>
            <li><NavLink  to="/search" end={false} className={({ isActive }) => isActive ? "Selected" : ""}>Search</NavLink ></li>
          </>
        )}
        {/* LEFT: Owner */}
        {(user.type === 'owner') && (
          <>
            <li><NavLink  to="/" end={false} className={({ isActive }) => isActive ? "Selected" : ""}>Home</NavLink ></li>
            <li><NavLink  to="/services" end={false} className={({ isActive }) => isActive ? "Selected" : ""}>Services</NavLink ></li>
            <li><NavLink  to="/products" end={false} className={({ isActive }) => isActive ? "Selected" : ""}>Products</NavLink ></li>
            <li><NavLink  to="/gallery" end={false} className={({ isActive }) => isActive ? "Selected" : ""}>Gallery</NavLink ></li>
          </>
        )}
        {/* LEFT: Admin */}
        {(user.type === 'admin') && (
          <>
            <li><NavLink  to="/" end={false} className={({ isActive }) => isActive ? "Selected" : ""}>Salons</NavLink ></li>
            <li><NavLink  to="/users" end={false} className={({ isActive }) => isActive ? "Selected" : ""}>Users</NavLink ></li>
            <li><NavLink  to="/verify" end={false} className={({ isActive }) => isActive ? "Selected" : ""}>Verify</NavLink ></li>
          </>
        )}
      </ul>
        
      <ul className="NavRight">
        {/* RIGHT: None */}
        {(user.type === 'none') && (
          <>
            <li><NavLink  to="/login" end={false} className={({ isActive }) => isActive ? "Selected" : ""}>Login</NavLink ></li>
            <li><NavLink  to="/signup" end={false} className={({ isActive }) => isActive ? "Selected" : ""}>Sign Up</NavLink ></li>
            <li><NavLink  to="/register-salon" className="Square">Register Salon</NavLink ></li>
          </>
        )}
        {/* RIGHT: Customer */}
        {(user.type === 'customer') && (
          <>
            <li><NavLink  to="/logout" end={false} className={({ isActive }) => isActive ? "Selected" : ""}>Log Out</NavLink ></li>
            <li><NavLink  to="/register-salon" className="Square">{user.name}</NavLink ></li>
          </>
        )}
        {/* RIGHT: Owner */}
        {(user.type === 'owner') && (
          <>
            <li><NavLink  to="/logout" end={false} className={({ isActive }) => isActive ? "Selected" : ""}>Log Out</NavLink ></li>
            <li><NavLink  to="/register-salon" className="Square">{user.name}</NavLink ></li>
          </>
        )}
        {/* RIGHT: Admin */}
        {(user.type === 'admin') && (
          <>
            <li><NavLink  to="/logout" end={false} className={({ isActive }) => isActive ? "Selected" : ""}>Log Out</NavLink ></li>
          </>
        )}
      </ul>
    </nav>
  )
}

export default NavBar
