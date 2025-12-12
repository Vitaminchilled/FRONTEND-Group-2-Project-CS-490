import { useState, useEffect } from 'react'
import { Pencil, Save } from "lucide-react";
import deleteIcon from './../assets/BlackXIcon.png'
import './ViewAppointment.css'

export function ViewAppointment({
    appointment,
    newItem = false,
    setModalOpen,
    onSuccess,
    setModalMessage
}) {
    const [loading, setLoading] =useState(false)
    const [error, setError] = useState(null)

    const [editData, setEditData] = useState({...appointment})
    const [isEditing, setIsEditing] = useState(false)
    
    const [imagePreview1, setImagePreview1] = useState(null)
    const [imagePreview2, setImagePreview2] = useState(null)

    useEffect(() => {
        setEditData(appointment)
    }, [appointment])

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

    const handleChange = (event) => {
        const { name, value } = event.target
        setEditData((prev) => ({ ...prev, [name]: value }))
    }

    useEffect(() => {
        return () => {
            if (imagePreview1) URL.revokeObjectURL(imagePreview1)
            if (imagePreview2) URL.revokeObjectURL(imagePreview2)
        };
    }, []);

    /* image handling */
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

    const handleRescheduleSubmit = async () => {
        setLoading(true);
        setError(null);

        try {
            /*const formData = new FormData()
            formData.append("appointment_id", appointment.appointment_id)
            formData.append("new_date", appointment.appointment_date);
            formData.append("new_start_time", appointment.start_time);
            formData.append("new_note", editData.customer_notes || editData.notes || "");

            if (editData.image_url === null) {
                formData.append("image_before_url", ""); // tells backend to clear
            }

            if (editData.image_after_url === null) {
                formData.append("image_after_url", "");
            }

            if (editData.image_url instanceof File) {
                formData.append("image_before", editData.image_url);
            }
            if (editData.image_after_url instanceof File) {
                formData.append("image_after", editData.image_after_url);
            }

            // Step 1: Book the new appointment
            const rescheduleResponse = await fetch("/api/appointments/update", {
                method: "PUT",
                credentials: 'include',
                body: formData
            });*/

            const payload = {
                appointment_id: appointment.appointment_id,
                new_date: appointment.appointment_date,       // YYYY-MM-DD
                new_start_time: appointment.start_time,       // HH:MM:SS
                new_note: editData.customer_notes || editData.notes || ""
            }

            const rescheduleResponse = await fetch("/api/appointments/update", {
                method: "PUT",
                credentials: 'include',
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            })

            if (!rescheduleResponse.ok) {
                const errorData = await rescheduleResponse.json();
                throw new Error(errorData.error || 'Failed to edit the values of your appointment');
            }

            const data = await rescheduleResponse.json();

            setModalMessage({
                title: "Success",
                content: data.message || 'Appointment rescheduled successfully!'
            })
            if (onSuccess) onSuccess()
            setModalOpen(null);
        } catch (err) {
            console.error('Reschedule error:', err);
            setModalMessage({
                title: "Error",
                content: err.message || 'This appointment could not be cancelled.'
            })
        } finally {
            setLoading(false);
        }
    };

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
                    {isEditing ? (
                        <div className="note-section">
                            <h3 className='details-title'>Additional Details: </h3>
                            <textarea className='edit-note'
                                name='customer_notes'
                                value={editData.customer_notes}
                                onChange={handleChange}
                                placeholder='Write appointment notes here...'
                            />
                            <p className='details-text'>
                                <strong>Reference/Before Photo: </strong>
                            </p>
                            <input className="input-img"
                                name='image_url'
                                type="file"
                                accept='image/*'
                                onChange={handleImageChange}
                            />
                            {imagePreview1 && 
                                <img className='img-preview'
                                    src={imagePreview1 || editData.image_url} 
                                    alt="Preview"
                                />
                            }
                            <p className='details-text'>
                                <strong>After Photo: </strong>
                            </p>
                            <input className="input-img"
                                name='image_after_url'
                                type="file"
                                accept='image/*'
                                onChange={handleImageChange}
                            />
                            {imagePreview2 && 
                                <img className='img-preview'
                                    src={imagePreview2 || editData.image_after_url} 
                                    alt="Preview"
                                />
                            }
                            <div className="button-section">
                                <button className="save"
                                    onClick={handleRescheduleSubmit}
                                >
                                    Save
                                </button>
                                <button className="cancel"
                                    onClick={handleCancelEdit}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="note-section">
                            <h3 className='details-title'>Additional Details: 
                                <button className="edit-pencil"
                                    onClick={handleStartEdit}
                                >
                                    <Pencil size={20} />
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
                                <strong>Reference/Before Photo: </strong>
                            </p>
                            {(appointment.image_url) ? (
                                <img className="img-preview" src={appointment.image_url} />
                            ) : (
                                <p>[No Image]</p>
                            )}

                            <p className='details-text'>
                                <strong>After Photo: </strong>
                            </p>
                            {(appointment.image_after_url) ? (
                                <img className="img-preview" src={appointment.image_after_url} />
                            ) : (
                                <p>[No Image]</p>
                            )}

                        </div>
                    )}
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