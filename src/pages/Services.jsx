import './Services.css'
import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import SalonHeader from '../components/SalonHeader.jsx'
import stripeBackground from "../assets/stripeBackground.png"
import ServiceItem from '../components/ServiceItem.jsx'

function Services() {
  const { salon_id } = useParams()
  const [salon, setSalon] = useState({})
  const [tags, setTags] = useState([])
  const [services, setServices] = useState([])

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const retrieveServices = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`http://127.0.0.1:5000/salon/services/${salon_id}`)
      const header_response = await fetch(`http://127.0.0.1:5000/salon/info/${salon_id}`)

      if (response.status === 404) {
        setError("Salon not found")
        setServices([])
        return
      }

      if(!response.ok || !header_response.ok) {
        const errorText = await response.text()
        throw new Error(`HTTP error ${response.status}: ${errorText}`)
      }

      const data = await response.json()
      const salon_data = await header_response.json()
      console.log(data)
      console.log(salon_data)
      //destructuring data in the case that if it is null/undefined it defaults as a {} with default salon and total_page values
      const { 
        services: retrievedServices=[]
      } = data || {}

      const {
        salon: retrievedSalon=[],
        tags: retrievedTags=[]
      } = salon_data || {}
      
      setServices(retrievedServices)
      setSalon(retrievedSalon)
      setTags(retrievedTags)

    } catch (err) {
      console.error('Fetch error:', err)
      setError(err.message || "Unexpected Error Occurred")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    retrieveServices()
  }, [salon_id])

  return (
    <>
      {(!loading && error ? (
        <p className='not-found'>No salon found for Salon ID {salon_id}.</p>
      ) : (
        <div className="services-page">
          <div className="services-background"
            style={{
              backgroundImage: `url(${stripeBackground})`,
            }}
          >
          </div>

          <div className="services-content">
            
            <SalonHeader
              salonID={salon_id}
              headerTitle={salon[3]}
              headerTags={tags}
            />

            <h2 className="page-title">
              Services
            </h2>

            <div className="service-group">
              {loading && <p>Loading salons...</p>}
              {error && <p>{error}</p>}
              {services.map((service) => (
                <ServiceItem
                  key={service[0]}
                  itemTitle={service[2]}
                  itemPrice={service[6]}
                  itemDesc={service[4]}
                  itemDuration={service[5]}
                  itemTags={service[3]}
                />
              ))}
            </div>

          </div>
        </div>
      ))}
    </>
  )
}

export default Services