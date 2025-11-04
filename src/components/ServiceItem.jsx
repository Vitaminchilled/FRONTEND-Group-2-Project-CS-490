import React, { useState } from 'react'
import './ServiceItem.css'

function ServiceItem({ itemTitle, itemPrice, itemDesc, itemDuration, itemTags }){
    const [expanded, setExpanded] = useState(false)

    return (
        <div className={`service-item ${expanded ? "expanded" : ""}`}
            onMouseEnter={() => setExpanded(true)}
            onMouseLeave={() => setExpanded(false)}
        >
            <div className="grid-layout">
                <h3 className='item-title'>
                    {itemTitle}
                </h3>
                <h3 className='item-price'>
                    ${itemPrice}
                </h3>
                <p className='item-description'>
                    {itemDesc}
                </p>
                <button className='item-btn'>
                    Book
                </button>
                <p className='item-duration'>
                    Duration: {itemDuration} minutes
                </p>
                <div className='tag-section'>
                    {/*<div className='service-tag'>
                        {itemTags}
                    </div>*/}
                    {Array.isArray(itemTags) && itemTags.map((tag, index) => (
                        <div key={index} className='service-tag'>
                            {tag}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default ServiceItem