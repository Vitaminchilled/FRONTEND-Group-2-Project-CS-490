import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import './SearchSalons.css'
import cross from '../assets/GreyXIcon.png'

function SearchSalons() {
  const location = useLocation()
  const initialFilter = location.state?.filter || { 
    business_name: "", 
    categories: [], 
    employee_first: "", 
    employee_last: "" 
  }
  
  const [filter, setFilter] = useState(initialFilter)
  const [currentFilter, setCurrentFilter] = useState(initialFilter)
  const [newCategory, setNewCategory] = useState('')

  const [salons, setSalons] = useState([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [iterpages, setIterPages] = useState([])
  const [masterTags, setMasterTags] = useState([])

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  function getStarString(rating) {
    let stars = ''
    for (let i = 1; i <= 5; i++) {
      if (rating >= i) stars += '★'
      else if (rating >= i - 0.5) stars += '⯪'
      else stars += '☆'
    }
    return stars
  }

  const retrieveSalons = async (pageNumber = 1, filters = currentFilter) => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams()
      if (filters.business_name) {
        params.append('business_name', filters.business_name)
      }
      filters.categories.forEach(cat => params.append("categories", cat))
      if (filters.employee_first) {
        params.append('employee_first', filters.employee_first)
      }
      if (filters.employee_last) {
        params.append('employee_last', filters.employee_last)
      }
      params.append('page', pageNumber)

      console.log(currentFilter)
      console.log(filter)

      const response = await fetch(`https://backend-group-2-project-cs-490.onrender.com/api/salon/all?${params.toString()}`)
      const master_tag_response = await fetch("https://backend-group-2-project-cs-490.onrender.com/api/master-tags")

      if(!response.ok) {
        const errorText = await response.text()
        throw new Error(`HTTP error ${response.status}: ${errorText}`)
      }

      if(!master_tag_response) {
        const errorText = await master_tag_response.text()
        throw new Error(`Master Tag: HTTP error ${master_tag_response.status}: ${errorText}`)
      }

      const data = await response.json()
      const master_tag_data = await master_tag_response.json()
      console.log(data)
      console.log(master_tag_data)
      //destructuring data in the case that if it is null/undefined it defaults as a {} with default salon and total_page values
      const { 
        salons: retrievedSalons=[], 
        total_pages: retrievedTotalPages = 1, 
        page: retrievedPage = 1,
        iter_pages: retrievedIterPages = [1]
      } = data || {}

      const {
        master_tags: retrievedMasterTags=[]
      } = master_tag_data || {}
      
      setSalons(retrievedSalons)
      setPage(retrievedPage)
      setTotalPages(retrievedTotalPages)
      setIterPages(retrievedIterPages)
      setMasterTags(retrievedMasterTags)

    } catch (err) {
      console.error('Fetch error:', err)
      setError(err.message || "Unexpected Error Occurred")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    retrieveSalons(page, currentFilter)
  }, [page, currentFilter])

  const handleAddCategory = (event) => {
    event.preventDefault()
    if (!newCategory) return
    if (!filter.categories.includes(newCategory)) {
      setFilter(prev => ({
        ...prev,
        categories: [...prev.categories, newCategory]
      }))
    }
    setNewCategory('')
  }

  const handleRemoveCategory = (catToRemove) => {
    setFilter(prev => ({
      ...prev,
      categories: prev.categories.filter(cat => cat !== catToRemove)
    }))
  }

  const handleFilter = () => {
    setCurrentFilter(filter)
    setPage(1)
  }

  return (
    <div className='search-page'>
        <div className='nav-border'></div>
        <div className="inner-format">
            <div className="search-filter">
                <div className='filter-section'>
                  <h1 className='filter-title'>
                    Search Options
                  </h1>
                  <form className='search-form' onSubmit={handleFilter}>
                    <label>
                      <p className='input-title'>Business Name:</p>
                      <input 
                        placeholder='Business Name'
                        value={filter.business_name}
                        onChange={event => setFilter({...filter, business_name: event.target.value})}
                      />
                    </label>
                    <label>
                      <p className='input-title'>Category:</p>
                      <div className='category-section'>
                        <div className='current-categories'>
                          {filter.categories.map((category, index) => (
                            <div key={index} className='tag-item'>
                              <p className='tag-title'>
                                {category}
                              </p>
                              <img className='tag-remove'
                                src={cross}
                                alt="X"
                                onClick={() => handleRemoveCategory(category)}
                              />
                            </div>
                          ))}
                        </div>
                        <div className='add-categories'>
                          <select className='input-category'
                            value={newCategory}
                            onChange={event => setNewCategory(event.target.value)}
                          >
                            <option value=''>Choose</option>
                            {masterTags.map((masterTag) => (
                              <option key={masterTag.master_tag_id} value={masterTag.name}>
                                {masterTag.name}
                              </option>
                            ))}

                          </select>
                          <button className='btn-category' onClick={handleAddCategory}>Add</button>
                        </div>
                      </div>
                      
                    </label>
                    <label>
                      <p className='input-title'>Employee First Name:</p>
                      <input 
                        placeholder='First Name'
                        value={filter.employee_first}
                        onChange={event => setFilter({...filter, employee_first: event.target.value})}
                      />
                    </label>
                    <label>
                      <p className='input-title'>Employee Last Name:</p>
                      <input 
                        placeholder='Last Name'
                        value={filter.employee_last}
                        onChange={event => setFilter({...filter, employee_last: event.target.value})}
                      />
                    </label>
                  </form>
                </div>
                <div className='button-section'>
                  <button type='submit' className='search-btn'
                    disabled={
                      !filter.business_name && filter.categories.length===0 && !filter.employee_first && !filter.employee_last
                    }
                    onClick={(e) => {
                      e.preventDefault()
                      handleFilter()
                    }}
                  >
                    Search
                  </button>
                  <button className='search-btn'
                    onClick={() => {
                      const emptyFilter = { business_name: "", categories: [], employee_first: "", employee_last: "" }
                      setFilter(emptyFilter)
                      setCurrentFilter(emptyFilter)
                      setPage(1)
                      
                    }}
                  >
                    Reset
                  </button>
                </div>
            </div>
            <div className="search-results">
                <div className='title-section'>
                  <h1 className='results-title'>
                    Businesses
                  </h1>
                </div>

                <div className='results-selection'>
                  {loading && <p>Loading salons...</p>}
                  {error && <p>{error}</p>}

                  {salons.map((salon) => {
                    if (salon.average_rating === null || salon.average_rating === undefined) {
                      return (
                        <Link key={salon.salon_id} className='result-item' to={`/salon/${salon.salon_id}`}>
                        <p className='item-title'>{salon.salon_name}</p>
                        <div className='white-divider'></div>
                        <p className='item-category'>
                          {salon.tag_names.join(', ')}
                        </p>
                        <div className='white-divider'></div>
                        <p className='item-rating'>Rating: Not available</p>
                      </Link>
                      )
                    } else {
                      const stars = getStarString(salon.average_rating)

                      return (
                        <Link key={salon.salon_id} className='result-item' to={`/salon/${salon.salon_id}`}>
                          <p className='item-title'>{salon.salon_name}</p>
                          <div className='white-divider'></div>
                          <p className='item-category'>
                            {salon.tag_names.join(', ')}
                          </p>
                          <div className='white-divider'></div>
                          <p className='item-rating'>
                            Rating:{`${" "}`}
                            <span className='stars'>
                              {stars}
                            </span>
                            {`${" "}`}({salon.average_rating})
                          </p>
                        </Link>
                      )
                    }
                  })}
                </div>

                <div className='pagination-section'>
                  <button className='prev-next'
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                  >
                    {'<<'} Prev
                  </button>
                  {iterpages && iterpages.map((p,index) => {
                    if (p === "...")
                        return <span key={index} className='gap'>...</span>
                    else
                      return <button key={index} className='num-btn'
                        disabled={p === page}
                        onClick={() => setPage(p)}>
                        {p}
                      </button>
                  })}
                  <button className='prev-next'
                    disabled={page === totalPages}
                    onClick={() => setPage(page + 1)}
                  >
                    Next {'>>'}
                  </button>
                </div>

            </div>
        </div>
    </div>
  )
}

export default SearchSalons
