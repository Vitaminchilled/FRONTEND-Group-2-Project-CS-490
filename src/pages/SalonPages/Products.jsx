import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useUser } from "../../context/UserContext";
import SalonHeader from '../../components/SalonHeader.jsx'
import ProductCard from '../../components/ProductCard.jsx'
import './Products.css'

function Products() {
    const { salon_id } = useParams()
    const {user, setUser} = useUser()
    const [salon, setSalon] = useState({})
    const [tags, setTags] = useState([])
    const [products, setProducts] = useState([])

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    const [editingProductId, setEditingProductId] = useState(null);
    const [newProduct, setNewProduct] = useState(null)

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
    }, [])

    const handleProductChange = (product_id) => {
        setProducts((prev) => prev.filter((p) => p.product_id !== product_id))
    }

    const handleStartEdit = (productID) => {
        setEditingProductId(productID)
    }

    const handleCancelEdit = () => {
        setEditingProductId(null)
    }

    return (
        <>
            {(!loading && error ? (
                <p className='not-found'>{error}</p>
            ) : (
                <div className='products-page'>
                    <SalonHeader
                        salonID={salon_id}
                        headerTitle={salon.salon_name}
                        headerTags={tags}
                        headerRatingValue={salon.average_rating}
                    />
                    
                    <div className='title-group'>
                        <h2 className="page-title">
                            Products
                        </h2>
                        <p className='page-counts'>
                            1 of 1
                        </p>
                    </div>

                    <div className="product-group">
                        <ProductCard
                            accountType={user.type}
                            product={{
                                product_id: 1,
                                salon_id: 1,
                                name: "Shampoo A",
                                description: "Sulfate-free shampoo with more text to see how it behaves",
                                price: 12.99,
                                stock_quantity: 50,
                                image_url: null,
                                created_at: "2025-11-05 21:59:23",
                                last_modified: "2025-11-05 21:59:23"
                            }}
                            isEditing={editingProductId === 1}
                            onStartEdit={() => handleStartEdit(1)}
                            onCancelEdit={handleCancelEdit}
                        />
                        
                    </div>
                </div>
            ))}
        </>
    )
}

export default Products