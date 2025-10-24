import './SalonHeader.css'

function SalonHeader() {
    return (
        <div className="salon-header">
          <div className="header-image">
            <div className="header-btn">
              {'<'}
            </div>
            <div className="header-btn">
              {'<3'}
            </div>
          </div>
          
          <h1 className="formal-title">
            Awesome Hair Salon {/* customize title */}
          </h1>

          <p className="header-tags">
            Nails, Salon Hair Cut, Hair Dye, Hair Wash {/* customize tags */}
          </p>

          <div className='grey-divider'></div>
        </div>
    )
}

export default SalonHeader