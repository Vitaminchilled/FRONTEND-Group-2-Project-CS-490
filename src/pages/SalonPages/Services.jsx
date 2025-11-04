import './Services.css'
import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import SalonHeader from '../../components/SalonHeader.jsx'
import stripeBackground from "../../assets/stripeBackground.png"
import ServiceItem from '../../components/ServiceItem.jsx'

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
      const salon_response = await fetch(`/api/salon/${salon_id}/header`)
      const services_response = await fetch(`/api/salon/${salon_id}/services`)

      if (salon_response.status === 404) {
        setError("Salon not found")
        setServices([])
        return
      }

      if(!salon_response.ok) {
        const errorText = await salon_response.text()
        throw new Error(`Salon fetch failed: HTTP error ${salon_response.status}: ${errorText}`)
      }

      if(!services_response.ok) {
        const errorText = await response.text()
        throw new Error(`Services fetch failed: HTTP error ${services_response.status}: ${errorText}`)
      }

      const salon_data = await salon_response.json()
      const services_data = await services_response.json()
      console.log(salon_data)
      console.log(services_data)
      //destructuring data in the case that if it is null/undefined it defaults as a {} with default salon and total_page values
      const { 
        services: retrievedServices=[]
      } = services_data || {}

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
        <p className='not-found'>{error}</p>
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
              headerTitle={salon.salon_name}
              headerTags={tags}
              headerRatingValue={salon.average_rating}
            />

            <h2 className="page-title">
              Services
            </h2>

            <div className="service-group">
              {services.map((service) => (
                <ServiceItem
                  key={service.service_id}
                  itemTitle={service.service_name}
                  itemPrice={service.price}
                  itemDesc={service.description}
                  itemDuration={service.duration_minutes}
                  itemTags={service.tag_names}
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