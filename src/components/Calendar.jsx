import React, { useState } from 'react';
import './Calendar.css';

function Calendar({ appointments = [], onDateSelect, selectedDate }) {
  const [currentDate, setCurrentDate] = useState(new Date());

  // Helper to parse date string without timezone issues
  const parseLocalDate = (dateString) => {
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day);
  };

  // Get first day of month and total days
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Create array of dates with appointment counts - FIXED
  const getAppointmentCountForDate = (day) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return appointments.filter(appt => {
      const apptDate = parseLocalDate(appt.raw.appointment_date);
      const apptDateStr = `${apptDate.getFullYear()}-${String(apptDate.getMonth() + 1).padStart(2, '0')}-${String(apptDate.getDate()).padStart(2, '0')}`;
      return apptDateStr === dateStr;
    }).length;
  };

  const isToday = (day) => {
    const today = new Date();
    return day === today.getDate() && 
           month === today.getMonth() && 
           year === today.getFullYear();
  };

  const isSelectedDate = (day) => {
    if (!selectedDate) return false;
    return day === selectedDate.getDate() && 
           month === selectedDate.getMonth() && 
           year === selectedDate.getFullYear();
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleDateClick = (day) => {
    const clickedDate = new Date(year, month, day);
    onDateSelect(clickedDate);
  };

  // Create calendar grid
  const calendarDays = [];
  
  // Empty cells before first day
  for (let i = 0; i < firstDay; i++) {
    calendarDays.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
  }

  // Days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const appointmentCount = getAppointmentCountForDate(day);
    const isCurrentDay = isToday(day);
    const isSelected = isSelectedDate(day);

    calendarDays.push(
      <div
        key={day}
        className={`calendar-day ${isCurrentDay ? 'today' : ''} ${isSelected ? 'selected' : ''} ${appointmentCount > 0 ? 'has-appointments' : ''}`}
        onClick={() => handleDateClick(day)}
      >
        <span className="day-number">{day}</span>
        {appointmentCount > 0 && (
          <span className="appointment-badge">{appointmentCount}</span>
        )}
      </div>
    );
  }

  return (
    <div className="calendar-widget">
      <div className="calendar-header">
        <button className="calendar-nav-btn" onClick={handlePrevMonth}>‹</button>
        <h2>{monthNames[month]} {year}</h2>
        <button className="calendar-nav-btn" onClick={handleNextMonth}>›</button>
      </div>

      <div className="calendar-weekdays">
        <div>Sun</div>
        <div>Mon</div>
        <div>Tue</div>
        <div>Wed</div>
        <div>Thu</div>
        <div>Fri</div>
        <div>Sat</div>
      </div>

      <div className="calendar-grid">
        {calendarDays}
      </div>
    </div>
  );
}

export default Calendar;