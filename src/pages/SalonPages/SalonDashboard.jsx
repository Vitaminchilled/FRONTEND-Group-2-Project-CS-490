import { useState, useEffect } from 'react'
import { useParams, NavLink, useNavigate, Navigate } from 'react-router-dom'
import { useUser } from "../../context/UserContext";
import SalonHeader from '../../components/SalonHeader.jsx'
import EmployeeItem from '../../components/EmployeeItem.jsx'

import LoyaltyProgramForm from '../../components/LoyaltyProgramForm.jsx';

import { Scissors, Store, Image, NotebookPen } from 'lucide-react'

import './SalonDashboard.css'
import {ModalEmployeeDelete, ModalMessage} from '../../components/Modal.jsx';



function SalonDashboard() {
  const { salon_id } = useParams()
  const {user, setUser, loading: userLoading} = useUser();
  const navigate = useNavigate();
  const [salon, setSalon] = useState({})
  const [tags, setTags] = useState([])
  const [masterTags, setMasterTags] = useState([])
  const [employees, setEmployees] = useState([])
  const [reviews, setReviews] = useState([])
  const [rating, setRating] = useState()

  /* IF USER LOGGED IN GET CUSTOMER POINTS */
  const [customerPoints, setCustomerPoints] = useState(0)
  /* GET SALON LOYALTY PROGRAMS */
  const [loyaltyPrograms, setLoyaltyPrograms] = useState([])
  const [activePrograms, setActivePrograms] = useState([])

  const [expandedLoyalty, setExpandedLoyalty] = useState(null);

  const toggleLoyalty = (id) => {
    setExpandedLoyalty(prev => prev === id ? null : id);
  };

  const [newLoyaltyProgram, setNewLoyaltyProgram] = useState(null)
  const handleAddLoyaltySubmit = async (programData) => {
    await addLoyaltyProgram(salon_id, programData);
    setNewLoyaltyProgram(null); // close modal/form
    await retrieveSalonLoyalty(); // refresh the list
  };

  /* END OF LOYALTY */

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const [newEmployee, setNewEmployee] = useState(null)

  const [ModalEmployee, setModalEmployee] = useState(null);
  const handleDeleteClick = (employee) => {
    setModalEmployee(employee);
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

  if (userLoading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>;
  }

  const isOwnerOfThisSalon = user.type === 'owner' && String(user.salon_id) === String(salon_id);
  
  if (isOwnerOfThisSalon && !user.is_verified) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p>Hold tight, your account has not been verified yet. You'll receive an email once your account has been verified and you can access all features.</p>
      </div>
    );
  }

  const retrieveSalons = async () => {
    setLoading(true);
    setError(null);

    try {
      const salon_response = await fetch(`/api/salon/${salon_id}/header`)
      const employees_response = await fetch(`/api/salon/${salon_id}/employees`)
      const reviews_response = await fetch(`/api/salon/${salon_id}/dashboard/reviews`)

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

      const { 
        salon: retrievedSalon=[], 
        tags: retrievedTags=[], 
        master_tags: retrievedMasterTags=[]
      } = salon_data || {}

      const { 
        employees: retrievedEmployees=[]
      } = employees_data || {}

      const { 
        reviews: retrievedReviews=[]
      } = reviews_data || {}
      
      setSalon(retrievedSalon)
      setTags(retrievedTags)
      setEmployees(retrievedEmployees)
      setReviews(retrievedReviews)
      setMasterTags(retrievedMasterTags)

      if (retrievedSalon?.average_rating != null) {
        setRating(getStarString(retrievedSalon.average_rating))
      } else {
        setRating("No Rating Available")
      }
      
    } catch (err) {
      console.error('Fetch error:', err)
      setError(err.message || "Unexpected Error Occurred")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    retrieveSalons()
    retrieveSalonLoyalty()
  }, [salon_id])

  const handleLogout = async () => {
    try {
      await fetch('/api/logout', {
        method: 'POST',
        credentials: 'include'
      });
      setUser({
        type: 'none',
        name: null,
        username: null,
        user_id: null,
        salon_id: null,
        is_verified: null
      });
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      navigate('/login');
    }
  };

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

      const employee_data = await edit_employee_response.json()

      if (newSalaryValue !== oldSalaryValue) {
        const cleanedSalaryData = {
          salary_value: parseFloat(updatedEmployee.salary_value),
          effective_date: new Date().toISOString().split('T')[0]
        }

        const edit_salary_response = await fetch(`/api/salon/${salon_id}/employees/${updatedEmployee.employee_id}/salaries`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(cleanedSalaryData)
        })

        if (!edit_salary_response.ok) {
          const errorText = await edit_salary_response.json()
          throw new Error(`Salary fetch failed: HTTP error ${edit_salary_response.status}: ${errorText.error || errorText}`)
        }
        const salary_data = await edit_salary_response.json()

        setModalMessage({
          title: "Success",
          content: employee_data.message + `\n` + salary_data.message,
        })
      } else {
        setModalMessage({
          title: "Success",
          content: employee_data.message,
        })
      }

      await retrieveSalons()
    } catch (err) {
      console.error(err)
      setModalMessage({
        title: "Error",
        content: err.message || 'This employee could not be edited.'
      })
    }
  }

  const handleDeleteEmployee = async (employee) => {
    try {
      const delete_salary_response = await fetch(`/api/salon/${salon_id}/employees/${employee.employee_id}/salaries/${employee.salary_id}`, {
        method: 'DELETE',
      })

      if (!delete_salary_response.ok) {
        const errorText = await delete_salary_response.json()
        throw new Error(`Salary delete failed: HTTP error ${delete_salary_response.status}: ${errorText.error || errorText}`)
      }

      const delete_employee_response = await fetch(`/api/salon/${salon_id}/employees/${employee.employee_id}`, {
        method: 'DELETE',
      })

      if (!delete_employee_response.ok) {
        const errorText = await delete_employee_response.json()
        throw new Error(`Employee delete failed: HTTP error ${delete_employee_response.status}: ${errorText.error || errorText}`)
      }

      const employee_data = await delete_employee_response.json()

      setModalMessage({
        title: "Success",
        content: employee_data.message
      })
      setModalEmployee(null)
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

  /* loyalty */

  const retrieveCustomerPoints = async () => {
    

    try {
      const points_response = await fetch(`/api/loyalty/${salon_id}/points/${user?.user_id}`, {
        credentials: 'include'
      })

      if(!points_response.ok) {
        const errorText = await points_response.json()
        throw new Error(`Points fetch failed: HTTP error ${points_response.status}: ${errorText.error || errorText}`)
      }

      const points_data = await points_response.json()

      const { 
        points_earned: retrievedEarned=[], 
        points_redeemed: retrievedRedeemed=[], 
        available_points: retrievedAvailable=[]
      } = points_data || {}

      setCustomerPoints(retrievedAvailable)
      console.log(points_data)

    } catch (err) {
      console.error('Fetch error:', err)
    }
  }

  const retrieveSalonLoyalty = async () => {
    try {
      const loyalty_response = await fetch(`/api/loyalty/viewall/${salon_id}`)

      if(!loyalty_response.ok) {
        const errorText = await loyalty_response.json()
        throw new Error(`Loyalty fetch failed: HTTP error ${loyalty_response.status}: ${errorText.error || errorText}`)
      }

      const loyalty_data = await loyalty_response.json()

      const { 
        loyalty: retrievedLoyalty=[]
      } = loyalty_data || {}

      setLoyaltyPrograms(retrievedLoyalty)
      console.log(loyalty_data)

      const activeLoyalty = retrievedLoyalty.filter(program => program.is_active)
      setActivePrograms(activeLoyalty)
    } catch (err) {
      console.error('Fetch error:', err)
    }
  }

  const addLoyaltyProgram = async (salon_id, programData) => {
  try {
    const response = await fetch(`/api/loyalty/${salon_id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(programData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Backend response:', errorData); // <- log full response
      throw new Error(
        `Add loyalty failed: HTTP ${response.status}: ${errorData.error || errorData.error}. ` +
        (errorData.missing_fields ? `Missing fields: ${errorData.missing_fields.join(', ')}` : '')
      );
    }

    const result = await response.json();
    console.log(result.message);
    // Optionally refresh list
    retrieveSalonLoyalty(salon_id);
  } catch (err) {
    console.error(err.message);
  }
};

// Edit an existing loyalty program
const editLoyaltyProgram = async (loyalty_program_id, programData) => {
  try {
    const response = await fetch(`/api/loyalty/${loyalty_program_id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(programData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Edit loyalty failed: HTTP ${response.status}: ${errorData.error || errorData}`);
    }

    const result = await response.json();
    console.log(result.message);
    // Optionally refresh list (if salon_id is available)
    // retrieveSalonLoyalty(salon_id);
  } catch (err) {
    console.error(err.message);
  }
};

// Disable a loyalty program
const disableLoyaltyProgram = async (loyalty_program_id) => {
  try {
    const response = await fetch(`/api/loyalty/${loyalty_program_id}/disable`, {
      method: 'PATCH',
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Disable loyalty failed: HTTP ${response.status}: ${errorData.error || errorData}`);
    }

    const result = await response.json();
    console.log(result.message);
  } catch (err) {
    console.error(err.message);
  }
};

// Enable a loyalty program
const enableLoyaltyProgram = async (loyalty_program_id) => {
  try {
    const response = await fetch(`/api/loyalty/${loyalty_program_id}/enable`, {
      method: 'PATCH',
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Enable loyalty failed: HTTP ${response.status}: ${errorData.error || errorData}`);
    }

    const result = await response.json();
    console.log(result.message);
  } catch (err) {
    console.error(err.message);
  }
};

  useEffect(() => {
    if (user?.type === 'customer' && user?.user_id) retrieveCustomerPoints()
  }, [user?.user_id])

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
              isHome={true}
            />

            <div className='dashboard-cards'>
              <NavLink className='card'
                to={`/salon/${salon_id}/services`}
                end={false}>
                <Scissors className='card-logo'
                  size={70}
                  strokeWidth={1}
                />
                <p className="card-title">Services</p>
              </NavLink>
              
              <NavLink className='card'
                to={`/salon/${salon_id}/products`}
                end={false}>
                <Store className='card-logo'
                  size={70}
                  strokeWidth={1}
                />
                <p className="card-title">Products</p>
              </NavLink>

              <NavLink className='card'
                to={`/salon/${salon_id}/gallery`} 
                end={false}>
                <Image className='card-logo'
                  size={70}
                  strokeWidth={1}
                />
                <p className="card-title">Gallery</p>
              </NavLink>

              <NavLink className='card'
                to={`/salon/${salon_id}/reviews`} 
                end={false}>
                <NotebookPen className='card-logo'
                  size={70}
                  strokeWidth={1}
                />
                <p className="card-title">Reviews</p>
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
              {salon.description}
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
            {(user?.type === 'owner' && Number(user?.salon_id) === Number(salon_id)) && (
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
                <div className="rating-div">
                  <p className={salon.average_rating ? "rating-available" : "rating-unavailable"}>{rating}</p>
                </div>
              </div>
              <div className='grey-divider'></div>
            </div>

            <div className='review-content'>
              <div className='reviews'>
                {!reviews || reviews.length === 0 ? (
                  <p>No reviews available</p>
                ) : (
                  reviews.map((review) => {
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
              </div>
              <div className='grey-divider'></div>
            </div>

            <div className='loyalty-rewards'>
              {(user?.type === 'owner' ? loyaltyPrograms : activePrograms).map(program => {
                const tags = program.tags ? program.tags.split(',').map(t => t.trim()) : [];
                const isExpanded = expandedLoyalty === program.loyalty_program_id;
                return (
                  <div key={program.loyalty_program_id} className={`salon-card ${isExpanded ? 'expanded' : ''}`}>
                    <div className="salon-summary" onClick={() => toggleLoyalty(program.loyalty_program_id)}>
                      <div className="salon-name-points">
                        <span className="salon-name-text">{salon.salon_name}</span>
                        {user?.type === 'customer' && (<span className="current-points">{customerPoints} Points</span>)}
                      </div>
                      <button className="view-rewards-btn">{isExpanded ? '▲' : '▼'}</button>
                    </div>
                    {isExpanded && (
                      <div className="rewards-detail-list">
                        <div className="reward-item-row">
                          <span className="reward-text">
                            {program.name} – {program.discount_display} – {program.points_required} Points
                          </span>
                          <div className="reward-tags">
                            {tags.map(tag => <span key={tag} className="tag-pill">{tag}</span>)}
                          </div>
                        </div>
                        {user?.type === 'owner' && (
                          <div className="loyalty-actions">
                            <button onClick={() => editLoyaltyProgram(program.loyalty_program_id, {/* new data */})}>
                              Edit
                            </button>
                            {program.is_active ? (
                              <button onClick={() => disableLoyaltyProgram(program.loyalty_program_id)}>
                                Disable
                              </button>
                            ) : (
                              <button onClick={() => enableLoyaltyProgram(program.loyalty_program_id)}>
                                Enable
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
            {(user?.type === 'owner' && Number(user?.salon_id) === Number(salon_id)) && (
                <button className='add-salon-item'
                  onClick={() => {
                    // Open a modal or form to enter new loyalty program details
                    setNewLoyaltyProgram({
                      name: '',
                      points_required: 0,
                      discount_value: 0,
                      is_percentage: false,
                      tags: [],
                      start_date: new Date().toISOString().split('T')[0],
                      end_date: null
                    });
                  }}
                >
                  Add Loyalty Program
                </button>
              )}

            {ModalEmployee && (
              <ModalEmployeeDelete
                employee={ModalEmployee}
                setModalOpen={setModalEmployee}
                onConfirm={handleDeleteEmployee}
              />
            )}
            {newLoyaltyProgram && (
              <LoyaltyProgramForm
                program={newLoyaltyProgram}
                onSubmit={async (programData) => {
                  await addLoyaltyProgram(salon_id, programData);
                  setNewLoyaltyProgram(null);
                  await retrieveSalonLoyalty();
                }}
                onCancel={() => setNewLoyaltyProgram(null)}
                tags={tags}
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