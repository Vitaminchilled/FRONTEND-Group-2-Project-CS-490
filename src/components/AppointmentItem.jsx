import { useState, useEffect } from "react"
import './AppointmentItem.css'

export default function AppointmentItem({
    accountType,
    appointment,
    newItem = false, onCancelNew,
    onSaveEdit, onDelete
}) {

    const [editData, setEditData] = useState({...appointment})
    const [isEditing, setIsEditing] = useState(false)
    const [expanded, setExpanded] = useState(false)

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
            setExpanded(false)
            setEditData(appointment) // reset changes
        }
    }

    //to disable edit mode after saving
    const handleSaveClick = async () => {
        try {
            await onSaveEdit(editData)
            setIsEditing(false) // switch back to standard mode
        } catch (err) {
            console.error(err)
        }
    }

    return (
        <div className={`appointment-item ${appointment.status} ${expanded ? "expanded" : ""}`}
            onMouseEnter={() => setExpanded(true)}
            onMouseLeave={() => !isEditing && setExpanded(false)}
        >
            <div className="grid-layout">
                <h3 className="salon-name">{appointment.salon_name}</h3>
                <p className="appointment-date">{appointment.appointment_date}</p>
                <p className="appointment-time">{appointment.appointment_time}</p>
                <p className="service-name">{appointment.service_name}</p>
                <p className="employee-name">{appointment.employee_name}</p>
                <p className="service-price">${appointment.service_price}</p>
                {appointment.status === 'completed' && (
                    <p className="loyalty-earned">{appointment.loyalty_pts} loyalty points</p>
                )}
                {appointment.status === 'booked' && (
                    <div className="appt-interact">
                        <button className="appt-btn">Cancel</button>
                        <button className="appt-btn">Notes v</button>
                        <button className="appt-btn">Reschedule</button>
                    </div>
                )}
                <div className="notes-section">
                    <div className="item-divider"></div>
                    <div className="appt-notes">I have a history with allergies to certain products.</div>
                </div>
            </div>
        </div>
    )
}