import SalonHeader from '../components/SalonHeader.jsx'
import stripeBackground from "../assets/stripeBackground.png"
import ServiceItem from '../components/ServiceItem.jsx'

function Services() {
  return (
    <div className="services-page"
      style={{
        position:'relative',
        paddingBottom: '180px',
        display:'flex',
        justifyContent:'center',
        width:'100%',
        minHeight:'100vh',
        overflow:'hidden'
      }}
    >
      <div className="services-background"
        style={{
          position: 'absolute',
          top: '464px',
          left:'0',
          right:'0',
          bottom:'0',
          backgroundImage: `url(${stripeBackground})`,
          backgroundRepeat: "repeat-y",
          backgroundSize:'clamp(300px, 80% ,900px)', /* might change this */
          backgroundPosition: "center top",
          zIndex:'-1'
        }}
      >
      </div>

      <div className="services-content" 
        style={{
          display:"flex", 
          flexDirection:"column", 
          gap:'25px',
          alignItems:'center', 
          padding: '0',
          minHeight:'500px'
        }}
      >
        
        <SalonHeader/>

        <h2 className="formal-title"
          style={{
            fontFamily:'Lateef',
            fontWeight: '500',
            fontSize:'45px',
            margin:'0',
            padding:'0'
          }}
        >
          Services
        </h2>

        <div className="service-group"
          style={{
            display:'flex', 
            flexDirection:'column', 
            gap:'10px'
          }}
        >
          <ServiceItem
            itemTitle='Hair Cut'
            itemPrice='$60.00'
            itemDesc='This standard haircut includes a trim and partial styling. Wash and Blow Out is not included.'
          />

          <ServiceItem
            itemTitle='Wash & Blowout'
            itemPrice='$30.00'
            itemDesc='Our professionals will provide both...'
          />

          <ServiceItem
            itemTitle='Highlights'
            itemPrice='$100.00'
            itemDesc='The highlights package will include...'
          />

          <ServiceItem
            itemTitle='Partial Balayage'
            itemPrice='$150.00'
            itemDesc='Hand painted bleach and glaze...'
          />

          <ServiceItem
            itemTitle='Braids and Styling'
            itemPrice='$40.00'
            itemDesc='Leave it to our professionals to...'
          />
        
        </div>

      </div>
    </div>
  )
}

export default Services