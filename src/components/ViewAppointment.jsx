import { useState, useEffect } from 'react'
import { Pencil, Save } from "lucide-react";
import deleteIcon from './../assets/BlackXIcon.png'
import ServiceItem from './ServiceItem';
import './ViewAppointment.css'

export function ViewAppointment({
    appointment,
    newItem = false,
    setModalOpen
}) {

    const [editData, setEditData] = useState({...appointment})
    const [isEditing, setIsEditing] = useState(false)

    useEffect(() => {
        setEditData(appointment)
    }, [appointment])
    
    useEffect(() => {
        if (newItem) {
            setIsEditing(true)
        }
    }, [newItem])

    const handleChange = (event) => {
        const { name, value } = event.target
        setEditData((prev) => ({ ...prev, [name]: value }))
    }

    const handleStartEdit = () => setIsEditing(true)
    const handleCancelEdit = () => {
        if (newItem) {
            onCancelNew?.()
        } else {
            setIsEditing(false)
            setEditData(appointment) // reset changes
        }
    }

    const handleSaveClick = async () => {
        try {
            await onSaveEdit(editData)
            setIsEditing(false) // switch back to standard mode
        } catch (err) {
            console.error(err)
        }
    }

    return (
        <div className="ModalBackground">
            <div className='ViewModalContainer'>
                <div className='ViewModalTitle'>
                    <h2 className='step-title'>{appointment.salon_name} — {appointment.service_name}</h2>
                    <img className='appointment-close'
                        src={deleteIcon}
                        alt='X'
                        onClick={() => setModalOpen(null)}
                    />
                </div>
                <div className='ViewModalBody'>
                    <div className="details-card">
                        <h3 className='details-title'>{appointment.service_name}</h3>
                        <div className='details-section'>
                            <p className='details-text'>
                                <strong>Description: </strong> 
                                {appointment.service_description}
                            </p>
                            <p className='details-text'>
                                <strong>Price: </strong> 
                                ${appointment.price}
                            </p>
                            <p className='details-text'>
                                <strong>Stylist: </strong> 
                                {appointment.employee_name}
                            </p>
                        </div>
                    </div>
                    
                    <div className="details-card">
                        <h3 className="details-title">Appointment Details:</h3>
                        <div className="details-section">
                            <p className='details-text'>
                                <strong>Date: </strong> 
                                {appointment.appointment_date}
                            </p>
                            <p className='details-text'>
                                <strong>Time: </strong> 
                                {appointment.start_time.slice(0,5)} - {appointment.end_time.slice(0,5)}
                            </p>
                            <p className='details-text'>
                                <strong>Appointment Status: </strong> 
                                {appointment.status.toUpperCase()}
                            </p>
                        </div>
                    </div>
                    <div className='horizontal-divider'></div>
                    <div className="note-section">
                        <h3 className='details-title'>Additional Details: 
                            <button className="edit-pencil">
                                {isEditing ? <Save size={20} /> : <Pencil size={20} />}
                            </button>
                        </h3>
                        <div className="appt-notes-box">
                            {appointment.customer_notes ? (
                                <p className="appt-notes-text">
                                {appointment.customer_notes}
                                </p>
                            ) : (
                                <p className="appt-notes-empty">
                                No notes have been added yet.
                                </p>
                            )}
                        </div>
                        <p className='details-text'>
                            <strong>Reference Photo: </strong>
                            [image]
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export function CancelAppointment({
    appointment,
    setModalOpen,
    onConfirm
}) {
    return (
        <div className="ModalBackground">
            <div className='CancelModalContainer'>
                <div className="CancelModalTitle">
                    <h2 className="cancel-title">Cancel Appointment?</h2>
                </div>
                <div className="CancelModalBody">
                    <h3 className="cancel-salon">{appointment.salon_name}</h3>
                    <div className="details-section">
                        <p className="details-text">
                            <strong>Time: </strong> 
                            {appointment.start_time} - {appointment.end_time}
                        </p>
                        <p className="details-text">
                            <strong>Service: </strong> 
                            {appointment.service_name}
                        </p>
                        <p className="details-text">
                            <strong>Stylist: </strong> 
                            {appointment.employee_name}
                        </p>
                        <p className="details-text">
                            <strong>Price: </strong> 
                            ${appointment.price}
                        </p>
                    </div>
                    <div className='horizontal-divider'></div>
                    <p className="details-warning">
                        Are you sure you want to cancel your upcoming appointment? This action cannot be undone.
                    </p>
                </div>
                <div className='CancelModalFooter'>
                    <button className='modal-btns' 
                        onClick={() => setModalOpen(false)}
                    >
                        Back
                    </button>
                    <button className="modal-btns" 
                        onClick={() => {
                            onConfirm(appointment.appointment_id)
                            setModalOpen(null)
                        }}
                    >
                        Confirm
                    </button>
                </div>
            </div>
        </div>
    )
}

export function RescheduleAppointment({
    appointment,
    setModalOpen, 
    accountType, 
    salon, 
    setModalMessage
}) {
    const [step, setStep] = useState(1)
    const nextStep = () => setStep((s) => s+1)
    const prevStep = () => setStep((s) => s-1)

    const [loadingSlots, setLoadingSlots] = useState(false)
    const [slotError, setSlotError] = useState(null)
    const [weeklyAvailability, setWeeklyAvailability] = useState([])
    const [weeklyMap, setWeeklyMap] = useState({})
    const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

    const formatDate = (d) => d.toISOString().split("T")[0]
    
    const today = new Date()
    const currentWeekStart = new Date(today)
    currentWeekStart.setHours(0,0,0,0)
    currentWeekStart.setDate(today.getDate() - today.getDay())

    const [weekStart, setWeekStart] = useState(() => {
        const d = new Date()
        d.setDate(d.getDate() - d.getDay())
        return d
    })
    const startDate = new Date(weekStart)
    const endDate = new Date(weekStart)
    endDate.setDate(weekStart.getDate() + 6)

    const startMonth = startDate.toLocaleString("en-US", { month: "long" })
    const endMonth = endDate.toLocaleString("en-US", { month: "long" })
    const year = startDate.getFullYear()

    const monthDisplay = startMonth === endMonth ? `${startMonth} ${year}` : `${startMonth.slice(0,3)} / ${endMonth.slice(0,3)} ${year}`

    const [chosenDateTime, setChosenDateTime] = useState({})

    const nextWeek = () => {
        const d = new Date(weekStart)
        d.setDate(d.getDate() + 7)
        setWeekStart(d)
    }

    const prevWeek = () => {
        const weekStartDate = new Date(weekStart).setHours(0,0,0,0)
        const currentWeekDate = new Date(currentWeekStart).setHours(0,0,0,0)

        if (weekStartDate <= currentWeekDate) return

        const d = new Date(weekStart)
        d.setDate(d.getDate() - 7)
        setWeekStart(d)
    }

    useEffect(() => {
        if (!appointment.employee_id) return

        const fetchAvailability = async () => {
            setLoadingSlots(true)
            setSlotError(null)

            try {
                const res = await fetch(
                    `/api/employees/${appointment.employee_id}/weekly-availability/sunday-based?date=${formatDate(weekStart)}`
                )

                if (!res.ok) {
                    const err = await res.json()
                    throw new Error(err.error || "Failed to fetch availability")
                }

                const data = await res.json()

                const week = data.week || []
                setWeeklyAvailability(week)

                const map = {}
                week.forEach(day => {
                    map[day.day] = day.timeline
                })
                setWeeklyMap(map)
            } catch (err) {
                console.error(err)
                setSlotError(err.message)
            } finally {
                setLoadingSlots(false)
            }
        }

        fetchAvailability()
    }, [weekStart])

    const isPastSlot = (dayName, time) => {
        const dayIndex = daysOfWeek.indexOf(dayName)

        const slotDate = new Date(weekStart)
        slotDate.setHours(0,0,0,0)
        slotDate.setDate(weekStart.getDate() + dayIndex)

        const [hh, mm, ss] = time.split(":").map(Number)
        slotDate.setHours(hh, mm, ss, 0)
        const now = new Date()
        return slotDate < now
    }

    const chooseSlot = (dayName, time) => {
        const timeline = weeklyMap[dayName]
        if(!timeline) return

        const requiredTimes = computeServiceBlock(time)
        const allAvailable = requiredTimes.times.every(t => {
            const slot = timeline.find(s => s.time === t)
            return slot && slot.status === "available"
        })
        if (!allAvailable) return

        const chosenDate = new Date(weekStart)
        const dayIndex = daysOfWeek.indexOf(dayName)
        chosenDate.setHours(0,0,0,0)
        chosenDate.setDate(weekStart.getDate() + dayIndex)

        const appointment_date = formatDate(chosenDate)

        setChosenDateTime({
            appointment_date,
            start_time: time,
            end_time: requiredTimes.end_time,
            required_times: requiredTimes.times
        })
    }

    const computeServiceBlock = (startTime) => {
        if (!appointment.service_duration) return {end_time: startTime, times: [startTime]}

        const interval = 15
        const length = appointment.service_duration || 0

        const blocksNeeded = Math.ceil(length / interval)

        const [hh, mm, ss] = startTime.split(":").map(Number)

        const end = new Date()
        end.setHours(hh, mm, ss, 0)
        end.setMinutes(end.getMinutes() + length)

        const end_hh = String(end.getHours()).padStart(2, "0")
        const end_mm = String(end.getMinutes()).padStart(2, "0")
        const endTime = `${end_hh}:${end_mm}:00`

        const times = []

        for (let i=0; i<blocksNeeded; i++) {
            const d = new Date()
            d.setHours(hh, mm, ss, 0)
            d.setMinutes(d.getMinutes() + i * interval)
            const t_h = String(d.getHours()).padStart(2, "0")
            const t_m = String(d.getMinutes()).padStart(2, "0")

            times.push(`${t_h}:${t_m}:00`)
        }
        return {
            end_time: endTime,
            times
        }
    }

    /* step 4: review appointment details */
    const [note, setNote] = useState("")
    const [imagePreview, setImagePreview] = useState(null)
    const [chosenReferenceImg, setChosenReferenceImg] = useState(null)

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
            setChosenReferenceImg(null)
            setImagePreview(null)
            return
        }

        if (imagePreview) {
            URL.revokeObjectURL(imagePreview)
        }

        setChosenReferenceImg(file)
        setImagePreview(URL.createObjectURL(file)) // show preview immediately
    }

    const handleNoteChange = (event) => {
        setNote(event.target.value)
    }

    const handleAppointmentSubmit = async () => {
        try {
            const cleanedData = {
                salon_id: appointment.salon_id,
                customer_id: 33, /* temp until user context */
                employee_id: appointment.employee_id,
                service_id: appointment.service_id,
                appointment_date: appointment.appointment_date,
                start_time: appointment.start_time,
                notes: appointment.customer_notes.trim()
            }
            console.log(cleanedData)

            const response = await fetch(`/api/appointments/book`, {
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
                content: err.message || 'This service could not be deleted.'
            })
        }
    }

    return (
        <div className="ModalBackground">
            <div className='AppointmentModalContainer'>
                <div className='AppointmentModalTitle'>
                    {step === 1 && (
                        <h2 className='step-title'>Reschedule Appointment</h2>
                    )}
                    {step === 2 && (
                        <h2 className='step-title'>Review Your Appointment</h2>
                    )}
                    <img className='appointment-close'
                        src={deleteIcon}
                        alt='X'
                        onClick={() => setModalOpen(null)}
                    />
                </div>
                {step === 1 && (
                    <div className='AppointmentModalBody'>
                        <div className='service-group'>
                            <ServiceItem
                                accountType={accountType}
                                service={chosenService}
                                optionTags={tags}
                            />
                        </div>
                        <button className='add-service'
                            onClick={toggleOtherServices}
                            /* click should display all the other services for this salon so you can add it to the top chosenServices */
                        >
                            {showOtherServices ? "- Hide Services" : "+ Change Service"}
                        </button>
                        {showOtherServices && (
                            <div className='service-group'>
                                {otherServices.length > 0 ? (
                                    otherServices.map(service => (
                                        <div
                                            key={service.service_id}
                                            onClick={() => handleChangeService(service)}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            <ServiceItem
                                                accountType={accountType}
                                                service={service}
                                                optionTags={tags}
                                            />
                                        </div>
                                    ))
                                ) : (
                                    <p>No more services available</p>
                                )}
                            </div>
                        )}
                    </div>
                )}
                {step === 2 && (
                    <div className='AppointmentModalBody'>
                        <div className='employee-group'>
                            {employees.map((employee) => (
                                <div
                                    key={employee.employee_id}
                                    onClick={() => handleSelectedEmployee(employee)}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <EmployeeItem
                                        accountType={accountType}
                                        employee={employee}
                                        selected={employee===chosenEmployee}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                {step === 3 && (
                    <div className='AppointmentModalBody'>
                        {loadingSlots && <p>Loading weekly schedule...</p>}
                        {slotError && <p>{slotError}</p>}
                        
                        {!loadingSlots && !slotError && weeklyAvailability.length > 0 && (
                            <div className="weekly-container">
                                {/* navigation between weeks */}
                                <div className="week-nav">
                                    <button className="modal-btns"
                                        onClick={prevWeek}
                                        disabled={
                                            new Date(weekStart).setHours(0,0,0,0) <=
                                            new Date(currentWeekStart).setHours(0,0,0,0)
                                        }
                                    >
                                        {'< Prev Week'}
                                    </button>
                                    <h3 className="week-title">{monthDisplay}</h3>
                                    <button className="modal-btns"
                                        onClick={nextWeek}
                                    >
                                        {"Next Week >"}
                                    </button>
                                </div>
                                <div className="weekly-grid">
                                    <div className='weekly-grid-row header-row'>
                                        <div className="time-col"></div>
                                        {daysOfWeek.map((day, index) => {
                                            const dateForDay = new Date(weekStart)
                                            dateForDay.setDate(weekStart.getDate() + index)

                                            return (
                                                <div key={day} className='day-col-header'>
                                                    <div className="weekday">{day.slice(0,3)}</div>
                                                    <div className="day-number">{dateForDay.getDate()}</div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                    {[...new Set(
                                        Object.values(weeklyMap).flatMap(day =>
                                            day.map(slot => slot.time).sort()
                                        )
                                    )].map(time => {
                                        return (
                                            <div key={time} className='weekly-grid-row'>
                                                <div className="time-col">{time.slice(0,5)}</div>

                                                {daysOfWeek.map((day, index) => {
                                                    const slot = weeklyMap[day]?.find(s => s.time === time)
                                                    const status = slot?.status || "unavailable"

                                                    const dateForDay = new Date(weekStart)
                                                    dateForDay.setDate(weekStart.getDate() + index)

                                                    const past = isPastSlot(day, time)
                                                    const isSelectedBlock = 
                                                        chosenDateTime.appointment_date === formatDate(dateForDay) &&
                                                        chosenDateTime.required_times?.includes(time)

                                                    return (
                                                        <div 
                                                            key={day + time}
                                                            title={`${past ? "This time has already passed" : status}`}
                                                            className={`slot 
                                                                ${past ? "past-slot" : status}
                                                                ${isSelectedBlock ? "selected-slot" : ""}`}
                                                            onClick={() => {
                                                                if (!past && status === "available") chooseSlot(day,time)
                                                            }}
                                                        >
                                                            {past ? "" : status === "available" ? "✓" : status === "booked" ? "X" : ""}
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                )}
                {step === 4 && (
                    <div className='AppointmentModalBody'>
                        <ServiceItem
                            accountType={accountType}
                            service={chosenService}
                            optionTags={tags}
                        />
                        
                        <h3 className='details-title'>Your Appointment Details:</h3>
                        <div className='details-section'>
                            <p className='details-text'><strong>Stylist:</strong> {appointment.employee_name}</p>
                            <p className='details-text'><strong>Date:</strong> {chosenDateTime.appointment_date}</p>
                            <p className='details-text'><strong>Start Time:</strong> {chosenDateTime.start_time.slice(0,5)}</p>
                            <p className='details-text'><strong>End Time:</strong> {chosenDateTime.end_time.slice(0,5)}</p>
                        </div>
                        <div className='horizontal-divider'></div>
                        <h3 className='details-title'>Optional Note:</h3>
                        <textarea className='note-input'
                            value={note}
                            onChange={handleNoteChange}
                            placeholder='Note for the stylist'
                            name='note'
                        />
                        <h3 className='details-title'>Optional Reference Photo:</h3>
                        <div className='image-section'>
                            <input className='input-img'
                                onChange={handleImageChange}
                                type='file'
                                accept='image/*'
                            />
                            {imagePreview && 
                                <img className='img-preview'
                                    src={imagePreview} 
                                    alt="Preview"
                                />
                            }
                        </div>
                    </div>
                )}
                <div className='AppointmentModalFooter'>
                    <button className="modal-btns" 
                        disabled={step === 1}
                        onClick={prevStep}
                    >
                        {'<<  '} Back
                    </button>
                    <button className="modal-btns" 
                        disabled={
                            (step === 1) ? false :
                            (step === 2 && (!appointment.appointment_date))
                        }
                        onClick={step === 2 ? handleAppointmentSubmit : nextStep}
                    >
                        {step === 4 ? "SUBMIT" : "Next >>" }
                    </button>
                </div>
            </div>
        </div>
    )
}