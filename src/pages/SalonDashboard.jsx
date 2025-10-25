import { NavLink } from 'react-router-dom'
import SalonHeader from '../components/SalonHeader.jsx'
import DashboardGroup from '../components/DashboardGroup.jsx'
import apple from '../assets/apple.jpg'
import door from '../assets/door.jpg'
import cheyenne from '../assets/cheyenne.jpg'
import pork from '../assets/pork.png'
import EmployeeItem from '../components/EmployeeItem.jsx'
import four from '../assets/stars/4.png'


function SalonDashboard() {
  return (
    <div className="salon-dashboard-page"
      style={{
        display:'flex',
        flexDirection:'column',
        alignItems: 'center',
        gap:'30px',
        paddingBottom: '180px'
      }}
    >
        <SalonHeader/>

        <div className='dashboard-cards'
          style={{
            display:'flex',
            gap:'20px',
            alignItems:'center'
          }}
        >
          <NavLink className='card'
            to="/salon/1/services" 
            end={false} 
            style={{
              backgroundColor: '#fff8f4ff',
              boxShadow: 'inset 0 0 4px #a69385ff',
              padding: '18px',
              borderRadius: '10px',
              height: '300px',
              width: '15vw',
              maxWidth: '180px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'end',
              fontFamily: 'Lateef',
              fontSize: '30px',

              textDecoration: 'none',
              color: 'black'
            }}
          >
            Services
          </NavLink>
          
          <NavLink className='card'
            to="/salon/1/products" 
            end={false} 
            style={{
              backgroundColor: '#fff8f4ff',
              boxShadow: 'inset 0 0 4px #a69385ff',
              padding: '18px',
              borderRadius: '10px',
              height: '300px',
              width: '15vw',
              maxWidth: '180px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'end',
              fontFamily: 'Lateef',
              fontSize: '30px',

              textDecoration: 'none',
              color: 'black'
            }}
          >
            Products
          </NavLink>

          <NavLink className='card'
            to="/salon/1/gallery" 
            end={false} 
            style={{
              backgroundColor: '#fff8f4ff',
              boxShadow: 'inset 0 0 4px #a69385ff',
              padding: '18px',
              borderRadius: '10px',
              height: '300px',
              width: '15vw',
              maxWidth: '180px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'end',
              fontFamily: 'Lateef',
              fontSize: '30px',

              textDecoration: 'none',
              color: 'black'
            }}
          >
            Gallery
          </NavLink>

        </div>

        <DashboardGroup
          groupTitle='About Us'
          groupExtra='170 Bleeker Street, Ocean City NJ, 08070'
        />  

        <p className='about-us'
          style={{
            width: '70vw',
            maxWidth: '700px',
            margin: '0'
          }}
        >
          At Awesome Hair Salon, we believe great hair can change 
          your day and your confidence. Our expert stylists 
          specialize in modern cuts, vibrant color, and personalized 
          care that brings out your unique style. Whether you're 
          here for a quick refresh or a total transformation, we'll 
          make sure you leave looking (and feeling) awesome
        </p>

        <DashboardGroup
          groupTitle='Meet the Staff'
        />
        
        <div className='meet-staff'
          style={{
            display:'flex',
            flexDirection:'column',
            alignItems:'center',
            width: '80vw',
            gap:'20px'
          }}
        >
          
          <EmployeeItem
            employeeImg={apple}
            employeeName="Henry Apple"
            employeeDesc="Over 8 years of experience, specializes in classic cuts and effortless everyday styles."
          />

          <EmployeeItem
            employeeImg={door}
            employeeName='Ashley Door'
            employeeDesc="Specializes in creative hair coloring and modern styles that bring out each client's personality."
          />

          <EmployeeItem
            employeeImg={cheyenne}
            employeeName="Cheyenne Aitch"
            employeeDesc="Specializes in detailed nail art and clean, long lasting manicures with a focus on creativity and precision."
          />

          <EmployeeItem
            employeeImg={pork}
            employeeName="Johnathan Pork"
            employeeDesc="Specializes in relaxing hair washes and scalp treatments that leave every client refreshed and ready for their style."
          />

        </div>

        <DashboardGroup
          groupTitle='Reviews'
          groupExtra='1k+ Ratings - 500+ Reviews'
          groupImg={four}
        />  

    </div>
  )
}

export default SalonDashboard