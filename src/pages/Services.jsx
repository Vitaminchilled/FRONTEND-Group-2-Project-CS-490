import SalonHeader from '../components/SalonHeader.jsx'
import stripeBackground from "../assets/stripeBackground.png"

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
          <div className="service-item"
            style={{
              backgroundColor: 'white',
              border: '1px solid #a4a4a4',
              minWidth: '480px',
              maxWidth: '740px',
              width:'60vw',
              height: '90px',
              borderRadius: '10px',
              padding: '20px',
              boxShadow: '0 5px 5px #b0b0b0ff'
            }}
          >
            Hair Cut
          </div>
        
          <div className="service-item"
            style={{
              backgroundColor: 'white',
              border: '1px solid #a4a4a4',
              minWidth: '480px',
              maxWidth: '740px',
              width:'60vw',
              height: '90px',
              borderRadius: '10px',
              padding: '20px',
              boxShadow: '0 5px 5px #b0b0b0ff'
            }}
          >
            Wash and Blow Out
          </div>

          <div className="service-item"
            style={{
              backgroundColor: 'white',
              border: '1px solid #a4a4a4',
              minWidth: '480px',
              maxWidth: '740px',
              width:'60vw',
              height: '90px',
              borderRadius: '10px',
              padding: '20px',
              boxShadow: '0 5px 5px #b0b0b0ff'
            }}
          >
            Highlights
          </div>

          <div className="service-item"
            style={{
              backgroundColor: 'white',
              border: '1px solid #a4a4a4',
              minWidth: '480px',
              maxWidth: '740px',
              width:'60vw',
              height: '90px',
              borderRadius: '10px',
              padding: '20px',
              boxShadow: '0 5px 5px #b0b0b0ff'
            }}
          >
            Partial Balayage
          </div>

          <div className="service-item"
            style={{
              backgroundColor: 'white',
              border: '1px solid #a4a4a4',
              minWidth: '480px',
              maxWidth: '740px',
              width:'60vw',
              height: '90px',
              borderRadius: '10px',
              padding: '20px',
              boxShadow: '0 5px 5px #b0b0b0ff'
            }}
          >
            Braids and Styling
          </div>

        </div>

      </div>
    </div>
  )
}

export default Services