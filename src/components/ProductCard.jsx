import React, { useEffect, useState } from 'react'
import './ProductCard.css'
import deleteIcon from '../assets/BlackXIcon.png'
import productImg from '../assets/ProductPlaceholder.jpg' /* default img */

function ProductItem({ 
    user, salon,
    product, 
    newItem = false, 
    onSaveEdit, onDelete, onCancelNew, onAddToCart
}){
    const [editData, setEditData] = useState({
        ...product
    })
    const [imagePreview, setImagePreview] = useState(null)
    const [isEditing, setIsEditing] = useState(false)

    /* variable for easy checking
    we're only the owner if we are the right account type 
    and have a matching salon id
    */
    const owner = user.type === 'owner' && user.salon_id === salon.salon_id

    useEffect(() => {
        setEditData(product)
    }, [product])

    useEffect(() => {
        if (newItem) {
            setIsEditing(true)
        }
    }, [newItem])

    const handleStartEdit = () => setIsEditing(true)
    const handleCancelEdit = () => {
        if (newItem) {
            onCancelNew?.()
        } else {
            setIsEditing(false)
            setEditData(product) // reset changes
        }
    }

    const handleSaveClick = async () => {
        try {
            await onSaveEdit(editData)
            setIsEditing(false) // switch back to standard mode
        } catch (err) {
            console.error(err)
        }
    }

    const handleChange = (event) => {
        const { name, value } = event.target
        setEditData((prev) => ({ ...prev, [name]: value }))
    }

    const handleAddToCartClick = () => {
        console.log('Add to Cart button clicked!')
        console.log('Product:', product)
        console.log('onAddToCart function exists?', !!onAddToCart)
        
        if (onAddToCart && product.product_id) {
            onAddToCart(product.product_id, 1)
        } else {
            console.error('Cannot add to cart - missing onAddToCart function or product_id')
        }
    }

    useEffect(() => {
        return () => {
            if (imagePreview) {
                URL.revokeObjectURL(imagePreview)
            }
        }
    }, [imagePreview])

    function handleImageChange(event) {
        const file = event.target.files[0]

        if (!file) {
            if (imagePreview) {
                URL.revokeObjectURL(imagePreview)
            }
            setEditData(prev => ({ ...prev, new_image: null }))
            setImagePreview(null)
            return
        }

        if (imagePreview) {
            URL.revokeObjectURL(imagePreview)
        }

        setEditData((prev) => ({ ...prev, new_image: file }))
        setImagePreview(URL.createObjectURL(file)) // show preview immediately
    }
    
    return (
        <div className="product-item">
            {(owner) ? (
                isEditing ? (
                    <div className='edit-grid-layout'>
                        <img className='edit-remove'
                            src={deleteIcon}
                            alt='X'
                            onClick={() => {
                                if (product.product_id === null) return
                                onDelete(product)
                            }}
                            style={{ opacity: product.product_id === null ? 0.2 : 1, cursor: product.product_id === null ? 'not-allowed' : 'pointer' }}
                        />
                        <div className='img-section'>
                            <input className='edit-input img'
                                onChange={handleImageChange}
                                type='file'
                                accept='image/*'
                            />
                        </div>
                        {imagePreview && 
                            <img className='img-preview'
                                src={imagePreview || editData.image_url || productImg} 
                                alt="Preview"
                            />
                        }
                        <div className='title-section'>
                            <label className='edit-label prod-title'>Name:</label>
                            <input className='edit-input prod-title'
                                name='name'
                                value={editData.name}
                                onChange={handleChange}
                                placeholder='Product Name'
                                autoComplete='off'
                                required
                            />
                        </div>
                        <div className='price-section'>
                            <label className='edit-label price'>Price:</label>
                            <input className='edit-input price'
                                name='price'
                                value={editData.price}
                                onChange={handleChange}
                                onBlur={(event) => {
                                        let value = parseFloat(event.target.value || 0)
                                        if (value < 0) value = 0

                                        setEditData(prev => ({
                                            ...prev,
                                            price: value.toFixed(2)
                                        }))
                                    }
                                }
                                placeholder='ex. 10.00'
                                type='number'
                                step={0.01}
                                min={0}
                                autoComplete='off'
                                required
                            />
                        </div>
                        <div className='stock-section'>
                            <label className='edit-label stock'>Stock:</label>
                            <input className='edit-input stock'
                                name='stock_quantity'
                                value={editData.stock_quantity}
                                onChange={handleChange}
                                onBlur={(event) => {
                                        let value = Number(event.target.value)

                                        if (isNaN(value) || value < 0) {
                                            value = 0
                                        }

                                        value = Math.floor(value)
                                        setEditData(prev => ({
                                            ...prev,
                                            stock_quantity: value.toString()
                                        }))
                                    }
                                }
                                placeholder='ex. 10'
                                type='number'
                                step={1}
                                min={0}
                                autoComplete='off'
                                required
                            />
                        </div>
                        <div className='description-section'>
                            <label className='edit-label description'>Description:</label>
                            <textarea className='edit-input description'
                                name='description'
                                value={editData.description}
                                onChange={handleChange}
                                placeholder='Product Description'
                                required
                            />
                        </div>
                        <div className='edit-buttons'>
                            <button className='edit-btn-save'
                                onClick={handleSaveClick}
                                disabled={
                                    !editData.name?.trim() ||
                                    !editData.price || editData.price < 0 ||
                                    !editData.description?.trim() ||
                                    !editData.stock_quantity || editData.stock_quantity <= 0
                                }
                            >
                                Save
                            </button>
                            <button className='edit-btn-cancel'
                                onClick={handleCancelEdit}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className='grid-layout'>
                        <img className='item-img'
                            src={productImg}
                            alt='img'
                        />
                        <h3 className='item-title'>
                            {product.name}
                        </h3>
                        <h3 className='item-price'>
                            ${product.price}
                        </h3>
                        <h3 className='item-stock'>
                            Stock: {product.stock_quantity}
                        </h3>
                        <p className='item-description'>
                            {product.description}
                        </p>
                        <button className='item-btn'
                            onClick={handleStartEdit}
                        >
                            Edit
                        </button>
                    </div>
                )
            ) : (
                <div className="grid-layout">
                    <img className='item-img'
                        src={productImg}
                        alt='img'
                    />
                    <h3 className='item-title'>
                        {product.name}
                    </h3>
                    <h3 className='item-price'>
                        ${product.price}
                    </h3>
                    <h3 className='item-stock'>
                        Stock: {product.stock_quantity}
                    </h3>
                    <p className='item-description'>
                        {product.description}
                    </p>
                    <button className='item-btn'
                        onClick={handleAddToCartClick}
                        disabled={user.type !== 'customer' || product.stock_quantity === 0}
                    >
                        Add to Cart
                    </button>
                </div>
            )}
        </div>
    )
}

export default ProductItem