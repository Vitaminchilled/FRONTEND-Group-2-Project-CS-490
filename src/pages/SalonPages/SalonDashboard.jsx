import { useState, useEffect } from 'react'
import { useParams, NavLink } from 'react-router-dom'
import SalonHeader from '../../components/SalonHeader.jsx'
import employeeIcon from '../../assets/PersonIcon.png'
import EmployeeItem from '../../components/EmployeeItem.jsx'
import './SalonDashboard.css'


function SalonDashboard() {
  const { salon_id } = useParams()
  const [salon, setSalon] = useState({})
  const [tags, setTags] = useState([])
  const [employees, setEmployees] = useState([])
  const [reviews, setReviews] = useState([])
  const [startIndex, setStartIndex] = useState(0) //FOR REVIEW CAROUSEL
  const [reviewCount, setReviewCount] = useState(0)
  const [rating, setRating] = useState()

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

  const retrieveSalons = async () => {
    setLoading(true);
    setError(null);

    try {
      const salon_response = await fetch(`/api/salon/${salon_id}/header`)
      const employees_response = await fetch(`/api/salon/${salon_id}/employees`)
      const reviews_response = await fetch(`/api/salon/${salon_id}/reviews`)

      if (salon_response.status === 404) {
        setError("Salon not found")
        return
      }

      if(!salon_response.ok) {
        const errorText = await salon_response.text()
        throw new Error(`Salon fetch failed: HTTP error ${salon_response.status}: ${errorText}`)
      }

      if (!employees_response.ok) {
        const errorText = await employees_response.text()
        throw new Error(`Employees fetch failed: HTTP error ${employees_response.status}: ${errorText}`)
      }

      if (!reviews_response.ok) {
        const errorText = await reviews_response.text()
        throw new Error(`Reviews fetch failed: HTTP error ${reviews_response.status}: ${errorText}`)
      }

      const salon_data = await salon_response.json()
      const employees_data = await employees_response.json()
      const reviews_data = await reviews_response.json()
      console.log(salon_data)
      console.log(employees_data)
      console.log(reviews_data)
      //destructuring data in the case that if it is null/undefined it defaults as a {} with default salon and total_page values
      const { 
        salon: retrievedSalon=[], tags: retrievedTags=[],
      } = salon_data || {}

      const { 
        employees: retrievedEmployees=[]
      } = employees_data || {}

      const { 
        reviews: retrievedReviews=[],
        review_count: retrievedReviewCount=0
      } = reviews_data || {}
      
      setSalon(retrievedSalon)
      setTags(retrievedTags)
      setEmployees(retrievedEmployees)
      setReviews(retrievedReviews)
      setReviewCount(retrievedReviewCount)

      if (retrievedSalon?.average_rating != null) {
        setRating(getStarString(retrievedSalon.average_rating))
      } else {
        setRating("No Rating Available")
      }
      console.log(rating)
    } catch (err) {
      console.error('Fetch error:', err)
      setError(err.message || "Unexpected Error Occurred")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    retrieveSalons()
  }, [salon_id])

  const reviewsPerPage = 3
  const visibleReviews = reviews.slice(startIndex, startIndex + reviewsPerPage)

  const handlePrev = () => {
    setStartIndex((prev) => Math.max(0, prev - reviewsPerPage))
  }

  const handleNext = () => {
    setStartIndex((prev) =>
      Math.min(reviews.length - reviewsPerPage, prev + reviewsPerPage)
    )
  }

  return (
    <>
      {(!loading && error ? (
        <p className='not-found'>{error}</p>
      ) : (
        <div className="salon-dashboard-page">
            <SalonHeader
              salonID={salon_id}
              headerTitle={salon.salon_name}
              headerTags={tags}
              headerRatingValue={salon.average_rating}
            />

            <div className='dashboard-cards'>
              <NavLink className='card'
                to={`/salon/${salon_id}/services`}
                end={false}>
                Services
              </NavLink>
              
              <NavLink className='card'
                to={`/salon/${salon_id}/products`}
                end={false}>
                Products
              </NavLink>

              <NavLink className='card'
                to={`/salon/${salon_id}/gallery`} 
                end={false}>
                Gallery
              </NavLink>

            </div>

            <div className='dashboard-group'>
              <div className="group-header">
                <h2 className="group-title">
                  About Us
                </h2>
                {salon.address && salon.city && salon.state && salon.postal_code && salon.country ? (
                  <p className="group-extra">
                    {`${salon.address}, ${salon.city}, ${salon.state} ${salon.postal_code}, ${salon.country}`}
                  </p>
                ) : (
                  <p className="group-extra">
                    Temporarily incomplete
                  </p>
                )}
              </div>
              <div className='grey-divider'></div>
            </div>

            <p className='about-us'>
              At this Salon, we believe great hair can change 
              your day and your confidence. Our expert stylists 
              specialize in modern cuts, vibrant color, and personalized 
              care that brings out your unique style. Whether you're 
              here for a quick refresh or a total transformation, we'll 
              make sure you leave looking (and feeling) awesome
            </p>

            <div className='dashboard-group'>
              <div className="group-header">
                <h2 className="group-title">
                    Meet the Staff
                </h2>
              </div>
              <div className='grey-divider'></div>
            </div>
            
            <div className='meet-staff'>
              {employees.map((employee) => (
                <EmployeeItem
                  key={employee.employee_id}
                  employeeImg={employeeIcon}
                  employeeName={`${employee.employee_first_name} ${employee.employee_last_name}`}
                  employeeDesc={employee.description}
                />
              ))}
            </div>

            <div className='dashboard-group'>
              <div className="group-header">
                <h2 className="group-title">
                  Reviews
                </h2>
                <p className="group-extra">
                  {`${reviewCount} Review(s)`} {/* not pretty but idk how we wanna do this */}
                </p>
                <div className="rating-div">
                  <p className={salon.average_rating ? "rating-available" : "rating-unavailable"}>{rating}</p>
                </div>
              </div>
              <div className='grey-divider'></div>
            </div>

            {/* 
              I didnt make it a component because I thought we might need to make a
              reviews page with all reviews and replies for a salon which would need
              formatted differently than the dashboard reviews.
              If you press a review it goes to the review page and shows all reviews
              but scrolled down to that specific review?? idk

              need more reviews to check pagination
            */}
            <div className='review-content'>
              <div className='review-btn'>
                <button className='prev-next'
                  onClick={handlePrev}
                  disabled={startIndex === 0}
                >
                  Prev
                </button>
                <button className='prev-next'
                  onClick={handleNext}
                  disabled={startIndex + reviewsPerPage >= reviews.length}
                >
                  Next
                </button>
              </div>
              <div className='reviews'>
                {!visibleReviews || visibleReviews.length === 0 ? (
                  <p>No reviews available</p>
                ) : (
                  visibleReviews.map((review) => {
                    const stars = review.rating ? getStarString(review.rating) : "No rating available"

                    return (
                      <div className='review-item'
                        key={review.review_id}
                      >
                        <div className='grid-layout'>
                          <h3 className='review-name'>{review.user_first_name} {review.user_last_name} </h3>
                          <h2 className='review-rating available'>{stars}</h2>
                          <p className='review-date'>Reviewed on {review.review_date}</p>
                          <p className='review-comment'>{review.comment}</p>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </div>

            <div className='dashboard-group'>
              <div className="group-header">
                <h2 className="group-title">
                  Loyalty Rewards
                </h2>
                <p className="group-extra">
                  200 Points in Account 
                  {/* need endpoint and conditional for if user or owner */}
                </p>
              </div>
              <div className='grey-divider'></div>
            </div>

            <div className='loyalty-rewards'>
              {/* loyalty goes here */}
            </div>
        </div>
      ))}
    </>
  )
}

export default SalonDashboard