import { useState, useEffect } from 'react'
import { useUser } from "../context/UserContext";
import AppointmentItem from '../components/AppointmentItem.jsx'
import Calendar from '../components/Calendar.jsx'
import './BusinessCalendar.css'
import { ViewAppointment } from "../components/ViewAppointment.jsx"; 
import { RescheduleAppointment } from "../components/RescheduleAppointment.jsx"; 

function BusinessCalendar() {
  const { user } = useUser();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [rescheduleAppointment, setRescheduleAppointment] = useState(null);

  const parseLocalDate = (dateString) => {
    if (!dateString) return null;

    if (typeof dateString === 'string') {
      if (dateString.includes('-') && dateString.length >= 10) {
        const [year, month, day] = dateString.slice(0, 10).split('-').map(Number);
        return new Date(year, month - 1, day);
      }
      if (dateString.includes('T')) {
        const datePart = dateString.split('T')[0];
        const [year, month, day] = datePart.split('-').map(Number);
        return new Date(year, month - 1, day);
      }
    }

    const d = new Date(dateString);
    return isNaN(d.getTime()) ? null : d;
  };

  const formatDate = (dateString) => {
    const date = parseLocalDate(dateString);
    if (!date) return 'Invalid Date';

    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';

    try {
      if (typeof timeString === 'string' && timeString.includes(':')) {
        const parts = timeString.split(':');
        const hours = parseInt(parts[0], 10);
        const minutes = parseInt(parts[1], 10);

        const date = new Date();
        date.setHours(hours, minutes, 0, 0);

        return date.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        });
      }
      return timeString;
    } catch (err) {
      return timeString;
    }
  };

  const getOrdinalSuffix = (day) => {
    if (day === 1 || day === 21 || day === 31) return 'st';
    if (day === 2 || day === 22) return 'nd';
    if (day === 3 || day === 23) return 'rd';
    return 'th';
  };

  const splitName = (full) => {
    if (!full || typeof full !== 'string') return { first: '', last: '' };
    const parts = full.trim().split(/\s+/);
    if (parts.length === 1) return { first: parts[0], last: '' };
    return { first: parts[0], last: parts.slice(1).join(' ') };
  };

  const fetchAppointments = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/appointments/view?role=salon&id=${user.salon_id}`,
        { credentials: 'include' }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch appointments: ${response.status}`);
      }

      const data = await response.json();
      const rawAppointments = Array.isArray(data) ? data : (data.appointments || []);

      if (rawAppointments.length === 0) {
        setAppointments([]);
        setFilteredAppointments([]);
        return;
      }

      const transformedAppointments = rawAppointments.map((appt) => {
        const dateLabel = formatDate(appt.appointment_date);
        const startTime = formatTime(appt.start_time);
        const endTime = formatTime(appt.end_time);
        const timeRangeLabel = `${startTime} – ${endTime}`;

        const customerFull =
          appt.customer_name ||
          `${appt.first_name || appt.customer_first_name || 'Unknown'} ${appt.last_name || appt.customer_last_name || 'Customer'}`.trim();

        const employeeFull =
          appt.employee_name ||
          `${appt.employee_first_name || appt.staff_first_name || 'Staff'} ${appt.employee_last_name || appt.staff_last_name || 'Member'}`.trim();

        const { first: customerFirst, last: customerLast } = splitName(customerFull);
        const priceVal = appt.service_price ?? appt.price ?? 0;

        return {
          appointment_id: appt.appointment_id,
          
          // Required IDs for rescheduling
          service_id: appt.service_id,
          employee_id: appt.employee_id,
          salon_id: appt.salon_id,
          customer_id: appt.customer_id,

          appointment_date: appt.appointment_date,
          start_time: appt.start_time,
          end_time: appt.end_time,

          customer_name: customerFull,
          employee_name: employeeFull,
          staff_name: employeeFull,
          service_name: appt.service_name || 'Service',
          price: parseFloat(priceVal || 0),
          status: appt.status || 'booked',

          customer_notes: appt.customer_notes ?? appt.notes ?? '',
          notes: appt.customer_notes ?? appt.notes ?? '',

          customerName: customerFull,
          first_name: customerFirst,
          last_name: customerLast,
          customer_first_name: customerFirst,
          customer_last_name: customerLast,

          date_label: dateLabel,
          time_range_label: timeRangeLabel,

          customer_email: appt.customer_email,
          customer_phone: appt.customer_phone,

          salon_name: appt.salon_name || appt.salon || '',

          raw: appt
        };
      });


      // Filter out cancelled and completed appointments
      const activeAppointments = transformedAppointments.filter(
        appt => appt.status !== 'cancelled' && appt.status !== 'completed'
      );

      setAppointments(activeAppointments);
      setFilteredAppointments(activeAppointments);
    } catch (err) {
      console.error('Fetch error:', err);
      setError(err.message || "Failed to load appointments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.salon_id) fetchAppointments();
  }, [user?.salon_id]);

  const handleDateSelect = (date) => {
    setSelectedDate(date);

    const filtered = appointments.filter(appt => {
      const apptDate = parseLocalDate(appt.appointment_date);
      if (!apptDate) return false;

      return apptDate.getDate() === date.getDate() &&
        apptDate.getMonth() === date.getMonth() &&
        apptDate.getFullYear() === date.getFullYear();
    });

    setFilteredAppointments(filtered);
  };

  const handleClearFilter = () => {
    setSelectedDate(null);
    setFilteredAppointments(appointments);
  };

  const getSelectedDateDisplay = () => {
    if (!selectedDate) return '';
    const day = selectedDate.getDate();
    const suffix = getOrdinalSuffix(day);
    return `${selectedDate.toLocaleDateString('en-US', { month: 'long' })} ${day}${suffix}, ${selectedDate.getFullYear()}`;
  };

  const handleCancel = async (appointment) => {
    try {
      const response = await fetch(`/api/appointments/cancel`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ appointment_id: appointment.appointment_id })
      });

      if (response.ok) {
        alert('Appointment cancelled successfully!');
        fetchAppointments();
      } else {
        const error = await response.json();
        alert(`Failed to cancel: ${error.error || 'Unknown error'}`);
      }
    } catch (err) {
      console.error('Cancel error:', err);
      alert('Failed to cancel appointment');
    }
  };

  const handleReschedule = (appointment) => {
    setRescheduleAppointment(appointment);
    setShowRescheduleModal(true);
  };

  const handleViewMore = (appointment) => {
    setSelectedAppointment(appointment);
    setShowViewModal(true);
  };

  const handleSendNote = (appointment, note) => alert(`Note saved: ${note}`);

  if (loading) {
    return (
      <div className="business-calendar">
        <h1>Business Calendar</h1>
        <div className="appointments-container">
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading appointments...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="business-calendar">
        <h1>Business Calendar</h1>
        <div className="appointments-container">
          <p className="error">Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="business-calendar">
      <h1>Business Calendar</h1>
      <p>Manage your salon appointments</p>

      <div className="calendar-appointments-layout">
        <div className="calendar-section">
          <Calendar
            appointments={appointments}
            onDateSelect={handleDateSelect}
            selectedDate={selectedDate}
          />
        </div>

        <div className="appointments-section">
          {selectedDate && (
            <div className="filter-header">
              <h3>Appointments for {getSelectedDateDisplay()}</h3>
              <button className="clear-filter-btn" onClick={handleClearFilter}>
                Show All
              </button>
            </div>
          )}

          <div className="appointments-container">
            {filteredAppointments.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">📅</div>
                <h2>{selectedDate ? 'No Appointments This Day' : 'No Appointments Scheduled'}</h2>
                <p>
                  {selectedDate
                    ? 'No appointments scheduled for this date.'
                    : 'Your appointments will appear here once customers start booking.'}
                </p>
              </div>
            ) : (
              <>
                <p style={{ textAlign: 'center', marginBottom: '20px', color: '#7e6853' }}>
                  Showing {filteredAppointments.length} appointment{filteredAppointments.length !== 1 ? 's' : ''}
                </p>

                {filteredAppointments.map((appointment) => (
                  <AppointmentItem
                    key={appointment.appointment_id}
                    appointment={appointment}
                    accountType="owner"
                    onCancel={handleCancel}
                    onReschedule={handleReschedule}
                    onViewMore={handleViewMore}
                    onSendNote={handleSendNote}
                  />
                ))}

                {showViewModal && selectedAppointment && (
                  <ViewAppointment
                    appointment={selectedAppointment}
                    setModalOpen={(val) => {
                      if (val == null || val === false) {
                        setShowViewModal(false);
                        setSelectedAppointment(null);
                        return;
                      }
                      setSelectedAppointment(val);
                      setShowViewModal(true);
                    }}
                  />
                )}

                {showRescheduleModal && rescheduleAppointment && (
                  <RescheduleAppointment
                    accountType="owner"
                    appointment={rescheduleAppointment}
                    salonId={user?.salon_id}
                    setModalOpen={setShowRescheduleModal}
                    onSuccess={() => {
                      setShowRescheduleModal(false);
                      setRescheduleAppointment(null);
                      fetchAppointments();
                    }}
                  />
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default BusinessCalendar;