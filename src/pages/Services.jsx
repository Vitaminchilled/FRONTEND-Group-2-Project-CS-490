import './Services.css'
import SalonHeader from '../components/SalonHeader.jsx'
import stripeBackground from "../assets/stripeBackground.png"
import ServiceItem from '../components/ServiceItem.jsx'

function Services() {
  return (
    <div className="services-page">
      <div className="services-background"
        style={{
          backgroundImage: `url(${stripeBackground})`,
        }}
      >
      </div>

      <div className="services-content">
        
        <SalonHeader/>

        <h2 className="page-title">
          Services
        </h2>

        <div className="service-group">
          <ServiceItem
            itemTitle='Hair Cut'
            itemPrice='$60.00'
            itemDesc='This standard haircut includes a trim and partial styling. Wash and Blow Out is not included.'
            itemDuration='1 hour'
            itemTags={['Salon Hair Cut', 'Any Hair Type']}
          />

          
          <ServiceItem
            itemTitle='Wash & Blowout'
            itemPrice='$30.00'
            itemDesc='Our professionals will provide both a relaxing wash and amazing hair style using our professional-grade products'
            itemDuration='40 minutes'
            itemTags={['Salon Hair Styling', 'Any Hair Type', 'Heat Styling']}
          />

          <ServiceItem
            itemTitle='Highlights'
            itemPrice='$100.00'
            itemDesc='The highlights package will include a color of your choice with a complimentary shampoo and conditioner to help maintain your new color.'
            itemDuration='40 minutes'
            itemTags={['Hair Dye', 'Any Hair Type']}
          />

          <ServiceItem
            itemTitle='Partial Balayage'
            itemPrice='$150.00'
            itemDesc='Hand painted bleach and glaze that brightens your hair as if it were made of woven gold itself. We pride ourselves on our world-class technique.'
            itemDuration='1 hour'
            itemTags={['Hair Dye', 'Any Hair Type']}
          />

          <ServiceItem
            itemTitle='Braids and Styling'
            itemPrice='$40.00'
            itemDesc='Leave it to our professionals to give you a new and refreshing look for your prom or wedding.'
            itemDuration='30 minutes'
            itemTags={['Salon Hair Styling', 'Heat Styling', 'Any Hair Type']}
          />
          
        </div>

      </div>
    </div>
  )
}

export default Services