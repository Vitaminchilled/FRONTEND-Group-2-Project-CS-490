import './SearchSalons.css'
/* just styling no functionality */

function SearchSalons() {
  return (
    <div className='search-page'>
        <div className='nav-border'></div>
        <div className="inner-format">
            <div className="search-filter">
                <div className='filter-section'>
                  <h1 className='filter-title'>
                    Search Options
                  </h1>
                  <form className='search-form'>
                    <label>
                      <p className='input-title'>Business Name:</p>
                      <input 
                        placeholder='Business Name'
                      />
                    </label>
                    <label>
                      <p className='input-title'>Category:</p>
                      <input 
                        placeholder='Category'
                      />
                    </label>
                    <label>
                      <p className='input-title'>Location:</p>
                      <input 
                        placeholder='Location'
                      />
                    </label>
                    <label>
                      <p className='input-title'>Employee:</p>
                      <input 
                        placeholder='Employee Name'
                      />
                    </label>
                    <div className='tag-section'>
                      <p className='input-object-title'>Tags +</p>
                      <div className='tag-item'>
                        Salon Hair Cut X
                      </div>
                      <div className='tag-item'>
                        Hair Color X
                      </div>
                    </div>
                    <p className='input-object-title'>Rating +</p>
                  </form>
                </div>
                <div className='button-section'>
                  <button className='search-btn'>Search</button>
                  <button className='search-btn'>Reset</button>
                </div>
            </div>
            <div className="search-results">
                <div className='title-section'>
                  <h1 className='results-title'>
                    Businesses
                  </h1>
                  {/* add map here for all salon results */}
                </div>
                <div className='results-selection'>
                  <div className='result-item'>
                    <p className='item-title'>Awesome Hair Salon</p>
                    <div className='white-divider'></div>
                    <p className='item-category'>Hair</p>
                    <div className='white-divider'></div>
                    <p className='item-rating'>Rating: 4 stars</p>
                  </div>
                  <div className='result-item'>
                    <p className='item-title'>Barber Bros Hair</p>
                    <div className='white-divider'></div>
                    <p className='item-category'>Barber</p>
                    <div className='white-divider'></div>
                    <p className='item-rating'>Rating: 3 stars</p>
                  </div>
                  <div className='result-item'>
                    <p className='item-title'>Brow Lifts</p>
                    <div className='white-divider'></div>
                    <p className='item-category'>Brows</p>
                    <div className='white-divider'></div>
                    <p className='item-rating'>Rating: 5 stars</p>
                  </div>
                  <div className='result-item'>
                    <p className='item-title'>Cool Nail Studio</p>
                    <div className='white-divider'></div>
                    <p className='item-category'>Nails</p>
                    <div className='white-divider'></div>
                    <p className='item-rating'>Rating: 3.5 stars</p>
                  </div>
                  <div className='result-item'>
                    <p className='item-title'>Cutiecules</p>
                    <div className='white-divider'></div>
                    <p className='item-category'>Nails</p>
                    <div className='white-divider'></div>
                    <p className='item-rating'>Rating: 5 stars</p>
                  </div>
                  <div className='result-item'>
                    <p className='item-title'>Even Better Hair Salon</p>
                    <div className='white-divider'></div>
                    <p className='item-category'>Hair</p>
                    <div className='white-divider'></div>
                    <p className='item-rating'>Rating: 4.5 stars</p>
                  </div>
                  <div className='result-item'>
                    <p className='item-title'>Nail Castle</p>
                    <div className='white-divider'></div>
                    <p className='item-category'>Nails</p>
                    <div className='white-divider'></div>
                    <p className='item-rating'>Rating: 4.5 stars</p>
                  </div>
                  <div className='result-item'>
                    <p className='item-title'>Ok Hair Salon</p>
                    <div className='white-divider'></div>
                    <p className='item-category'>Hair</p>
                    <div className='white-divider'></div>
                    <p className='item-rating'>Rating: 2.5 stars</p>
                  </div>
                  <div className='result-item'>
                    <p className='item-title'>Pedicures idk</p>
                    <div className='white-divider'></div>
                    <p className='item-category'>Pedi</p>
                    <div className='white-divider'></div>
                    <p className='item-rating'>Rating: 2 stars</p>
                  </div>
                  
                </div>
                <div className='pagination-section'>
                  <button className='prev-next'>{'<<'} Prev</button>
                  <button className='num-btn'>1</button>
                  <button className='num-btn'>2</button>
                  ...
                  <button className='num-btn'>3</button>
                  <button className='num-btn'>4</button>
                  <button className='num-btn'>5</button>
                  ...
                  <button className='num-btn'>6</button>
                  <button className='num-btn'>7</button>
                  <button className='prev-next'>Next {'>>'}</button>
                </div>
            </div>
        </div>
    </div>
  )
}

export default SearchSalons