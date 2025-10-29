import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import './SearchSalons.css'

function SearchSalons() {
  const location = useLocation()
  const initialFilter = location.state?.filter || { business_name: "", category: "", employee_first: "", employee_last: "" }
  
  const [filter, setFilter] = useState(initialFilter)
  const [currentFilter, setCurrentFilter] = useState(initialFilter)

  const [salons, setSalons] = useState([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [iterpages, setIterPages] = useState([])

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const retrieveSalons = async (pageNumber = 1, filters = currentFilter) => {
    setLoading(true);
    setError(null);

    try {
      const { business_name, category, employee_first, employee_last } = filters
      console.log(currentFilter)
      console.log(filter)

      const response = await fetch(`/api/salon/all?business_name=${business_name}&category=${category}&employee_first=${employee_first}&employee_last=${employee_last}&page=${pageNumber}`)

      if(!response.ok) {
        const errorText = await response.text()
        throw new Error(`HTTP error ${response.status}: ${errorText}`)
      }

      const data = await response.json()
      console.log(data)
      //destructuring data in the case that if it is null/undefined it defaults as a {} with default salon and total_page values
      const { 
        salons: retrievedSalons=[], 
        total_pages: retrievedTotalPages = 1, 
        page: retrievedPage = 1,
        iter_pages: retrievedIterPages = [1]
      } = data || {}
      
      setSalons(retrievedSalons)
      setPage(retrievedPage)
      setTotalPages(retrievedTotalPages)
      setIterPages(retrievedIterPages)

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

  const handleFilter = () => {
    setCurrentFilter(filter)
    setPage(1)
    retrieveSalons(1, currentFilter)
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
                      <input 
                        placeholder='Category'
                        value={filter.category}
                        onChange={event => setFilter({...filter, category: event.target.value})}
                      />
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
                    {/*<div className='tag-section'>
                      <p className='input-object-title'>Tags +</p>
                      <div className='tag-item'>
                        Salon Hair Cut X
                      </div>
                      <div className='tag-item'>
                        Hair Color X
                      </div>
                    </div>
                    <p className='input-object-title'>Rating +</p>*/}
                  </form>
                </div>
                <div className='button-section'>
                  <button type='submit' className='search-btn'
                    disabled={
                      !filter.business_name && !filter.category && !filter.employee_first && !filter.employee_last
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
                      const emptyFilter = { business_name: "", category: "", employee_first: "", employee_last: "" }
                      setFilter(emptyFilter)
                      setCurrentFilter(emptyFilter)
                      setPage(1)
                      retrieveSalons(1, emptyFilter)
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
                    const stars = Array.from({ length: 5 }, (_, i) => {
                      const starValue = i + 1;
                      if (salon.rating >= starValue) return "★";        // full star
                      if (salon.rating >= starValue - 0.5) return "⯪";  // half star
                      return "☆";                                       // empty star
                    })

                    return (
                      <Link key={salon.salon_id} className='result-item' to={`/salon/${salon.salon_id}`}>
                        <p className='item-title'>{salon.salon_name}</p>
                        <div className='white-divider'></div>
                        <p className='item-category'>{salon.tag_name}</p>
                        <div className='white-divider'></div>
                        <p className='item-rating'>
                          Rating:{`${" "}`}
                          <span className='stars'>
                            {stars.map((star, index) => (
                              <span key={index}>{star}</span>
                            ))}
                          </span>
                          {`${" "}`}({salon.rating})
                        </p>
                      </Link>
                    )
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