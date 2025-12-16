import React, { useState } from 'react'
import { NavLink, useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import emptyCart from "../assets/ShoppingCart.png"
import fullCart from "../assets/FullShoppingCart.png"
import NotificationBell from './NotificationBell';
import './NavBar.css'

function NavBar() {
  const {user, setUser, loading} = useUser();
  const navigate = useNavigate();
  const [dropdown, setDropdown] = useState(false)

  if (loading) {
    return null;
  }

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/logout', {
        method: 'POST',
        credentials: 'include'
      });

      if (response.ok) {
        setUser({
          type: 'none',
          name: null,
          username: null,
          user_id: null,
          salon_id: null,
          is_verified: null
        });
        navigate('/');
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const userMenuItems = [
    {
      title: 'Account Details',
      path: '/account',
      cName: 'dropdown-link'
    },
    {
      title: 'My Appointments',
      path: '/appointments',
      cName: 'dropdown-link'
    },
    {
      title: 'My Rewards',
      path: '/rewards',
      cName: 'dropdown-link'
    }
  ]

  const salonMenuItems = [
    {
      title: 'Account Details',
      path: '/account',
      cName: 'dropdown-link'
    },
    {
      title: 'Business Calendar',
      path: '/business-calendar',
      cName: 'dropdown-link'
    },
    {
      title: 'Manage Services',
      path: user.salon_id ? `/salon/${user.salon_id}/services` : '/',
      cName: 'dropdown-link'
    },
    {
      title: 'Manage Schedules',
      path: user.salon_id ? `/salon/${user.salon_id}/manage-schedules` : '/',
      cName: 'dropdown-link'
    },
    {
      title: 'Operating Hours',
      path: user.salon_id ? `/salon/${user.salon_id}/operating-hours` : '/',
      cName: 'dropdown-link'
    },
    {
      title: 'Send Notifications',
      path: '/send-notifications',
      cName: 'dropdown-link'
    },
    {
      title: 'Manage Products',
      path: user.salon_id ? `/salon/${user.salon_id}/products` : '/',
      cName: 'dropdown-link'
    },
    {
      title: 'Manage Gallery',
      path: user.salon_id ? `/salon/${user.salon_id}/gallery` : '/',
      cName: 'dropdown-link'
    }
  ]

  return (
    <nav className='NavBar'>
      <ul className="NavLeft">
        {(user.type === 'none' || user.type === 'customer') && (
          <>
            <li className='nav-item'>
              <NavLink to="/" end={false} className={({ isActive }) => isActive ? "nav-link Selected" : "nav-link"}>
                Home
              </NavLink>
            </li>
            <li className='nav-item'>
              <NavLink to="/search" end={false} className={({ isActive }) => isActive ? "nav-link Selected" : "nav-link"}>
                Search
              </NavLink>
            </li>
          </>
        )}
        {(user.type === 'owner' && user.salon_id && user.is_verified) && (
          <>
            <li><NavLink to={`/salon/${user.salon_id}`} end={true} className={({ isActive }) => isActive ? "nav-link Selected" : "nav-link"}>Home</NavLink></li>
            <li><NavLink to={`/salon/${user.salon_id}/services`} end={false} className={({ isActive }) => isActive ? "nav-link Selected" : "nav-link"}>Services</NavLink></li>
            <li><NavLink to={`/salon/${user.salon_id}/products`} end={false} className={({ isActive }) => isActive ? "nav-link Selected" : "nav-link"}>Products</NavLink></li>
            <li><NavLink to={`/salon/${user.salon_id}/gallery`} end={false} className={({ isActive }) => isActive ? "nav-link Selected" : "nav-link"}>Gallery</NavLink></li>
          </>
        )}
        {(user.type === 'admin') && (
          <>
            <li><NavLink to="/" end={false} className={({ isActive }) => isActive ? "nav-link Selected" : "nav-link"}>Salons</NavLink></li>
            <li><NavLink to="/users" end={false} className={({ isActive }) => isActive ? "nav-link Selected" : "nav-link"}>Users</NavLink></li>
            <li><NavLink to="/verify" end={false} className={({ isActive }) => isActive ? "nav-link Selected" : "nav-link"}>Verify</NavLink></li>
            <li><NavLink to="/admin/analytics" end={false} className={({ isActive }) => isActive ? "nav-link Selected" : "nav-link"}>Analytics</NavLink></li>
          </>
        )}
      </ul>
        
      <ul className="NavRight">
        {(user.type === 'none') && (
          <>
            <li><NavLink to="/login" end={false} className={({ isActive }) => isActive ? "nav-link Selected" : "nav-link"}>Login</NavLink></li>
            <li><NavLink to="/signup" end={false} className={({ isActive }) => isActive ? "nav-link Selected" : "nav-link"}>Sign Up</NavLink></li>
            <li><NavLink to="/register-salon" className="Square">Register Salon</NavLink></li>
          </>
        )}
        {(user.type === 'customer') && (
          <>
            <li className='nav-item'>
              <button onClick={handleLogout} className="nav-link" style={{border: 'none', background: 'none', cursor: 'pointer', padding: 0, font: 'inherit'}}>
                Log Out
              </button>
            </li>
            <li className='nav-item'>
              <NotificationBell />
            </li>
            <li
              className='nav-item'
              onMouseEnter={() => setDropdown(true)}
              onMouseLeave={() => setDropdown(false)}
              style={{position:'relative'}}
            >
              <div className='Square'>{user.name || user.username}</div>
              {dropdown && (
                <ul
                  onClick={() => setDropdown(false)}
                  className='nav-dropdown'
                >
                  {userMenuItems.map((item, index) => {
                    const isLast = index === userMenuItems.length-1
                    const navLinkStyle = {
                      borderBottomLeftRadius: isLast ? '25px' : '0px',
                      borderBottomRightRadius: isLast ? '25px' : '0px'
                    }

                    return (
                      <li 
                        key={index}
                        style={navLinkStyle}
                      >
                        <NavLink  
                          to={item.path}
                          className={({ isActive }) => isActive ? "dropdown-link Selected" : "dropdown-link"}
                        >
                          {item.title}
                        </NavLink>
                      </li>
                    )
                  })}
                </ul>
              )}
            </li>
            <li className='nav-item'>
              <NavLink
                to="/shopping-cart"
                end={false}
                className={({ isActive }) => isActive ? "nav-link SelectedCart" : "nav-link"}
              >
                <img
                  className='cart-image'
                  src={emptyCart}
                  alt="Cart"
                />
              </NavLink>
            </li>
          </>
        )}
        {(user.type === 'owner') && (
          <>
            <li className='nav-item'>
              <button onClick={handleLogout} className="nav-link" style={{background: 'none', border: 'none', cursor: 'pointer', padding: 0, font: 'inherit'}}>
                Log Out
              </button>
            </li>
            <li
              className='nav-item'
              onMouseEnter={() => setDropdown(true)}
              onMouseLeave={() => setDropdown(false)}
              style={{position:'relative'}}
            >
              <div className='Square'>{user.name || user.username}</div>
              {dropdown && (
                <ul
                  onClick={() => setDropdown(false)}
                  className='nav-dropdown'
                >
                  {salonMenuItems.map((item, index) => {
                    const isLast = index === salonMenuItems.length-1
                    const navLinkStyle = {
                      borderBottomLeftRadius: isLast ? '25px' : '0px',
                      borderBottomRightRadius: isLast ? '25px' : '0px'
                    }

                    return (
                      <li 
                        key={index}
                        style={navLinkStyle}
                      >
                        <NavLink  
                          to={item.path}
                          className={({ isActive }) => isActive ? "dropdown-link Selected" : "dropdown-link"}
                        >
                          {item.title}
                        </NavLink>
                      </li>
                    )
                  })}
                </ul>
              )}
            </li>
          </>
        )}
        {(user.type === 'admin') && (
          <>
            <li>
              <button onClick={handleLogout} className="nav-link" style={{background: 'none', border: 'none', cursor: 'pointer', padding: 0, font: 'inherit'}}>
                Log Out
              </button>
            </li>
          </>
        )}
      </ul>
    </nav>
  )
}

export default NavBar
