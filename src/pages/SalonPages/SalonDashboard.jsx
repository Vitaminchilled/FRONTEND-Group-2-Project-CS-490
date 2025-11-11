import { useState, useEffect } from 'react'
import { useParams, NavLink } from 'react-router-dom'
import { useUser } from "../../context/UserContext";
import SalonHeader from '../../components/SalonHeader.jsx'
import employeeIcon from '../../assets/PersonIcon.png'
import EmployeeItem from '../../components/EmployeeItem.jsx'
import './SalonDashboard.css'
import {ModalEmployeeDelete, ModalMessage} from '../../components/Modal.jsx';

function SalonDashboard() {
  const { salon_id } = useParams()
  const {user, setUser} = useUser();
  const [salon, setSalon] = useState({})
  const [tags, setTags] = useState([])
  const [masterTags, setMasterTags] = useState([])
  const [employees, setEmployees] = useState([])
  const [reviews, setReviews] = useState([])
  const [startIndex, setStartIndex] = useState(0) //FOR REVIEW CAROUSEL
  const [reviewCount, setReviewCount] = useState(0)
  const [rating, setRating] = useState()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const [newEmployee, setNewEmployee] = useState(null)

  const [ModalEmployee, setModalEmployee] = useState(null);
  const handleDeleteClick = (employee) => {
    setModalEmployee(employee); // open modal for this employee
  }
  const [modalMessage, setModalMessage] = useState(null)

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
        const errorText = await salon_response.json()
        throw new Error(`Salon fetch failed: HTTP error ${salon_response.status}: ${errorText.error || errorText}`)
      }

      if (!employees_response.ok) {
        const errorText = await employees_response.json()
        throw new Error(`Employees fetch failed: HTTP error ${employees_response.status}: ${errorText.error || errorText}`)
      }

      if (!reviews_response.ok) {
        const errorText = await reviews_response.json()
        throw new Error(`Reviews fetch failed: HTTP error ${reviews_response.status}: ${errorText.error || errorText}`)
      }

      const salon_data = await salon_response.json()
      const employees_data = await employees_response.json()
      const reviews_data = await reviews_response.json()
      
      console.log(salon_data)
      console.log(employees_data)
      console.log(reviews_data)

      //destructuring data in the case that if it is null/undefined it defaults as a {} with default salon and total_page values
      const { 
        salon: retrievedSalon=[], 
        tags: retrievedTags=[], 
        master_tags: retrievedMasterTags=[]
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
      setMasterTags(retrievedMasterTags)

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

  /* employees */

  const handleCancelNewEmployee = () => {
    setNewEmployee(null)
  }

  const handleAddEmployee = async (employeeData) => {
    try {
      const cleanedEmployeeData = {
        first_name: employeeData.first_name.trim(),
        last_name: employeeData.last_name.trim(),
        description: employeeData.description.trim(),
        tags: Array.isArray(employeeData.tags) ? employeeData.tags : [],
      }

      const employee_response = await  fetch(`/api/salon/${salon_id}/employees`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(cleanedEmployeeData)
      })

      if (!employee_response.ok) {
        const errorText = await employee_response.json()
        throw new Error(`Employees fetch failed: HTTP error ${employee_response.status}: ${errorText.error || errorText}`)
      }

      const employee_data = await employee_response.json()

      const cleanedSalaryData = {
        salary_value: parseFloat(employeeData.salary_value),
        effective_date: new Date().toISOString().split('T')[0]
      }

      const create_salary_response = await fetch(`/api/salon/${salon_id}/employees/${employee_data.employee_id}/salaries`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(cleanedSalaryData)
      })

      if (!create_salary_response.ok) {
        const errorText = await create_salary_response.json()
        throw new Error(`Salary fetch failed: HTTP error ${create_salary_response.status}: ${errorText.error || errorText}`)
      }
      const salary_data = await create_salary_response.json()
      
      setModalMessage({ 
        title: "Success",
        content: employee_data.message + `\n` + salary_data.message
      })
      setNewEmployee(null)
      await retrieveSalons()
    
    } catch (err) {
      console.error(err)
      setNewEmployee(null)
      setModalMessage({
        title: "Error",
        content: err.message || 'This employee could not be added.'
      })
    }
  }
  
  const handleSaveEdit = async (updatedEmployee, employee) => {
    try {
      const cleanedEmployeeData = {
        employee_id: updatedEmployee.employee_id,
        first_name: updatedEmployee.first_name.trim(),
        last_name: updatedEmployee.last_name.trim(),
        description: updatedEmployee.description.trim(),
        tags: Array.isArray(updatedEmployee.tags) ? updatedEmployee.tags : [],
      }

      console.log("Sending employee update data:", cleanedEmployeeData)

      const newSalaryValue = parseFloat(updatedEmployee.salary_value)
      const oldSalaryValue = parseFloat(employee.salary_value)

      const nothingChanged =
        cleanedEmployeeData.first_name === employee.first_name &&
        cleanedEmployeeData.last_name === employee.last_name &&
        cleanedEmployeeData.description === employee.description &&
        JSON.stringify(cleanedEmployeeData.tags) === JSON.stringify(employee.tags) &&
        newSalaryValue === oldSalaryValue

      if (nothingChanged) {
        setModalMessage({
          title: "No Changes Detected",
          content: "No updates were made because nothing was changed.",
        })
        return
      }

      const edit_employee_response = await fetch(`/api/salon/${salon_id}/employees/${updatedEmployee.employee_id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(cleanedEmployeeData)
      })

      if (!edit_employee_response.ok) {
        const errorText = await edit_employee_response.json()
        throw new Error(`Employee fetch failed: HTTP error ${edit_employee_response.status}: ${errorText.error || errorText}`)
      }

      let salaryMessage = ""
      if (newSalaryValue  !== oldSalaryValue) {
        const cleanedSalaryData = {
          salary_value: newSalaryValue,
          effective_date: new Date().toISOString().split('T')[0]
        }

        console.log("Sending salary update data:", cleanedSalaryData)

        const create_salary_response = await fetch(`/api/salon/${salon_id}/employees/${updatedEmployee.employee_id}/salaries`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(cleanedSalaryData)
        })

        if (!create_salary_response.ok) {
          const errorText = await create_salary_response.json()
          throw new Error(`Salary fetch failed: HTTP error ${create_salary_response.status}: ${errorText.error || errorText}`)
        }

        const salary_data = await create_salary_response.json()
        salaryMessage = `\n${salary_data.message || 'Salary updated successfully.'}`
      }

      const employeeData = await edit_employee_response.json()
      setModalMessage({ 
        title: "Success",
        content: employeeData.message + salaryMessage
      })
      await retrieveSalons()
    } catch (err) {
      console.error(err)

      setModalMessage({
        title: "Error",
        content: err.message || 'This employee could not be updated.'
      })
    }
  }

  const handleDeleteEmployee = async (employeeID) => {
    try {
      const deleteResponse = await fetch(`/api/salon/${salon_id}/employees/${employeeID}`, {
        method: 'DELETE'
      })

      if (!deleteResponse.ok) {
        const errorData = await deleteResponse.json()
        throw new Error(`Delete Employee fetch failed: HTTP error ${deleteResponse.status}: ${errorData.error || errorData}`)
      }
      const data = await deleteResponse.json()

      setModalEmployee(null)
      setModalMessage({
        title: 'Success',
        content: data.message
      })

      await retrieveSalons()
    } catch (err) {
      console.error(err)
      setModalEmployee(null)
      setModalMessage({
        title: "Error",
        content: err.message || 'This employee could not be deleted.'
      })
    }
  }

  /* reviews */
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
                  accountType={user.type}
                  employee={employee}
                  optionTags={masterTags}
                  onSaveEdit={handleSaveEdit}
                  onDelete={() => handleDeleteClick(employee)} 
                />
              ))}
              {newEmployee && (
                <EmployeeItem
                  key="new"
                  accountType={user.type}
                  employee={newEmployee}
                  optionTags={masterTags}
                  newItem={true}
                  onSaveEdit={handleAddEmployee}
                  onCancelNew={handleCancelNewEmployee}                  
                />
              )}
            </div>
            {(user.type === 'owner') && (
              <button className='add-salon-item'
                onClick={() => setNewEmployee({
                  employee_id: null,
                  first_name: '',
                  last_name: '',
                  description: '',
                  tags: [],
                  salary_id: null,
                  salary_value: '',
                  effective_date: ""
                })}
                disabled={newEmployee !== null}
              >
                Add Employee
              </button>
            )}

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
                          <h3 className='review-name'>{review.customer_name} </h3>
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

            {ModalEmployee && (
              <ModalEmployeeDelete
                employee={ModalEmployee}
                setModalOpen={setModalEmployee}
                onConfirm={handleDeleteEmployee}
              />
            )}
            {modalMessage && (
              <ModalMessage
                content={modalMessage.content}
                title={modalMessage.title}
                setModalOpen={setModalMessage}
              />
            )}
        </div>
      ))}
    </>
  )
}

export default SalonDashboard