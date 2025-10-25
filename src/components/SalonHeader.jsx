import { NavLink } from "react-router-dom";
import './SalonHeader.css'
import headerImage from '../assets/HeaderImage.jpg'
import homeIcon from '../assets/HomeIcon.png'
import emptyHeartIcon from '../assets/EmptyHeartIcon.png'
import fullHeartIcon from '../assets/fullHeartIcon.png'
import rating from '../assets/stars/4.png'

/* ({ headerImage, headerTitle, headerTags, headerRating? }) */
function SalonHeader() {
    return (
        <div className="salon-header">
          <div className="header-image"
            style={{
              backgroundImage: `url(${headerImage})` /* {{headerImage}}? */
            }}
          >
            <NavLink  to="/salon/1" end={false} className="header-btn">
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
            Awesome Hair Salon {/* {headerTitle} */}
          </h1>

          <p className="header-tags">
            Nails, Salon Hair Cut, Hair Dye, Hair Wash {/* {headerTags} */}
          </p>

          <img className="rating-img"
            src={rating}
            alt="4 stars"
          />

          <div className='grey-divider'></div>
        </div>
    )
}

export default SalonHeader