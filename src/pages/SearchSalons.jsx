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
                    Awesome Hair Salon | Hair | Rating: 4 stars
                  </div>
                  <div className='result-item'>
                    Barber Bros | Barber | Rating: 3 stars
                  </div>
                  <div className='result-item'>
                    Brow Lifts | Brows | Rating: 5 stars
                  </div>
                  <div className='result-item'>
                    Cool Nail Studio | Nails | Rating: 3.5 stars
                  </div>
                  <div className='result-item'>
                    Awesome Hair Salon | Hair | Rating: 4 stars
                  </div>
                  <div className='result-item'>
                    Barber Bros | Barber | Rating: 3 stars
                  </div>
                  <div className='result-item'>
                    Brow Lifts | Brows | Rating: 5 stars
                  </div>
                  <div className='result-item'>
                    Cool Nail Studio | Nails | Rating: 3.5 stars
                  </div>
                  <div className='result-item'>
                    Brow Lifts | Brows | Rating: 5 stars
                  </div>
                  <div className='result-item'>
                    Cool Nail Studio | Nails | Rating: 3.5 stars
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