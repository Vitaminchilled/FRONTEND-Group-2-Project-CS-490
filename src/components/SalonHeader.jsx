import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import './SalonHeader.css'
import headerImage from '../assets/HeaderImage.jpg'
import homeIcon from '../assets/HomeIcon.png'
import emptyHeartIcon from '../assets/EmptyHeartIcon.png'
import fullHeartIcon from '../assets/FullHeartIcon.png'
import { useUser } from '../context/UserContext';
import { ModalMessage } from './Modal.jsx'
import { Pen, Pencil } from 'lucide-react'


/* ({ salon_id, headerImage, headerTitle, headerTags, headerRating }) */
function SalonHeader({ 
  salonID, headerTitle, headerTags, headerRatingValue//,
  //user, setModalMessage
}) {
  const { user } = useUser();
  const [favorites, setFavorites] = useState([])
  const [isFavorite, setIsFavorite] = useState(false)
  const [galleryID, setGalleryID] = useState(0)
  const [bannerImg, setBannerImg] = useState(null)
  const [modifiedOn, setModifiedOn] = useState(null)
  
  function getStarString(rating) {
    let stars = ''
    for (let i = 1; i <= 5; i++) {
      if (rating >= i) stars += '★'
      else if (rating >= i - 0.5) stars += '⯪'
      else stars += '☆'
    }
    return stars
  }

  useEffect(() => {
    if (user?.user_id && user?.type === 'customer' && salonID) {
      getFavoritedSalons();
    }
  }, [user?.user_id, salonID])

  const getSalonPrimaryImage = async () => {
    try {
      const primaryImg_response = await fetch(`/api/salon/${salonID}/image`, {
        credentials: 'include'
      })

      if(!primaryImg_response.ok) {
        const errorText = await primaryImg_response.json()
        throw new Error(`Banner Image fetch failed: HTTP error ${primaryImg_response.status}: ${errorText || errorText}`)
      }
      const primaryImg_data = await primaryImg_response.json()
      const {
        gallery_id: retrievedGalleryID=0,
        image_url: retrievedImageURL,
        last_modified: retrievedLastModified
      } = primaryImg_data || {}

      setBannerImg(retrievedImageURL)
      setGalleryID(retrievedGalleryID)
      setModifiedOn(retrievedLastModified)

    } catch (err) {
      console.error('Fetch error:', err)
    }
  }

  const getFavoritedSalons = async () => {
    try {
      const response = await fetch(`/api/session/favorited_salons`, {
        method: 'GET',
        credentials: 'include'
      })

      if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch favorited salons')
      }

      const data = await response.json()
      console.log(data.favorited_salons)

      setFavorites(data.favorited_salons || [])

      const favoriteExists = data.favorited_salons.some(
        (salon) => Number(salon.salon_id) === Number(salonID)
      )
      
      setIsFavorite(favoriteExists)
    } catch (err) {
      console.error('getFavoritedSalons error:', err);
    }
  }

  const favoriteSalon = async () => {
    try {
        const response = await fetch('/api/session/favorite_salon', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({ 
              customer_id: user.user_id,
              salon_id: salonID 
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to favorite salon');
        }

        const data = await response.json();
        setIsFavorite(true)
    } catch (err) {
        console.error('favoriteSalon error:', err.message);
        throw err;
    }
  }

  const unfavoriteSalon = async () => {
    try {
        const response = await fetch('/api/session/unfavorite_salon', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ customer_id: user.user_id, salon_id: salonID })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to unfavorite salon');
        }

        const data = await response.json();
        setIsFavorite(false)
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
        {user.type === 'customer' && (
          (isFavorite) ? (
            <button className="header-btn"
              onClick={unfavoriteSalon}
            >
              <img
                className='image'
                src={fullHeartIcon}
                alt="<3"
              />
            </button>
          ) : (
            <button className="header-btn"
              onClick={favoriteSalon}
            >
              <img
                className='image'
                src={emptyHeartIcon}
                alt="<3"
              />
            </button>
          )
        )}
        {user.type === 'owner' && Number(user.salon_id) === Number(salonID) && (
          
            <button className="header-btn"
              //onClick={favoriteSalon}
            >
              <Pencil size={20}/>
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