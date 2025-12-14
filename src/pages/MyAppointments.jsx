import { useState, useEffect } from "react"
import { useUser } from "./../context/UserContext";
import './MyAppointments.css'

import AppointmentItem from './../components/AppointmentItem.jsx'
import { ModalMessage } from './../components/Modal.jsx';
import { ViewAppointment, CancelAppointment } from './../components/ViewAppointment.jsx'
import { RescheduleAppointmentVer2 } from "../components/RescheduleAppointment.jsx";

export default function MyAppointments() {
    
    /* temp since no login */
    const {user} = useUser()

    const [modalMessage, setModalMessage] = useState(null)
    const [viewAppointment, setViewAppointment] = useState(null)
    const [cancelAppointment, setCancelAppointment] = useState(null)
    /* ELIZABETH'S RESCHEDULE APPOINTMENT */
    const [rescheduleOpen, setRescheduleOpen] = useState(false);
    const [selectedAppt, setSelectedAppt] = useState(null);

    /* PURCHASES SECTION */
    const [allAppts, setAllAppts] = useState([])
    const [upcomingAppts, setUpcomingAppts] = useState([])
    const [pastAppts, setPastAppts] = useState([])
    /* PURCHASES SECTION */
    const [pastPurchases, setPastPurchases] = useState([])

    useEffect(() => {
        if (modalMessage || viewAppointment || cancelAppointment || rescheduleOpen) {
        document.body.style.overflow = "hidden";
        } else {
        document.body.style.overflow = "";
        }
        return () => {
        document.body.style.overflow = "";
        };
    }, [modalMessage, viewAppointment, cancelAppointment, rescheduleOpen]);

    useEffect(() => {
        if (user?.user_id) {
            retrieveAllAppointments()
        }
    }, [user?.user_id])

    const retrieveAllAppointments = async () => {
        try {
            const appt_response = await fetch(`/api/appointments/view?role=customer&id=${user?.user_id}`)
            
            if(!appt_response.ok) {
                const errorText = await appt_response.json()
                throw new Error(`Appointments fetch failed: HTTP error ${appt_response.status}: ${errorText.error || errorText}`)
            }
            
            const appt_data = await appt_response.json()

            const { 
                appointments: retrievedAppointments=[]
            } = appt_data || {}
            setAllAppts(retrievedAppointments) /* JUST IN CASE */

            const completedItems = retrievedAppointments.filter(a => a.status === 'completed' || a.status === 'cancelled')
            const upcomingItems = retrievedAppointments.filter(a => a.status === 'booked')
            setUpcomingAppts(upcomingItems)
            setPastAppts(completedItems)
        } catch (err) {
            console.error('Fetch error:', err)
        }
    }

    const handleApptView = async (appointment) => {
        setViewAppointment(appointment)
    }

    const handleApptCancel = async (appointment) => {
        setCancelAppointment(appointment)
    }

    const handleCancelAppointment = async (appointmentID) => {
        try {
            const cancelResponse = await fetch(`/api/appointments/cancel`,{
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    
                },
                body: JSON.stringify({ appointment_id: appointmentID })
            })

            if (!cancelResponse.ok) {
                const errorData = await cancelResponse.json()
                throw new Error(`Cancel Appointment fetch failed: HTTP error ${cancelResponse.status}: ${errorData.error || errorData}`)
            }

            const data = await cancelResponse.json()
            setModalMessage({ 
                title: "Success",
                content: data.message
            })
            await retrieveAllAppointments()
        } catch (err) {
            setModalMessage({
                title: "Error",
                content: err.message || 'This appointment could not be cancelled.'
            })
        }
    }

    const handleApptReschedule = async (appointment) => {
        setSelectedAppt(appointment); 
        setRescheduleOpen(true);
    }

    return (
        <>
            {(user?.type !== "customer" ? (
                <p className='not-found'>
                    {user?.type === 'none' 
                        ? 'Not logged in. Create an accout or login to view your appointments.' 
                        : 'Not authorized'
                    }
                </p>
            ) : (
                <div className="my-appts-page">
                    <h1 className="appt-title">Appointments & Rewards</h1>
                    <div className="new-div"></div>
                    {allAppts.length === 0 ? (
                        <p className="no-rewards">You currently have no records of making appointments at any salon.</p>
                    ) : (
                        <>
                            <div className="type-section">
                                {upcomingAppts.length !== 0 && (
                                    <>
                                        <h2 className="inner-title">Upcoming Appointments</h2>
                                        {upcomingAppts.map((appt) => {
                                            return (
                                                <AppointmentItem
                                                    key={appt.appointment_id}
                                                    accountType = 'customer'
                                                    appointment={appt}
                                                    onViewMore={() => handleApptView(appt)}
                                                    onCancel={() => handleApptCancel(appt)}
                                                    onReschedule={() => handleApptReschedule(appt)}
                                                />
                                            )
                                        })}
                                    </>
                                )}
                            </div>
                            <div className="type-section">
                                {pastAppts.length !== 0 && (
                                    <>
                                        <h2 className="inner-title">Past Appointments</h2>
                                        {pastAppts.map((appt) => {
                                            return (
                                                <AppointmentItem 
                                                    key={appt.appointment_id}
                                                    accountType = 'customer'
                                                    appointment={appt}
                                                    onViewMore={() => handleApptView(appt)}
                                                />
                                            )
                                        })}
                                    </>
                                )}
                            </div>
                            
                            {pastPurchases.length !== 0 && (
                                <div className="appt-divider"></div>
                            )}

                            <div className="type-section">
                                {pastPurchases.length !== 0 && (
                                    <>
                                        <h2 className="inner-title">Product Purchases</h2>
                                        {pastPurchases.map((appt) => {
                                            return (
                                                <AppointmentItem
                                                    key={appt.appointment_id}
                                                    accountType = 'customer'
                                                    appointment={appt}
                                                />
                                            )
                                        })}
                                    </>
                                )}
                            </div>
                        </>
                    )}
                    {modalMessage && (
                        <ModalMessage
                            content={modalMessage.content}
                            title={modalMessage.title}
                            setModalOpen={setModalMessage}
                        />
                    )}
                    {viewAppointment && (
                        <ViewAppointment
                            appointment={viewAppointment}
                            setModalOpen={setViewAppointment}
                            onSuccess={() => retrieveAllAppointments()}
                            setModalMessage={setModalMessage}
                        />
                    )}
                    {cancelAppointment && (
                        <CancelAppointment 
                            appointment={cancelAppointment}
                            setModalOpen={setCancelAppointment}
                            onConfirm={handleCancelAppointment}
                        />
                    )}
                    {rescheduleOpen && selectedAppt && (
                        <RescheduleAppointmentVer2 
                            user={user}
                            appointment={selectedAppt}
                            setModalOpen={setRescheduleOpen}
                            onSuccess={() => retrieveAllAppointments()}
                            setModalMessage={setModalMessage}
                        />
                    )}
                </div>
            ))}
        </>
    )
}