import { useState, useEffect } from 'react'
import { useUser } from "../context/UserContext";
import AppointmentItem from '../components/AppointmentItem.jsx'
import Calendar from '../components/Calendar.jsx'
import './BusinessCalendar.css'

function BusinessCalendar() {
  const { user } = useUser();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [filteredAppointments, setFilteredAppointments] = useState([]);

  // Helper to parse date string without timezone issues
  const parseLocalDate = (dateString) => {
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day);
  };

  // Helper function to format date
  const formatDate = (dateString) => {
    const date = parseLocalDate(dateString);
    const day = date.getDate();
    const suffix = day === 1 || day === 21 || day === 31 ? 'st' :
                   day === 2 || day === 22 ? 'nd' :
                   day === 3 || day === 23 ? 'rd' : 'th';
    const options = { month: 'long', year: 'numeric' };
    const monthYear = date.toLocaleDateString('en-US', options);
    return `${monthYear.split(' ')[0]} ${day}${suffix}, ${monthYear.split(' ')[1]}`;
  };

  // Helper function to format time
  const formatTime = (timeString) => {
    if (!timeString) return '';
    
    let hours, minutes;
    
    if (typeof timeString === 'string' && timeString.includes(':')) {
      [hours, minutes] = timeString.split(':');
      hours = parseInt(hours);
    } else {
      return timeString;
    }
    
    const ampm = hours >= 12 ? 'pm' : 'am';
    const displayHour = hours % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  // Fetch appointments from API
  const fetchAppointments = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/appointments/salon/${user.salon_id}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch appointments: ${response.status}`);
      }

      const data = await response.json();
      const rawAppointments = Array.isArray(data) ? data : (data.appointments || []);

      if (rawAppointments.length === 0) {
        setAppointments([]);
        setFilteredAppointments([]);
        setLoading(false);
        return;
      }

      console.log('Raw appointment data:', rawAppointments[0]);
console.log('Date from API:', rawAppointments[0]?.appointment_date);

      // Transform appointments
      // Transform appointments
const transformedAppointments = rawAppointments.map((appt) => {
  const dateLabel = formatDate(appt.appointment_date);
  const startTime = formatTime(appt.start_time);
  const endTime = formatTime(appt.end_time);
  const timeRangeLabel = `${startTime} – ${endTime}`;

  return {
    appointment_id: appt.appointment_id,
    customer_name: `${appt.first_name || 'Unknown'} ${appt.last_name || 'Customer'}`,
    staff_name: `${appt.employee_first_name || 'Staff'} ${appt.employee_last_name || 'Member'}`,
    service_name: appt.service_name || 'Service',
    date_label: dateLabel,
    time_range_label: timeRangeLabel,
    price: parseFloat(appt.price || 0),
    customer_notes: appt.notes || '',
    status: appt.status || 'booked',
    raw: appt
  };
});

      setAppointments(transformedAppointments);
      setFilteredAppointments(transformedAppointments);

    } catch (err) {
      console.error('Fetch error:', err);
      setError(err.message || "Failed to load appointments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user.salon_id) {
      fetchAppointments();
    }
  }, [user.salon_id]);

  // Handle date selection from calendar - FIXED
  const handleDateSelect = (date) => {
    setSelectedDate(date);
    
    // Filter appointments for selected date
    const filtered = appointments.filter(appt => {
      const apptDate = parseLocalDate(appt.raw.appointment_date);
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

  const handleCancel = async (appointment) => {
    try {
      const response = await fetch(`/api/appointments/cancel`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          appointment_id: appointment.appointment_id
        })
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
    alert('Reschedule feature coming soon!');
  };

  const handleViewMore = (appointment) => {
    alert('View more details coming soon!');
  };

  const handleSendNote = (appointment, note) => {
    alert(`Note saved: ${note}`);
  };

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
          <p className="error">{error}</p>
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
              <h3>Appointments for {selectedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</h3>
              <button className="clear-filter-btn" onClick={handleClearFilter}>Show All</button>
            </div>
          )}

          <div className="appointments-container">
            {filteredAppointments.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">📅</div>
                <h2>{selectedDate ? 'No Appointments This Day' : 'No Appointments Scheduled'}</h2>
                <p>{selectedDate ? 'No appointments scheduled for this date.' : 'Your appointments will appear here once customers start booking.'}</p>
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
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default BusinessCalendar;