import { useState, useEffect } from 'react';
import deleteIcon from '../assets/BlackXIcon.png'
import AppointmentItem from './AppointmentItem.jsx'
import './WriteReview.css'

export function WriteReview ({
    setModalOpen, user, 
    newItem = false,
    salon, appointments, review,
    setModalMessage, onCancelNew
}) {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [step, setStep] = useState(1) 

    const nextStep = () => setStep((s) => s+1)
    const prevStep = () => setStep((s) => s-1)

    const handleCancelNew = () => {
        if (newItem) {
            onCancelNew?.()
        }
    }

    /* STEP 1: PICK A COMPLETED APPOINTMENT */
    const [chosenAppointment, setChosenAppointment] = useState({})

    const handleSelectedAppointment = (appointment) => {
        setChosenAppointment(appointment)
    }

    /* STEP 2: WRITE REVIEW */

    const [hover, setHover] = useState(0)
    const [newReview, setNewReview] = useState({...review})
    const [imagePreview, setImagePreview] = useState(null)

    const handleChange = (event) => {
        const { name, value } = event.target
        setNewReview((prev) => ({ ...prev, [name]: value }))
    }

    useEffect(() => {
        return () => {
            if (imagePreview) {
                URL.revokeObjectURL(imagePreview)
            }
        }
    }, [imagePreview])

    function handleImageChange(event) {
        const file = event.target.files[0]

        if (!file) {
            if (imagePreview) {
                URL.revokeObjectURL(imagePreview)
            }
            setNewReview(prev => ({ ...prev, image_url: null }))
            setImagePreview(null)
            return
        }

        if (imagePreview) {
            URL.revokeObjectURL(imagePreview)
        }

        setNewReview((prev) => ({ ...prev, image_url: file }))
        setImagePreview(URL.createObjectURL(file)) // show preview immediately
    }

    /* STEP 3: CONFIRM DETAILS */


    const handleReviewSubmit = async () => {
        if (!chosenAppointment.appointment_id) return

        //fill in with data
        const cleanedData = {
            review_id: null,
            appointment_id: chosenAppointment.appointment_id,
            user_id: user.user_id, //temporary
            salon_id: salon.salon_id,
            rating: newReview.rating,
            comment: newReview.comment,
            image_url: '',
            review_date: new Date().toISOString().split('T')[0]
        }
        console.log(cleanedData)

        try {
            const response = await fetch(`/api/appointments/${cleanedData.appointment_id}/review`, {
                method: 'POST',
                headers: {
                'Content-Type': 'application/json'
                },
                body: JSON.stringify(cleanedData)
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(`Create Appointment fetch failed: HTTP error ${response.status}: ${errorData.error || errorData}`)
            }
            const data = await response.json()
            setModalOpen(null)
            setModalMessage({
                title: "Success",
                content: data.message
            })
        } catch (err) {
            console.error(err)
            setModalMessage({
                title: "Error",
                content: err.message || 'This review could not be submitted.'
            })
        }
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
                        onClick={handleCancelNew}
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
                                        accountType="customer" //user.role
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
                        <div className='img-section'>
                            <input className='edit-input img'
                                onChange={handleImageChange}
                                type='file'
                                accept='image/*'
                            />
                            {imagePreview && 
                                <img className='img-preview'
                                    src={imagePreview || review.image_url} 
                                    alt="Preview"
                                />
                            }
                        </div>
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
                            (step === 1 && !chosenAppointment.appointment_id) ||
                            (step === 2 && !chosenAppointment.appointment_id && !newReview.comment && newReview.rating !== -1)
                        }
                        onClick={step === 2 ? handleReviewSubmit : nextStep}
                    >
                        {step === 2 ? "SUBMIT" : "Next >>" }
                    </button>
                </div>
            </div>
        </div>
    )
}