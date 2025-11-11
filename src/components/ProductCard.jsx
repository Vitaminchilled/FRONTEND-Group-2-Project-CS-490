import React, { useEffect, useState } from 'react'
import './ProductCard.css'
import deleteIcon from '../assets/BlackXIcon.png'
import productImg from '../assets/ProductPlaceholder.jpg' /* default img */

/* Implementation Explanation
To allow editing one product at a time in a page write this
where { entity }Id is the entity youre tracking (i.e. service, product, etc.)

const [editing{ entity }Id, setEditing{ entity }Id] = useState(null)

Then write these two
const handleStartEdit = ({ entity }Id) => {
    setEditing{ entity }Id({ entity }Id)
}

const handleCancelEdit = () => {
    setEditing{ entity }Id(null)
}

Then in the product card send this
<ProductCard
    ...
    isEditing={editing{ entity }Id === { entity }.{ entity }_id}
    ^^^ to set editMode if it matches the unique id

    onStartEdit={() => handleStartEdit({ entity }.{ entity }_id)}
    onCancelEdit={handleCancelEdit}
/>
*/

function ProductItem({ accountType, product, isEditing = false , onStartEdit, onCancelEdit, onSaveEdit, onDelete}){
    const [editData, setEditData] = useState({
        ...product
    })
    const [imagePreview, setImagePreview] = useState(null)

    useEffect(() => {
        setEditData(product)
    }, [product])

    useEffect(() => {
        return () => {
            if (imagePreview) {
                URL.revokeObjectURL(imagePreview)
            }
        }
    }, [imagePreview])

    const handleChange = (event) => {
        const { name, value } = event.target
        setEditData((prev) => ({ ...prev, [name]: value }))
    }

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
            {(accountType === 'owner') && (
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
                            <label className='edit-label title'>Name:</label>
                            <input className='edit-input title'
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
                                placeholder='Service Description'
                                required
                            />
                        </div>
                        <div className='edit-buttons'>
                            <button className='edit-btn-save'
                                onClick={() => onSaveEdit(editData)}
                                disabled={
                                    !editData.name?.trim() ||
                                    !editData.price || editData.price < 0 ||
                                    !editData.description?.trim() ||
                                    !editData.stock_quantity || editData.stock_quantity < 0
                                }
                            >
                                Save
                            </button>
                            <button className='edit-btn-cancel'
                                onClick={onCancelEdit}
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
                            onClick={onStartEdit}
                        >
                            Edit
                        </button>
                    </div>
                )
            )}
            {(accountType === 'none' || accountType === 'customer' || accountType === 'admin') && (
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
                        disabled={accountType==='none' || accountType==='admin' || product.stock_quantity === 0}
                    >
                        Add to Cart
                    </button>
                </div>
            )}
        </div>
    )
}

export default ProductItem