import { useState, useEffect } from 'react'
import { useParams, NavLink } from 'react-router-dom'
import SalonHeader from '../components/SalonHeader.jsx'
import DashboardGroup from '../components/DashboardGroup.jsx'
import employeeIcon from '../assets/PersonIcon.png'
import EmployeeItem from '../components/EmployeeItem.jsx'
import four from '../assets/stars/4.png'


function SalonDashboard() {
  const { salon_id } = useParams()
  const [salon, setSalon] = useState({})
  const [tags, setTags] = useState([])
  const [employees, setEmployees] = useState([])

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const retrieveSalons = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`http://127.0.0.1:5000/salon/info/${salon_id}`)

      if (response.status === 404) {
        setError("Salon not found")
        setServices([])
        return
      }

      if(!response.ok) {
        const errorText = await response.text()
        throw new Error(`HTTP error ${response.status}: ${errorText}`)
      }

      const data = await response.json()
      console.log(data)
      //destructuring data in the case that if it is null/undefined it defaults as a {} with default salon and total_page values
      const { 
        salon: retrievedSalon=[], tags: retrievedTags=[], employees: retrievedEmployees=[]
      } = data || {}
      
      setSalon(retrievedSalon)
      setTags(retrievedTags)
      setEmployees(retrievedEmployees)
    } catch (err) {
      console.error('Fetch error:', err)
      setError(err.message || "Unexpected Error Occurred")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    retrieveSalons()
  }, [salon_id])

  return (
    <>
      {(!loading && error ? (
        <p className='not-found'>No salon found for Salon ID {salon_id}.</p>
      ) : (
        <div className="salon-dashboard-page"
          style={{
            display:'flex',
            flexDirection:'column',
            alignItems: 'center',
            gap:'30px',
            paddingBottom: '180px'
          }}
        >
            <SalonHeader
              salonID={salon_id}
              headerTitle={salon.salon_name}
              headerTags={tags}
            />

            <div className='dashboard-cards'
              style={{
                display:'flex',
                gap:'20px',
                alignItems:'center'
              }}
            >
              <NavLink className='card'
                to={`/salon/${salon_id}/services`}
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
                to={`/salon/${salon_id}/products`}
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
                to={`/salon/${salon_id}/gallery`} 
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
              groupExtra={`${salon.address}, ${salon.city}, ${salon.state} ${salon.postal_code}, ${salon.country}`}
            />

            <p className='about-us'
              style={{
                width: '70vw',
                maxWidth: '700px',
                margin: '0'
              }}
            >
              At this Salon, we believe great hair can change 
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
              {loading && <p>Loading salons...</p>}
              {error && <p>{error}</p>}
              {employees.map((employee) => (
                <EmployeeItem
                  key={employee.employee_id}
                  employeeImg={employeeIcon}
                  employeeName={`${employee.employee_first_name} ${employee.employee_last_name}`}
                  employeeDesc={employee.description}
                />
              ))}
            </div>

            <DashboardGroup
              groupTitle='Reviews'
              groupExtra='1k+ Ratings - 500+ Reviews'
              groupImg={four}
            />  

        </div>
      ))}
    </>
  )
}

export default SalonDashboard