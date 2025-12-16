import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useUser } from "../../context/UserContext";
import SalonHeader from '../../components/SalonHeader.jsx'
import ProductCard from '../../components/ProductCard.jsx'
import './Products.css'

import {ModalProductDelete, ModalMessage} from '../../components/Modal.jsx';

function Products() {
    const { salon_id } = useParams()
    const {user, setUser, loading: userLoading} = useUser();
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
            /*const cleanedData = {
                name: productData.name.trim(),
                description: productData.description.trim(),
                price: parseFloat(productData.price),
                stock_quantity: parseInt(productData.stock_quantity),
                salon_id: parseInt(salon_id)
            }

            console.log(cleanedData)*/

            const productForm = new FormData()
            productForm.append("salon_id", salon_id)
            productForm.append("name", productData.name.trim())
            productForm.append("description", productData.description?.trim() || "")
            productForm.append("price", parseFloat(productData.price))
            productForm.append("stock_quantity", parseInt(productData.stock_quantity || 0))

            if (productData.new_image instanceof File) {
                productForm.append("image", productData.new_image)
            }

            const response = await fetch("/api/products", {
                method: "POST",
                body: productForm
            })

            /*const response = await fetch(`/api/products`, {
                method: 'POST',
                headers: {
                'Content-Type': 'application/json'
                },
                body: JSON.stringify(cleanedData)
            })*/

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

            /*
            const productForm = new FormData()

            productForm.append("salon_id", salon_id)
            productForm.append("name", updatedProduct.name.trim())
            productForm.append("description", updatedProduct.description?.trim() || "")
            productForm.append("price", parseFloat(updatedProduct.price))
            productForm.append("stock_quantity", parseInt(updatedProduct.stock_quantity))

            if (updatedProduct.new_image instanceof File) {
                productForm.append("image", updatedProduct.new_image)
            }

            const response = await fetch(`/api/products/${updatedProduct.product_id}`, {
                method: "PUT",
                body: productForm
            })
            */

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

    const handleAddToCart = async (product_id, quantity = 1) => {
        console.log('=== ADD TO CART INITIATED ===')
        console.log('Product ID:', product_id)
        console.log('Quantity:', quantity)
        console.log('Full user object:', user)
        console.log('User ID (user.id):', user.id)
        console.log('User ID (user.user_id):', user.user_id)
        console.log('Salon ID:', salon_id)
        
        try {
            // Use user.user_id instead of user.id if that's what's available
            const customer_id = user.user_id || user.id
            
            const requestBody = {
                customer_id: customer_id,
                salon_id: parseInt(salon_id),
                product_id: parseInt(product_id),
                quantity: parseInt(quantity)
            }
            console.log('Request body:', requestBody)
            console.log('All values present?', {
                has_customer_id: !!requestBody.customer_id,
                has_salon_id: !!requestBody.salon_id,
                has_product_id: !!requestBody.product_id
            })
            
            const response = await fetch('/api/cart/add', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            })

            console.log('Response status:', response.status)
            
            if (!response.ok) {
                const errorData = await response.json()
                console.error('❌ ERROR RESPONSE:', errorData)
                throw new Error(`Add to cart failed: ${errorData.error || 'Unknown error'}`)
            }

            const data = await response.json()
            console.log('✅ SUCCESS RESPONSE:', data)
            console.log('Cart ID:', data.cart_id)
            
            setModalMessage({
                title: 'Success',
                content: data.message || 'Product added to cart successfully!'
            })
        } catch (err) {
            console.error('❌ CATCH ERROR:', err)
            setModalMessage({
                title: 'Error',
                content: err.message || 'Could not add product to cart.'
            })
        }
        console.log('=== ADD TO CART COMPLETED ===')
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
                        hasPrimaryImg={salon.has_primary_img}
                    />
                    
                    <div className='title-group'>
                        <h2 className="page-title">
                            Products
                        </h2>
                        <p className='page-counts'>
                            ({products.length} {products.length === 1 ? "Product" : "Products"})
                        </p>
                    </div>

                    <div className="product-group">
                        {products.length === 0 ? (
                            <>
                                <p className='not-found'>No products listed on this salon.</p>
                                {newProduct && (
                                    <ProductCard
                                    user={user}
                                    salon={salon}
                                    product={newProduct}
                                    newItem={true}
                                    onSaveEdit={handleAddProduct}
                                    onCancelNew={handleCancelNewProduct}                        />
                                )}
                            </>
                        ) : (
                            <>
                                {products.map((product) => (
                                    <ProductCard
                                        key={product.product_id}
                                        user={user}
                                        salon={salon}
                                        product={product}
                                        onSaveEdit={handleSaveEdit}
                                        onDelete={() => handleDeleteClick(product)}
                                        onAddToCart={handleAddToCart}
                                    />
                                ))}
                                {newProduct && (
                                    <ProductCard
                                    user={user}
                                    salon={salon}
                                    product={newProduct}
                                    newItem={true}
                                    onSaveEdit={handleAddProduct}
                                    onCancelNew={handleCancelNewProduct}                        />
                                )}
                            </>
                        )}
                    </div>
                    {(user?.type === 'owner' && Number(user?.salon_id) === Number(salon_id)) && (
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
