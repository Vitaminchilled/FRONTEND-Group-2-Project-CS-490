import React, { useState } from 'react'
import { NavLink, useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import emptyCart from "../assets/ShoppingCart.png"
import fullCart from "../assets/FullShoppingCart.png"
import './NavBar.css'

function NavBar() {
  const {user, setUser} = useUser();
  const navigate = useNavigate();
  const [dropdown, setDropdown] = useState(false)

  // Logout handler
  const handleLogout = async () => {
    try {
      const response = await fetch('/api/logout', {
        method: 'POST',
        credentials: 'include'
      });

      if (response.ok) {
        // Clear user context
        setUser({
          type: 'none',
          username: '',
          name: '',
          userId: null,
          isLoading: false
        });
        // Redirect to home
        navigate('/');
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  //if we add anything else for the user profile we can just add it here so it maps on its own
  const userMenuItems = [
    {
      title: 'Account Details',
      path: '/account',
      cName: 'dropdown-link'
    },
    {
      title: 'My Appointments & Rewards',
      path: '/appointment-rewards',
      cName: 'dropdown-link'
    }
  ]

  //same for the salon profile
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
      path: '/manage-service',
      cName: 'dropdown-link'
    },
    {
      title: 'Manage Employees',
      path: '/manage-employee',
      cName: 'dropdown-link'
    },
    {
      title: 'Manage Products',
      path: '/manage-product',
      cName: 'dropdown-link'
    },
    {
      title: 'Manage Gallery',
      path: '/manage-gallery',
      cName: 'dropdown-link'
    }
  ]

  return (
    <nav className='NavBar'>
      <ul className="NavLeft">
        {/* LEFT: None, Customer */}
        {(user.type === 'none' || user.type === 'customer') && (
          <>
            {/* NavLinks have a built in function to see what the active link is */}
            {/* End determines if it will partially match a link, or if it must be exact */}
            <li
              className='nav-item'
            >
              <NavLink  to="/" end={false} className={({ isActive }) => isActive ? "nav-link Selected" : "nav-link"}>
                Home
              </NavLink >
            </li>
            <li
              className='nav-item'
            >
              <NavLink  to="/search" end={false} className={({ isActive }) => isActive ? "nav-link Selected" : "nav-link"}>
                Search
              </NavLink >
            </li>
          </>
        )}
        {/* LEFT: Owner */}
        {(user.type === 'owner') && (
          <>
            <li><NavLink  to="/" end={false} className={({ isActive }) => isActive ? "nav-link Selected" : "nav-link"}>Home</NavLink ></li>
            <li><NavLink  to="/services" end={false} className={({ isActive }) => isActive ? "nav-link Selected" : "nav-link"}>Services</NavLink ></li>
            <li><NavLink  to="/products" end={false} className={({ isActive }) => isActive ? "nav-link Selected" : "nav-link"}>Products</NavLink ></li>
            <li><NavLink  to="/gallery" end={false} className={({ isActive }) => isActive ? "nav-link Selected" : "nav-link"}>Gallery</NavLink ></li>
          </>
        )}
        {/* LEFT: Admin */}
        {(user.type === 'admin') && (
          <>
            <li><NavLink  to="/" end={false} className={({ isActive }) => isActive ? "nav-link Selected" : "nav-link"}>Salons</NavLink ></li>
            <li><NavLink  to="/users" end={false} className={({ isActive }) => isActive ? "nav-link Selected" : "nav-link"}>Users</NavLink ></li>
            <li><NavLink  to="/verify" end={false} className={({ isActive }) => isActive ? "nav-link Selected" : "nav-link"}>Verify</NavLink ></li>
          </>
        )}
      </ul>
        
      <ul className="NavRight">
        {/* RIGHT: None */}
        {(user.type === 'none') && (
          <>
            <li><NavLink  to="/login" end={false} className={({ isActive }) => isActive ? "nav-link Selected" : "nav-link"}>Login</NavLink ></li>
            <li><NavLink  to="/signup" end={false} className={({ isActive }) => isActive ? "nav-link Selected" : "nav-link"}>Sign Up</NavLink ></li>
            <li><NavLink  to="/register-salon" className="Square">Register Salon</NavLink ></li>
          </>
        )}
        {/* RIGHT: Customer */}
        {(user.type === 'customer') && (
          <>
            <li className='nav-item'>
              <button onClick={handleLogout} className="nav-link" style={{border: 'none', background: 'none', cursor: 'pointer', padding: 0, font: 'inherit'}}>
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
              { dropdown && (
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
                          </NavLink >
                        </li>
                      )
                    })}
                  </ul>
                )
              }
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
                {`(0)`} {/* eventually add the number of cart items here and add if for when cart isnt empty for different icon*/}
              </NavLink>
            </li>
          </>
        )}
        {/* RIGHT: Owner */}
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
              { dropdown && (
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
                          </NavLink >
                        </li>
                      )
                    })}
                  </ul>
                )
              }
            </li>
          </>
        )}
        {/* RIGHT: Admin */}
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