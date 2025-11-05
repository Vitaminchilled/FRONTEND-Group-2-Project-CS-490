import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import SalonHeader from '../../components/SalonHeader.jsx'

function Products() {
    const { salon_id } = useParams()
    const [salon, setSalon] = useState({})
    const [tags, setTags] = useState([])

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    const retrievedGallery = async () => {
        setLoading(true);
        setError(null);

        try {
            const salon_response = await fetch(`/api/salon/${salon_id}/header`)
            
            if (salon_response.status === 404) {
                setError("Salon not found")
                setServices([])
                return
            }

            if(!salon_response.ok) {
                const errorText = await salon_response.text()
                throw new Error(`Salon fetch failed: HTTP error ${salon_response.status}: ${errorText}`)
            }

            const salon_data = await salon_response.json()
            console.log(salon_data)

            const {
                salon: retrievedSalon=[],
                tags: retrievedTags=[]
            } = salon_data || {}

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
        retrievedGallery()
    }, [salon_id])

    return (
        <>
            {(!loading && error ? (
                <p className='not-found'>{error}</p>
            ) : (
                <div className='gallery-page'
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '25px',
                        alignItems: 'center',
                        padding: '0',
                        minHeight: '500px',
                        paddingBottom: '180px'
                    }}
                >
                    <SalonHeader
                        salonID={salon_id}
                        headerTitle={salon.salon_name}
                        headerTags={tags}
                        headerRatingValue={salon.average_rating}
                    />
                    
                    
                    <h2 className="page-title">
                        Gallery
                    </h2>
                    

                    <div className="gallery-group"
                        style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: '25px'
                        }}
                    >
                        Text
                    </div>
                </div>
            ))}
        </>
    )
}

export default Products