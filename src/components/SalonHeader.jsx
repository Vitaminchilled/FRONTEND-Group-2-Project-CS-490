import './SalonHeader.css'
import headerImage from '../assets/HeaderImage.jpg'

/* ({ headerImage, headerTitle, headerTags, headerRating? }) */
function SalonHeader() {
    return (
        <div className="salon-header">
          <div className="header-image"
            style={{
              backgroundImage: `url(${headerImage})` /* {{headerImage}}? */
            }}
          >
            <div className="header-btn">
              {'<'}
            </div>
            <div className="header-btn">
              {'<3'}
            </div>
          </div>
          
          <h1 className="formal-title">
            Awesome Hair Salon {/* {headerTitle} */}
          </h1>

          <p className="header-tags">
            Nails, Salon Hair Cut, Hair Dye, Hair Wash {/* {headerTags} */}
          </p>

          <div className='grey-divider'></div>
        </div>
    )
}

export default SalonHeader