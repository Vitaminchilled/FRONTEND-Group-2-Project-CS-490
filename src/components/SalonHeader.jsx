import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import './SalonHeader.css'
import headerImage from '../assets/HeaderImage.jpg'
import homeIcon from '../assets/HomeIcon.png'
import emptyHeartIcon from '../assets/EmptyHeartIcon.png'
import fullHeartIcon from '../assets/FullHeartIcon.png'
import { useUser } from '../context/UserContext';
import { ModalMessage } from './Modal.jsx'


/* ({ salon_id, headerImage, headerTitle, headerTags, headerRating }) */
function SalonHeader({ 
  salonID, headerTitle, headerTags, headerRatingValue
}) {
  const { user } = useUser();
  const [favorites, setFavorites] = useState([])
  const [isFavorite, setIsFavorite] = useState(false)
  
  function getStarString(rating) {
    let stars = ''
    for (let i = 1; i <= 5; i++) {
      if (rating >= i) stars += '★'
      else if (rating >= i - 0.5) stars += '⯪'
      else stars += '☆'
    }
    return stars
  }

  const getFavoritedSalons = async (customerId = user.user_id) => {
      try {
          const response = await fetch(`/api/user_dashboard/favorited_salons?customer_id=${customerId}`, {
              method: 'GET',
              credentials: 'include'
          });

          if (!response.ok) {
              const errorData = await response.json();
              throw new Error(errorData.error || 'Failed to fetch favorited salons');
          }

          const data = await response.json();
          setFavorites(data.favorited_salons || [])
          const favoriteExists = data.favorited_salons.some(
            (salon) => salon.salon_id === salonID
          )
          setIsFavorite(favoriteExists)
      } catch (err) {
          console.error('getFavoritedSalons error:', err);
          throw err;
      }
  }

  const favoriteSalon = async (customerId = user.user_id, salonId = salonID) => {
    try {
        const response = await fetch('/api/user_dashboard/favorite_salon', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ customer_id: customerId, salon_id: salonId })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to favorite salon');
        }

        const data = await response.json();
        return data; // { message: 'Salon favorited successfully' }
    } catch (err) {
        console.error('favoriteSalon error:', err);
        throw err;
    }
  }

  const unfavoriteSalon = async (customerId, salonId) => {
    try {
        const response = await fetch('/api/user_dashboard/unfavorite_salon', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ customer_id: customerId, salon_id: salonId })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to unfavorite salon');
        }

        const data = await response.json();
        return data; // { message: 'Salon unfavorited successfully' }
    } catch (err) {
        console.error('unfavoriteSalon error:', err);
        throw err;
    }
  }

  const headerRating = headerRatingValue ? getStarString(headerRatingValue) : "No rating available"
  
  return (
    <div className="salon-header">
      <div className="header-image"
        style={{
          backgroundImage: `url(${headerImage})` /* {{headerImage}}? */
        }}
      >
        <NavLink to={`/salon/${salonID}`} end={false} className="header-btn">
          <img
            className='image'
            src={homeIcon}
            alt="<"
          />
        </NavLink>
        {/* <div className="header-btn">
          <img
            className='image'
            src={emptyHeartIcon}
            alt="<3"
          />
        </div> */}
        {user.type === 'customer' && (
          <button className="header-btn">
            <img
              className='image'
              src={emptyHeartIcon}
              alt="<3"
            />
          </button>
        )}
      </div>
      
      <h1 className="header-title">
        {headerTitle}
      </h1>

      {headerTags && 
        <p className="header-tags">
          {headerTags.map((tag) => tag.name).join(", ")}
        </p>
      }
      

      <div className="header-rating">
        <p className={headerRatingValue ? "rating-available" : "rating-unavailable"}>{headerRating}</p> 
        {/* checks if average_rating is null to format info correctly */}
      </div>

      <div className='grey-divider'></div>
    </div>
  )
}

export default SalonHeader