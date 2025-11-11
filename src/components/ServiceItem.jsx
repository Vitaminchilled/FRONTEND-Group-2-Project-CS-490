import React, { useEffect, useState } from 'react'
import './ServiceItem.css'
import deleteIcon from '../assets/BlackXIcon.png'
import tagRemove from '../assets/WhiteXIcon.png'

/* itemTitle, itemPrice, itemDesc, itemDuration, itemTags */
function ServiceItem({ accountType, service, optionTags = [], newItem = false, onSaveEdit, onDelete, onCancelNew}){
    const [expanded, setExpanded] = useState(false)
    const [editData, setEditData] = useState({
        ...service,
        tags: service.tags || [],
        is_active: service.is_active ?? 1, /* add functionality later assume all are active for now */
    })
    /* pass in tags so they can be mapped and formatted when adding and removing tags */
    const [isEditing, setIsEditing] = useState(false)
    const [newTag, setNewTag] = useState('')

    useEffect(() => {
        setEditData(service)
    }, [service])

    useEffect(() => {
        if (newItem) {
            setIsEditing(true)
        }
    }, [newItem])

    const handleChange = (event) => {
        const { name, value } = event.target
        setEditData((prev) => ({ ...prev, [name]: value }))
    }

    const handleStartEdit = () => setIsEditing(true)
    const handleCancelEdit = () => {
        if (newItem) {
            onCancelNew?.()
        } else {
            setIsEditing(false)
            setEditData(service) // reset changes
        }
    }

    //to disable edit mode after saving
    const handleSaveClick = async () => {
        try {
            await onSaveEdit(editData)
            setIsEditing(false) // switch back to standard mode
        } catch (err) {
            console.error(err)
        }
    }

    const handleAddTag = (event) => {
        event.preventDefault()
        if (!newTag) return
        if (!editData.tags.includes(newTag)) {
            setEditData(prev => ({
                ...prev,
                tags: [...prev.tags, newTag]
            }))
        }
        setNewTag('')
    }

    const handleRemoveTag = (TagToRemove) => {
        setEditData(prev => ({
            ...prev,
            tags: prev.tags.filter(t => t !== TagToRemove)
        }))
    }

    return (
        <div className={`service-item ${expanded ? "expanded" : ""}`}
            onMouseEnter={() => setExpanded(true)}
            onMouseLeave={() => !isEditing && setExpanded(false)}
        >

            {(accountType === 'owner') && (
                isEditing ? (
                    <div className='edit-grid-layout'>
                        <div className='title-section'>
                            <label className='edit-label title'>Name:</label>
                            <input className='edit-input title'
                                name='name'
                                value={editData.name}
                                onChange={handleChange}
                                placeholder='Service Name'
                                autoComplete='off'
                                required
                            />
                        </div>
                        <div className='price-section'>
                            <label className='edit-label price'>Price: $</label>
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
                                placeholder='Price ex. 10.00'
                                type='number'
                                step={0.01}
                                min={0}
                                autoComplete='off'
                                required
                            />
                        </div>
                        <img className='edit-remove'
                            src={deleteIcon}
                            alt='X'
                            onClick={() => {
                                if (service.service_id === null) return
                                onDelete(service)  
                            }}
                            style={{ opacity: service.service_id === null ? 0.2 : 1, cursor: service.service_id === null ? 'not-allowed' : 'pointer' }}
                        />
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
                        <div className='duration-section'>
                            <label className='edit-label duration'>Duration:</label>
                            <input className='edit-input duration'
                                name='duration_minutes'
                                value={editData.duration_minutes}
                                onChange={handleChange}
                                placeholder='Service Duration ex. 10 (minutes)'
                                type='number'
                                min={1}
                                autoComplete="off"
                                required
                            />
                        </div>
                        <div className='tag-section'>
                            <label className='edit-label tags'>Tags:</label>
                            <div className='current-tags'>
                                {editData.tags.map((tag, index) => (
                                    <div key={index} className='tag-item'>
                                        <p className='tag-title'>
                                            {tag}
                                        </p>
                                        <img className='tag-remove'
                                            src={tagRemove}
                                            alt="X"
                                            onClick={() => handleRemoveTag(tag)}
                                        />
                                    </div>
                                ))}
                            </div>
                            <div className='add-tags'>
                                <select className='edit-input tags'
                                    value={newTag}
                                    onChange={event => setNewTag(event.target.value)}
                                >
                                    <option value=''>Choose</option>
                                    {optionTags.map((optionTag) => (
                                        <option key={optionTag.tag_id} value={optionTag.name}>
                                            {optionTag.name}
                                        </option>
                                    ))}
                                </select>
                                <button className='edit-btn-tags' onClick={handleAddTag}>Add</button>
                            </div>
                        </div>
                        <div className='edit-buttons'>
                            <button className='edit-btn-save'
                                onClick={handleSaveClick}
                                disabled={
                                    !editData.name?.trim() ||
                                    !editData.price || editData.price < 0 ||
                                    !editData.description?.trim() ||
                                    !editData.duration_minutes
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
                        <h3 className='item-title'>
                            {service.name}
                        </h3>
                        <h3 className='item-price'>
                            ${service.price}
                        </h3>
                        <p className='item-description'>
                            {service.description}
                        </p>
                        <button className='item-btn'
                            onClick={handleStartEdit}
                        >
                            Edit
                        </button>
                        <p className='item-duration'>
                            Duration: {service.duration_minutes} minutes
                        </p>
                        <div className='tag-section'>
                            {Array.isArray(service.tags) && service.tags.map((tag, index) => (
                                <div key={index} className='service-tag'>
                                    {tag}
                                </div>
                            ))}
                        </div>
                    </div>
                )
            )}
            {(accountType === 'none' || accountType === 'customer' || accountType === 'admin') && (
                <div className="grid-layout">
                    <h3 className='item-title'>
                        {service.name}
                    </h3>
                    <h3 className='item-price'>
                        ${service.price}
                    </h3>
                    <p className='item-description'>
                        {service.description}
                    </p>
                    <button className='item-btn'
                        disabled={accountType==='none' || accountType==='admin'}
                    >
                        Book
                    </button>
                    <p className='item-duration'>
                        Duration: {service.duration_minutes} minutes
                    </p>
                    <div className='tag-section'>
                        {Array.isArray(service.tags) && service.tags.map((tag, index) => (
                            <div key={index} className='service-tag'>
                                {tag}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

export default ServiceItem