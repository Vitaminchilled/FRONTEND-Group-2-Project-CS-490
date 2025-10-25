import './ServiceItem.css'

function ServiceItem({ itemTitle, itemPrice, itemDesc }){
    return (
        <div className="service-item">
            <div className="grid-layout">
                <h3 className='item-title'>
                    {itemTitle}
                </h3>
                <h3 className='item-price'>
                    {itemPrice}
                </h3>
                <p className='item-description'>
                    {itemDesc}
                </p>
                <button className='item-btn'>
                    Book
                </button>
            </div>
        </div>
    )
}

export default ServiceItem