import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import deleteIcon from '../assets/BlackXIcon.png'
import ServiceItem from './ServiceItem'
import EmployeeItem from './EmployeeItem'
import { useUser } from '../context/UserContext';
import './BookAppointment.css'

export function BookAppointment({
    accountType, 
    setModalOpen, setModalMessage,
    salon, tags, services, selectedService
}) {
    /* GENERAL */
    const { user } = useUser();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [step, setStep] = useState(1) 

    const nextStep = () => setStep((s) => s+1)
    const prevStep = () => setStep((s) => s-1)

    /* STEP 1: SERVICE */

    const [chosenService, setChosenService] = useState({...selectedService})
    const [otherServices, setOtherServices] = useState(() => 
        services.filter((service) => service.service_id !== selectedService.service_id)
    )
    const [showOtherServices, setShowOtherServices] = useState(false)
    const toggleOtherServices = () => setShowOtherServices(prev => !prev)

    const handleChangeService = (service) => {
        if (chosenService.service_id && service.service_id === chosenService.service_id) return

        setOtherServices(prev => {
            const newOthers = prev.filter(s => s.service_id !== service.service_id)
            return [...newOthers, chosenService]
        })
        setChosenService(service)
        setChosenEmployee({})
        setChosenDateTime({})
    }

    /* STEP 2: EMPLOYEE */

    const [employees, setEmployees] = useState([])
    const [chosenEmployee, setChosenEmployee] = useState({})

    const retrieveEmployees = async () => {
        setLoading(true)
        setError(null)

        try {
            const employees_response = await fetch(`/api/salon/${salon.salon_id}/employees`)

            if (!employees_response.ok) {
                const errorText = await employees_response.json()
                throw new Error(`Employees fetch failed: HTTP error ${employees_response.status}: ${errorText.error || errorText}`)
            }

            const employees_data = await employees_response.json()
            console.log(employees_data)

            const { 
                employees: retrievedEmployees=[]
            } = employees_data || {}

            setEmployees(retrievedEmployees)
        } catch (err) {
            console.error('Fetch error: ', err)
            setError(err.message || "Unexpected error occurred")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (step === 2 && employees.length === 0) {
            retrieveEmployees()
        }
    }, [step])

    const handleSelectedEmployee = (employee) => {
        if (chosenEmployee && chosenEmployee.employee_id === employee.employee_id) return
        setChosenEmployee(employee)
        setChosenDateTime({})
    }

    /* STEP 3: DATE & TIME */

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
        if (!chosenEmployee.employee_id) return

        const fetchAvailability = async () => {
            setLoadingSlots(true)
            setSlotError(null)

            try {
                const res = await fetch(
                    `/api/employees/${chosenEmployee.employee_id}/weekly-availability/sunday-based?date=${formatDate(weekStart)}`
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
    }, [chosenEmployee, weekStart])

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
        if (!chosenService.duration_minutes) return {end_time: startTime, times: [startTime]}

        const interval = 15
        const length = chosenService.duration_minutes || 0

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

    /* STEP 4: REVIEW DETAILS & OPTIONAL VALUES */
    const [editData, setEditData] = useState({
        notes: "",
        image_url: null,
        image_after_url: null
    })

    const [note, setNote] = useState("")
    const [imagePreview1, setImagePreview1] = useState(null)
    const [imagePreview2, setImagePreview2] = useState(null)

    function handleImageChange(event) {
        const file = event.target.files[0]
        const name = event.target.name

        if (!file) {
        if (name === 'image_url') {
            URL.revokeObjectURL(imagePreview1)
            setEditData(prev => ({ ...prev, [name]: null }))
            setImagePreview1(null)
        } 
        if (name === 'image_after_url' && imagePreview2) {
            URL.revokeObjectURL(imagePreview2)
            setEditData(prev => ({ ...prev, [name]: null }))
            setImagePreview2(null)
        }

        return
        }

        if (name === 'image_url' && imagePreview1) {
        URL.revokeObjectURL(imagePreview1)
        } else if (name === 'image_after_url' && imagePreview2) {
        URL.revokeObjectURL(imagePreview2)
        }

        if (name === 'image_url') {
        setImagePreview1(URL.createObjectURL(file))
        setEditData((prev) => ({ ...prev, [name]: file }))
        } else if (name === 'image_after_url') {
        setImagePreview2(URL.createObjectURL(file))
        setEditData((prev) => ({ ...prev, [name]: file }))
        }
    }

    const handleNoteChange = (event) => {
        setNote(event.target.value)
        setEditData(prev => ({...prev, notes: event.target.value}))
    }

    const handleAddAppointmentToCart = () => {
        console.log('=== ADDING APPOINTMENT TO CART ===')
        const appointmentCartItem = {
            type: 'appointment',
            salon_id: salon.salon_id,
            salon_name: salon.salon_name,
            service_id: chosenService.service_id,
            service_name: chosenService.service_name,
            service_price: chosenService.price,
            employee_id: chosenEmployee.employee_id,
            employee_name: `${chosenEmployee.first_name} ${chosenEmployee.last_name}`,
            appointment_date: chosenDateTime.appointment_date,
            start_time: chosenDateTime.start_time,
            end_time: chosenDateTime.end_time,
            notes: note.trim(),
            cart_item_id: `temp_appt_${Date.now()}`
        }

        console.log('Appointment cart item:', appointmentCartItem)
        const existingCart = JSON.parse(sessionStorage.getItem('appointmentCart') || '[]')
        const updatedCart = [...existingCart, appointmentCartItem]
        sessionStorage.setItem('appointmentCart', JSON.stringify(updatedCart))

        console.log('Updated cart:', updatedCart)
        console.log('Appointment added to cart successfully')

        setModalOpen(null)
        navigate('/shopping-cart')
    }

    useEffect(() => {
        console.log(weeklyMap)
    }, [weeklyMap])

    return (
        <div className='ModalBackground'>
            <div className='AppointmentModalContainer'>
                <div className='AppointmentModalTitle'>
                    {step === 1 && (
                        <h2 className='step-title'>Choose Your Service(s)</h2>
                    )}
                    {step === 2 && (
                        <h2 className='step-title'>Choose Your Specialist</h2>
                    )}
                    {step === 3 && (
                        <h2 className='step-title'>Schedule Appointment</h2>
                    )}
                    {step === 4 && (
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
                                                    dateForDay.setHours(0,0,0,0)
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
                            <p className='details-text'><strong>Stylist:</strong> {chosenEmployee.first_name} {chosenEmployee.last_name}</p>
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
                            (step === 2 && !chosenEmployee.employee_id) || 
                            (step === 3 && !chosenDateTime.appointment_date) ||
                            (step === 4 && (!chosenService.service_id || !chosenEmployee.employee_id || !chosenDateTime.appointment_date))
                        }
                        onClick={step === 4 ? handleAddAppointmentToCart : nextStep}
                    >
                        {step === 4 ? "ADD TO CART" : "Next >>" }
                    </button>
                </div>
            </div>
        </div>
    )
}