import { useParams } from 'react-router-dom'
import { useState, useEffect } from 'react'
import SalonHeader from '../components/SalonHeader.jsx'

function Products() {
  const { salon_id } = useParams()

    const [salon, setSalon] = useState({})
    const [tags, setTags] = useState([])
  
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
  
    const retrievedSalon = async () => {
      setLoading(true);
      setError(null);
  
      try {
        const header_response = await fetch(`http://127.0.0.1:5000/salon/info/${salon_id}`)
  
        if(!header_response.ok) {
          const errorText = await header_response.text()
          throw new Error(`HTTP error ${header_response.status}: ${errorText}`)
        }
  
        const salon_data = await header_response.json()

        console.log(salon_data)
        //destructuring data in the case that if it is null/undefined it defaults as a {} with default salon and total_page values
  
        const {
          salon: retrievedSalonHere=[],
          tags: retrievedTags=[]
        } = salon_data || {}

        setSalon(retrievedSalonHere)
        setTags(retrievedTags)
  
      } catch (err) {
        console.error('Fetch error:', err)
        setError(err.message || "Unexpected Error Occurred")
      } finally {
        setLoading(false)
      }
    }
  
    useEffect(() => {
      retrievedSalon()
    }, [salon_id])
  
  return (
    <>
      {(!loading && error ? (
          <p className='not-found'>No salon found for Salon ID {salon_id}.</p>
      ) : (
        <div className="products-page">
          <SalonHeader
            salonID={salon_id}
            headerTitle={salon.salon_name}
            headerTags={tags}
          />
        </div>
      ))}
    </>
  )
}

export default Products