import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useUser } from "../../context/UserContext";
import SalonHeader from '../../components/SalonHeader.jsx'
import ProductCard from '../../components/ProductCard.jsx'
import './Products.css'

import {ModalProductDelete, ModalMessage} from '../../components/Modal.jsx';

function Products() {
    const { salon_id } = useParams()
    const {user} = useUser()
    const [salon, setSalon] = useState({})
    const [tags, setTags] = useState([])
    const [products, setProducts] = useState([])

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    const [newProduct, setNewProduct] = useState(null)
    const [modalProduct, setModalProduct] = useState(null)
    const [modalMessage, setModalMessage] = useState(null)

    useEffect(() => {
        if (modalProduct || modalMessage) {
        document.body.style.overflow = "hidden";
        } else {
        document.body.style.overflow = "";
        }
        return () => {
        document.body.style.overflow = "";
        };
    }, [modalProduct, modalMessage]);

    const retrieveProducts = async () => {
        setLoading(true);
        setError(null);

        try {
            const salon_response = await fetch(`/api/salon/${salon_id}/header`)
            const products_response = await fetch(`/api/products/view?salon_id=${salon_id}`)
            
            if (salon_response.status === 404) {
                setError("Salon not found")
                setProducts([])
                return
            }

            if(!salon_response.ok) {
                const errorText = await salon_response.text()
                throw new Error(`Salon fetch failed: HTTP error ${salon_response.status}: ${errorText || errorText}`)
            }

            if(!products_response.ok) {
                const errorText = await products_response.text()
                throw new Error(`Products fetch failed: HTTP error ${products_response.status}: ${errorText.error || errorText}`)
            }

            const salon_data = await salon_response.json()
            const products_data = await products_response.json()
            console.log(salon_data)
            console.log(products_data)

            const {
                salon: retrievedSalon=[],
                tags: retrievedTags=[]
            } = salon_data || {}

            const {
                products: retrievedProducts=[]
            } = products_data || {}

            setSalon(retrievedSalon)
            setProducts(retrievedProducts)
            console.log(products)
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

    //displays Delete Modal for the selected product and then clicking confirm passes the onDelete function
    const handleDeleteClick = (product) => {
        setModalProduct(product)
    }

    const handleCancelNewProduct = () => {
        setNewProduct(null)
    }

    const handleAddProduct = async (productData) => {
        try {
            const cleanedData = {
                name: productData.name.trim(),
                description: productData.description.trim(),
                price: parseFloat(productData.price),
                stock_quantity: parseInt(productData.stock_quantity),
                salon_id: parseInt(salon_id)
            }

            console.log(cleanedData)

            const response = await fetch(`/api/products`, {
                method: 'POST',
                headers: {
                'Content-Type': 'application/json'
                },
                body: JSON.stringify(cleanedData)
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(`Add Product fetch failed: HTTP error ${response.status}: ${errorData.error || errorData}`)
            }

            const data = await response.json()
            setModalMessage({
                title: 'Success',
                content: data.message
            })
            setNewProduct(null)
            await retrieveProducts()
        } catch (err) {
            console.error(err)
            setNewProduct(null)
            setModalMessage({
                title: 'Error',
                content: err.message || 'This product could not be added.'
            })
        }
    }

    const handleSaveEdit = async (udpatedProduct) => {
        try {
            const cleanedData = {
                product_id: parseInt(udpatedProduct.product_id),
                salon_id: parseInt(salon_id),
                name: udpatedProduct.name.trim(),
                description: udpatedProduct.description.trim(),
                price: parseFloat(udpatedProduct.price),
                stock_quantity: parseInt(udpatedProduct.stock_quantity)
            }

            const editResponse = await fetch(`/api/products/${udpatedProduct.product_id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(cleanedData)
            })

            if (!editResponse.ok) {
                const errorData = await editResponse.json()
                throw new Error(`Edit Product fetch failed: HTTP error ${editResponse.status}: ${errorData.error || errorData}`)
            }

            const data = await editResponse.json()
            setModalMessage({
                title: "Success",
                content: data.message
            })
            await retrieveProducts()
        } catch (err) {
            console.error(err)
            setModalMessage({
                title: "Error",
                content: err.message || 'This product could not be updated.'
            })
        }
    }

    const handleDeleteProduct = async (productID) => {
        try {
            const deleteResponse = await fetch(`/api/products/delete/${productID}?salon_id=${salon_id}`, {
                method: 'DELETE'
            })

            if (!deleteResponse.ok) {
                const errorData = await deleteResponse.json()
                throw new Error(`Delete Product fetch failed: HTTP error ${deleteResponse.status}: ${errorData.error || errorData}`)
            }

            const data = await deleteResponse.json()
            setModalProduct(null)
            setModalMessage({
                title: "Success",
                content: data.message
            })
            await retrieveProducts()
        } catch (err) {
            console.error(err)
            setModalProduct(null)
            setModalMessage({
                title: "Error",
                content: err.message || 'This product could not be deleted.'
            })
        }
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
                        {products.map((product) => (
                            <ProductCard
                                key={product.product_id}
                                accountType={user.type}
                                user={user}
                                salon={salon}
                                product={product}
                                onSaveEdit={handleSaveEdit}
                                onDelete={() => handleDeleteClick(product)} 
                            />
                        ))}
                        {newProduct && (
                            <ProductCard
                            accountType={user.type}
                            product={newProduct}
                            newItem={true}
                            onSaveEdit={handleAddProduct}
                            onCancelNew={handleCancelNewProduct}                        />
                        )}
                    </div>
                    {(user.type === 'owner') && (
                        <button className='add-salon-item'
                            onClick={() => setNewProduct({
                                product_id: null,
                                salon_id: salon_id,
                                name: '',
                                price: '',
                                description: '',
                                stock_quantity: '',
                                created_at: '',
                                image_url: ''
                            })}
                            disabled={newProduct !== null}
                        >
                            Add Product
                        </button>
                    )}
                    {modalProduct && (
                        <ModalProductDelete
                            product={modalProduct}
                            setModalOpen={setModalProduct}
                            onConfirm={handleDeleteProduct}
                        />
                    )}
                    {modalMessage && (
                        <ModalMessage
                            content={modalMessage.content}
                            title={modalMessage.title}
                            setModalOpen={setModalMessage}
                        />
                    )}
                </div>
            ))}
        </>
    )
}

export default Products