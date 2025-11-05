import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import SalonHeader from '../../components/SalonHeader.jsx'
import productImg from '../../assets/ProductPlaceholder.jpg'

function Products() {
    const { salon_id } = useParams()
    const [salon, setSalon] = useState({})
    const [tags, setTags] = useState([])

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    const retrieveProducts = async () => {
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
        retrieveProducts()
    }, [salon_id])

    return (
        <>
            {(!loading && error ? (
                <p className='not-found'>{error}</p>
            ) : (
                <div className='products-page'
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
                    
                    <div className='products-title'
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '10px',
                            margin: '0',
                            alignItems:'center'
                        }}
                    >
                        <h2 className="page-title"
                            style={{
                                height: '50px'
                            }}
                        >
                            Products
                        </h2>
                        <p className='page-counts'
                            style={{
                                margin: '0',
                                padding: '0'
                            }}
                        >
                            1 of 1
                        </p>
                    </div>

                    <div className="product-group"
                        style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: '25px'
                        }}
                    >
                        <div className='product-item'
                            style={{
                                backgroundColor:'white',
                                boxShadow: 'inset 0 0 5px 0 #b6b6b6',
                                borderRadius: '15px',
                                padding: '20px 12px',
                                width: '25vw',
                                maxWidth: '200px',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                margin: '0',
                                gap: '10px'
                            }}
                        >
                            <img className='product-img'
                                src={productImg}
                                alt='img'
                                style={{
                                    border: '1px solid #b6b6b6',
                                    borderRadius: '15px',
                                    width: '100%',
                                    height: '60%'
                                }}
                            />
                            
                            <div className='product-content'
                                style={{
                                    width: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '10px',
                                    alignItems: 'center'
                                }}
                            >
                                <div className='product-details'
                                    style={{
                                        
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap:'8px',
                                        margin: '0',
                                        padding: '0'
                                    }}
                                >
                                    <h3 className='product-name'
                                        style={{
                                            color: 'black',
                                            fontFamily: 'Kumbh Sans',
                                            fontSize: '18px',
                                            margin: '0',
                                            padding: '0'
                                        }}
                                    >
                                        Product Name
                                    </h3>
                                    <p className='product-price'
                                        style={{
                                            color: 'black',
                                            fontFamily: 'Kumbh Sans',
                                            fontSize: '15px',
                                            margin: '0',
                                            padding: '0'
                                        }}
                                    >
                                        $9.99
                                    </p>
                                    <p className='product-description'
                                        style={{
                                            color: 'black',
                                            fontFamily: 'Kumbh Sans',
                                            fontSize: '15px',
                                            margin: '0',
                                            padding: '0'
                                        }}
                                    >
                                        Long product description with extra flourish
                                    </p>
                                </div>
                                <button className='product-btn'
                                    style={{
                                        backgroundColor:'#b98a59',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '10px',
                                        padding: '8px 10px',
                                        fontWeight: '600',
                                        fontSize: '15px',
                                        width: 'fit-content'
                                    }}
                                >
                                    Add to Cart
                                </button>
                            </div>
                        </div>
                        <div className='product-item'
                            style={{
                                backgroundColor:'white',
                                boxShadow: 'inset 0 0 5px 0 #b6b6b6',
                                borderRadius: '15px',
                                padding: '20px 12px',
                                width: '25vw',
                                maxWidth: '200px',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                margin: '0',
                                gap: '10px'
                            }}
                        ></div>
                        
                    </div>
                </div>
            ))}
        </>
    )
}

export default Products