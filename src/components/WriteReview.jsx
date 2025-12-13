import { useState, useEffect } from 'react';
import deleteIcon from '../assets/BlackXIcon.png'
import AppointmentItem from './AppointmentItem.jsx'
import './WriteReview.css'

export function WriteReview ({
    user, salon, 
    appointments, review,
    onCancelNew,
    handleReviewSubmit
}) {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [step, setStep] = useState(1) 

    const nextStep = () => setStep((s) => s+1)
    const prevStep = () => setStep((s) => s-1)

    /* STEP 1: PICK A COMPLETED APPOINTMENT */
    const [chosenAppointment, setChosenAppointment] = useState({})

    const handleSelectedAppointment = (appointment) => {
        setChosenAppointment(appointment)
    }

    /* STEP 2: WRITE REVIEW */

    const [hover, setHover] = useState(0)
    const [newReview, setNewReview] = useState({...review})
    

    const handleChange = (event) => {
        const { name, value } = event.target
        setNewReview((prev) => ({ ...prev, [name]: value }))
    }

    return (
        <div className="ModalBackground">
            <div className='ReviewModalContainer'>
                <div className='ReviewModalTitle'>
                    {step === 1 && (
                        <h2 className='step-title'>Choose The Appointment To Review</h2>
                    )}
                    {step === 2 && (
                        <h2 className='step-title'>Write Your Review</h2>
                    )}
                    <img className='review-close'
                        src={deleteIcon}
                        alt='X'
                        onClick={onCancelNew}
                    />
                </div>
                {step === 1 && (
                    <div className='ReviewModalBody'>
                        <div className='appointment-group'>
                            {appointments.map((appointment) => (
                                <div
                                    key={appointment.appointment_id}
                                    onClick={() => handleSelectedAppointment(appointment)}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <AppointmentItem
                                        accountType={user?.role}
                                        appointment={appointment}
                                        selected={appointment===chosenAppointment}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                {step === 2 && (
                    <div className='ReviewModalBody'>
                        <div className="review-top">
                            <h4 className="poster-name">{review.user}</h4>
                            <div className="star-select">
                                {[...Array(5)].map((star, index) => {
                                    const currentRate = index + 1
                                    const displayStar = (hover || newReview.rating) >= currentRate ? '★' : '☆';
                                    return (
                                        <span className="single-star" key={currentRate}
                                            onMouseEnter={() => setHover(currentRate)}
                                            onMouseLeave={() => setHover(0)}
                                            onClick={event => setNewReview({...newReview, rating: currentRate})}
                                        >
                                            {displayStar}
                                        </span>
                                    )
                                })}
                            </div>
                        </div>
                        <textarea className='input-content'
                            type='text'
                            placeholder='Review content'
                            name='comment'
                            value={newReview.comment}
                            onChange={handleChange}
                        />
                    </div>
                )}
                <div className='ReviewModalFooter'>
                    <button className="modal-btns" 
                        disabled={step === 1}
                        onClick={prevStep}
                    >
                        {'<<  '} Back
                    </button>
                    <button className="modal-btns" 
                        disabled={
                            step === 1
                                ? !chosenAppointment.appointment_id
                                : newReview.rating <= 0 || newReview.comment.trim() === ""
                        }
                        onClick={() => {
                            if (step === 2) {
                                handleReviewSubmit({
                                    appointment_id: chosenAppointment.appointment_id,
                                    rating: newReview.rating,
                                    comment: newReview.comment
                                })
                            } else {
                                nextStep()
                            }
                        }}
                    >
                        {step === 2 ? "SUBMIT" : "Next >>" }
                    </button>
                </div>
            </div>
        </div>
    )
}