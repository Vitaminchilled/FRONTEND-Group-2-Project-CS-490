import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import './SalonHeader.css'
import headerImage from '../assets/HeaderImage.jpg'
import homeIcon from '../assets/HomeIcon.png'
import emptyHeartIcon from '../assets/EmptyHeartIcon.png'
import fullHeartIcon from '../assets/fullHeartIcon.png'


/* ({ salon_id, headerImage, headerTitle, headerTags, headerRating }) */
function SalonHeader({ salonID, headerTitle, headerTags, headerRatingValue}) {
  function getStarString(rating) {
    let stars = ''
    for (let i = 1; i <= 5; i++) {
      if (rating >= i) stars += '★'
      else if (rating >= i - 0.5) stars += '⯪'
      else stars += '☆'
    }
    return stars
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
        <div className="header-btn">
          <img
            className='image'
            src={emptyHeartIcon}
            alt="<3"
          />
        </div>
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