import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import './SalonHeader.css'
import headerImage from '../assets/HeaderImage.jpg'
import homeIcon from '../assets/HomeIcon.png'
import emptyHeartIcon from '../assets/EmptyHeartIcon.png'
import fullHeartIcon from '../assets/fullHeartIcon.png'
import rating from '../assets/stars/4.png'

/* ({ salon_id, headerImage, headerTitle, headerTags, headerRating? }) */
function SalonHeader({ salonID, headerTitle, headerTags }) {
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

      <div className="header-tags">
        {headerTags && headerTags.map((tag,index) => {
          const isLast = index === headerTags.length-1
          if (isLast)
            return <p key={index} className="tag">{tag}</p>
          else
            return <p key={index} className="tag comma">{tag},</p>
        })}
      </div>

      <img className="rating-img"
        src={rating}
        alt="4 stars" //add functionality later
      />

      <div className='grey-divider'></div>
    </div>
  )
}

export default SalonHeader