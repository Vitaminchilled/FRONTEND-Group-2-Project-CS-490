import { useState, useEffect } from 'react';
import { Pencil, Lock } from "lucide-react";
import deleteIcon from '../assets/BlackXIcon.png';
import ServiceItem from './ServiceItem';
import './BookAppointment.css';

export function RescheduleAppointment({
  accountType,
  appointment,
  salonId,
  setModalOpen,
  onSuccess
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Debug: Log appointment data
  useEffect(() => {
    console.log('Reschedule appointment data:', appointment);
    console.log('Raw appointment data:', appointment.raw);
    console.log('Salon ID from props:', salonId);
  }, []);

  // Service and employee are locked from the original appointment
  const chosenService = {
    service_id: appointment.raw?.service_id || appointment.service_id,
    service_name: appointment.service_name,
    duration_minutes: appointment.raw?.duration_minutes || appointment.duration_minutes || 60,
    price: appointment.price
  };

  const chosenEmployee = {
    employee_id: appointment.raw?.employee_id || appointment.employee_id,
    first_name: appointment.raw?.employee_first_name || appointment.staff_name?.split(' ')[0] || 'Staff',
    last_name: appointment.raw?.employee_last_name || appointment.staff_name?.split(' ').slice(1).join(' ') || 'Member'
  };

  const salon = {
    salon_id: appointment.raw?.salon_id || appointment.salon_id || salonId
  };

  const customer_id = appointment.raw?.customer_id || appointment.customer_id;

  /* DATE & TIME SELECTION */
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [slotError, setSlotError] = useState(null);
  const [weeklyAvailability, setWeeklyAvailability] = useState([]);
  const [weeklyMap, setWeeklyMap] = useState({});
  const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  const formatDate = (d) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};


  const today = new Date();
  const currentWeekStart = new Date(today);
  currentWeekStart.setHours(0, 0, 0, 0);
  currentWeekStart.setDate(today.getDate() - today.getDay());

  const [weekStart, setWeekStart] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - d.getDay());
    return d;
  });

  const startDate = new Date(weekStart);
  const endDate = new Date(weekStart);
  endDate.setDate(weekStart.getDate() + 6);

  const startMonth = startDate.toLocaleString("en-US", { month: "long" });
  const endMonth = endDate.toLocaleString("en-US", { month: "long" });
  const year = startDate.getFullYear();

  const monthDisplay = startMonth === endMonth ? `${startMonth} ${year}` : `${startMonth.slice(0, 3)} / ${endMonth.slice(0, 3)} ${year}`;

  const [chosenDateTime, setChosenDateTime] = useState({});

  const nextWeek = () => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + 7);
    setWeekStart(d);
  };

  const prevWeek = () => {
    const weekStartDate = new Date(weekStart).setHours(0, 0, 0, 0);
    const currentWeekDate = new Date(currentWeekStart).setHours(0, 0, 0, 0);

    if (weekStartDate <= currentWeekDate) return;

    const d = new Date(weekStart);
    d.setDate(d.getDate() - 7);
    setWeekStart(d);
  };

  useEffect(() => {
    if (!chosenEmployee.employee_id) return;

    const fetchAvailability = async () => {
      setLoadingSlots(true);
      setSlotError(null);

      try {
        const res = await fetch(
          `/api/employees/${chosenEmployee.employee_id}/weekly-availability/sunday-based?date=${formatDate(weekStart)}`
        );

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "Failed to fetch availability");
        }

        const data = await res.json();

        const week = data.week || [];
        setWeeklyAvailability(week);

        const map = {};
        week.forEach(day => {
          map[day.day] = day.timeline;
        });
        setWeeklyMap(map);
      } catch (err) {
        console.error(err);
        setSlotError(err.message);
      } finally {
        setLoadingSlots(false);
      }
    };

    fetchAvailability();
  }, [chosenEmployee.employee_id, weekStart]);

  const isPastSlot = (day, time) => {
    const now = new Date();
    const dayIndex = daysOfWeek.indexOf(day);
    if (dayIndex === -1) return false;

    const slotDate = new Date(weekStart);
    slotDate.setDate(weekStart.getDate() + dayIndex);

    const [h, m] = time.split(':').map(Number);
    slotDate.setHours(h, m, 0, 0);

    return slotDate <= now;
  };

  const chooseSlot = (day, startTime) => {
    const dayIndex = daysOfWeek.indexOf(day);
    if (dayIndex === -1) return;

    const targetDate = new Date(weekStart);
    targetDate.setDate(weekStart.getDate() + dayIndex);
    const dateString = formatDate(targetDate);

    const slots = weeklyMap[day] || [];
    const startIndex = slots.findIndex(s => s.time === startTime);
    if (startIndex === -1) return;

    const durationMinutes = chosenService.duration_minutes || 60;
    const numSlotsNeeded = Math.ceil(durationMinutes / 15);

    const requiredSlots = [];
    for (let i = 0; i < numSlotsNeeded; i++) {
      const idx = startIndex + i;
      if (idx >= slots.length) return;

      const slot = slots[idx];
      if (slot.status !== 'available') return;

      requiredSlots.push(slot.time);
    }

    const [startH, startM] = startTime.split(':').map(Number);
    const endMinutes = startM + durationMinutes;
    const endH = startH + Math.floor(endMinutes / 60);
    const endM = endMinutes % 60;

    const endTimeStr = `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}:00`;

    setChosenDateTime({
      appointment_date: dateString,
      start_time: startTime,
      end_time: endTimeStr,
      required_times: requiredSlots
    });
  };

  const handleRescheduleSubmit = async () => {
    if (!chosenDateTime.appointment_date) {
      alert('Please select a time slot');
      return;
    }

    // Validate all required fields before submitting
    const bookingData = {
      salon_id: salon.salon_id,
      employee_id: chosenEmployee.employee_id,
      customer_id: customer_id,
      service_id: chosenService.service_id,
      appointment_date: chosenDateTime.appointment_date,
      start_time: chosenDateTime.start_time,
      notes: appointment.notes || appointment.customer_notes || ''
    };

    console.log('Booking data to submit:', bookingData);

    // Check for missing required fields
    const missingFields = [];
    if (!bookingData.salon_id) missingFields.push('salon_id');
    if (!bookingData.employee_id) missingFields.push('employee_id');
    if (!bookingData.customer_id) missingFields.push('customer_id');
    if (!bookingData.service_id) missingFields.push('service_id');
    if (!bookingData.appointment_date) missingFields.push('appointment_date');
    if (!bookingData.start_time) missingFields.push('start_time');

    if (missingFields.length > 0) {
      const errorMsg = `Missing required fields: ${missingFields.join(', ')}`;
      console.error(errorMsg);
      console.error('Full appointment object:', appointment);
      alert(errorMsg);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Step 1: Book the new appointment
      const bookResponse = await fetch('/api/appointments/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(bookingData)
      });

      if (!bookResponse.ok) {
        const errorData = await bookResponse.json();
        throw new Error(errorData.error || 'Failed to book new appointment');
      }

      // Step 2: Cancel the old appointment
      const cancelResponse = await fetch('/api/appointments/cancel', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          appointment_id: appointment.appointment_id
        })
      });

      if (!cancelResponse.ok) {
        const errorData = await cancelResponse.json();
        console.error('Failed to cancel old appointment:', errorData);
        // Don't throw here - the new appointment was created successfully
      }

      alert('Appointment rescheduled successfully!');
      setModalOpen(false);
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error('Reschedule error:', err);
      setError(err.message);
      alert(`Failed to reschedule: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ModalBackground">
      <div className='AppointmentModalContainer'>
        <div className='AppointmentModalTitle'>
          <h2 className='step-title'>Reschedule Appointment</h2>
          <img
            className='appointment-close'
            src={deleteIcon}
            alt='Close'
            onClick={() => setModalOpen(false)}
          />
        </div>

        <div className='AppointmentModalBody'>
          {/* Show locked service */}
          <div style={{ marginBottom: '20px', padding: '15px', background: '#f5f5f5', borderRadius: '8px' }}>
            <h3 className='details-title' style={{ marginBottom: '10px' }}>Service (Locked)</h3>
            <p className='details-text'><strong>Service:</strong> {chosenService.service_name}</p>
            <p className='details-text'><strong>Price:</strong> ${chosenService.price}</p>
            <p className='details-text'><strong>Duration:</strong> {chosenService.duration_minutes} minutes</p>
          </div>

          {/* Show locked employee */}
          <div style={{ marginBottom: '20px', padding: '15px', background: '#f5f5f5', borderRadius: '8px' }}>
            <h3 className='details-title' style={{ marginBottom: '10px' }}>Stylist (Locked)</h3>
            <p className='details-text'><strong>Stylist:</strong> {chosenEmployee.first_name} {chosenEmployee.last_name}</p>
          </div>

          <h3 className='details-title' style={{ marginTop: '20px', marginBottom: '15px' }}>Select New Date & Time</h3>

          {loadingSlots && <p>Loading weekly schedule...</p>}
          {slotError && <p style={{ color: 'red' }}>{slotError}</p>}

          {!loadingSlots && !slotError && weeklyAvailability.length > 0 && (
            <div className="weekly-container">
              {/* navigation between weeks */}
              <div className="week-nav">
                <button
                  className="modal-btns"
                  onClick={prevWeek}
                  disabled={
                    new Date(weekStart).setHours(0, 0, 0, 0) <=
                    new Date(currentWeekStart).setHours(0, 0, 0, 0)
                  }
                >
                  {'< Prev Week'}
                </button>
                <h3 className="week-title">{monthDisplay}</h3>
                <button className="modal-btns" onClick={nextWeek}>
                  {"Next Week >"}
                </button>
              </div>
              <div className="weekly-grid">
                <div className='weekly-grid-row header-row'>
                  <div className="time-col"></div>
                  {daysOfWeek.map((day, index) => {
                    const dateForDay = new Date(weekStart);
                    dateForDay.setDate(weekStart.getDate() + index);

                    return (
                      <div key={day} className='day-col-header'>
                        <div className="weekday">{day.slice(0, 3)}</div>
                        <div className="day-number">{dateForDay.getDate()}</div>
                      </div>
                    );
                  })}
                </div>
                {[...new Set(
                  Object.values(weeklyMap).flatMap(day =>
                    day.map(slot => slot.time).sort()
                  )
                )].map(time => {
                  return (
                    <div key={time} className='weekly-grid-row'>
                      <div className="time-col">{time.slice(0, 5)}</div>

                      {daysOfWeek.map((day, index) => {
                        const slot = weeklyMap[day]?.find(s => s.time === time);
                        const status = slot?.status || "unavailable";

                        const dateForDay = new Date(weekStart);
                        dateForDay.setHours(0, 0, 0, 0);
                        dateForDay.setDate(weekStart.getDate() + index);

                        const past = isPastSlot(day, time);
                        const isSelectedBlock =
                          chosenDateTime.appointment_date === formatDate(dateForDay) &&
                          chosenDateTime.required_times?.includes(time);

                        return (
                          <div
                            key={day + time}
                            title={`${past ? "This time has already passed" : status}`}
                            className={`slot 
                              ${past ? "past-slot" : status}
                              ${isSelectedBlock ? "selected-slot" : ""}`}
                            onClick={() => {
                              if (!past && status === "available") chooseSlot(day, time);
                            }}
                          >
                            {past ? "" : status === "available" ? "✓" : status === "booked" ? "X" : ""}
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {chosenDateTime.appointment_date && (
            <div style={{ marginTop: '20px', padding: '15px', background: '#e8f5e9', borderRadius: '8px' }}>
              <h3 className='details-title'>New Appointment Details:</h3>
              <p className='details-text'><strong>Date:</strong> {chosenDateTime.appointment_date}</p>
              <p className='details-text'><strong>Start Time:</strong> {chosenDateTime.start_time?.slice(0, 5)}</p>
              <p className='details-text'><strong>End Time:</strong> {chosenDateTime.end_time?.slice(0, 5)}</p>
            </div>
          )}
        </div>

        <div className='AppointmentModalFooter'>
          <button
            className="modal-btns"
            onClick={() => setModalOpen(false)}
          >
            Cancel
          </button>
          <button
            className="modal-btns"
            disabled={!chosenDateTime.appointment_date || loading}
            onClick={handleRescheduleSubmit}
          >
            {loading ? 'Rescheduling...' : 'CONFIRM RESCHEDULE'}
          </button>
        </div>
      </div>
    </div>
  );
}

export function RescheduleAppointmentVer2({
  user,
  appointment,
  setModalOpen,
  onSuccess,
  setModalMessage
}) {
  const [step, setStep] = useState(1)
  const nextStep = () => setStep((s) => s+1)
  const prevStep = () => setStep((s) => s-1)

  const [editData, setEditData] = useState({
    customer_notes: appointment.customer_notes || appointment.notes || "",
    image_url: appointment.image_url || null,
    image_after_url: appointment.image_after_url || null,
  })
    
  const [imagePreview1, setImagePreview1] = useState(null)
  const [imagePreview2, setImagePreview2] = useState(null)

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

  /* stuff from above function */
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /* DATE & TIME SELECTION */
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [slotError, setSlotError] = useState(null);
  const [weeklyAvailability, setWeeklyAvailability] = useState([]);
  const [weeklyMap, setWeeklyMap] = useState({});
  const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  const formatDate = (d) => d.toISOString().split("T")[0];

  const today = new Date();
  const currentWeekStart = new Date(today);
  currentWeekStart.setHours(0, 0, 0, 0);
  currentWeekStart.setDate(today.getDate() - today.getDay());

  const [weekStart, setWeekStart] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - d.getDay());
    return d;
  });

  const startDate = new Date(weekStart);
  const endDate = new Date(weekStart);
  endDate.setDate(weekStart.getDate() + 6);

  const startMonth = startDate.toLocaleString("en-US", { month: "long" });
  const endMonth = endDate.toLocaleString("en-US", { month: "long" });
  const year = startDate.getFullYear();

  const monthDisplay = startMonth === endMonth ? `${startMonth} ${year}` : `${startMonth.slice(0, 3)} / ${endMonth.slice(0, 3)} ${year}`;

  const [chosenDateTime, setChosenDateTime] = useState({});

  const nextWeek = () => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + 7);
    setWeekStart(d);
  };

  const prevWeek = () => {
    const weekStartDate = new Date(weekStart).setHours(0, 0, 0, 0);
    const currentWeekDate = new Date(currentWeekStart).setHours(0, 0, 0, 0);

    if (weekStartDate <= currentWeekDate) return;

    const d = new Date(weekStart);
    d.setDate(d.getDate() - 7);
    setWeekStart(d);
  };

  useEffect(() => {
    if (!appointment.employee_id) return;

    const fetchAvailability = async () => {
      setLoadingSlots(true);
      setSlotError(null);

      try {
        const res = await fetch(
          `/api/employees/${appointment.employee_id}/weekly-availability/sunday-based?date=${formatDate(weekStart)}`
        );

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "Failed to fetch availability");
        }

        const data = await res.json();

        const week = data.week || [];
        setWeeklyAvailability(week);

        const map = {};
        week.forEach(day => {
          map[day.day] = day.timeline;
        });
        setWeeklyMap(map);
      } catch (err) {
        console.error(err);
        setSlotError(err.message);
      } finally {
        setLoadingSlots(false);
      }
    };

    fetchAvailability();
  }, [appointment.employee_id, weekStart]);

  const isPastSlot = (day, time) => {
    const now = new Date();
    const dayIndex = daysOfWeek.indexOf(day);
    if (dayIndex === -1) return false;

    const slotDate = new Date(weekStart);
    slotDate.setDate(weekStart.getDate() + dayIndex);

    const [h, m] = time.split(':').map(Number);
    slotDate.setHours(h, m, 0, 0);

    return slotDate <= now;
  };

  const chooseSlot = (day, startTime) => {
    const dayIndex = daysOfWeek.indexOf(day);
    if (dayIndex === -1) return;

    const targetDate = new Date(weekStart);
    targetDate.setHours(0, 0, 0, 0);
    targetDate.setDate(weekStart.getDate() + dayIndex);
    const dateString = formatDate(targetDate);

    const slots = weeklyMap[day] || [];
    const startIndex = slots.findIndex(s => s.time === startTime);
    if (startIndex === -1) return;

    const durationMinutes = appointment.service_duration || 60;
    const numSlotsNeeded = Math.ceil(durationMinutes / 15);

    const requiredSlots = [];
    for (let i = 0; i < numSlotsNeeded; i++) {
      const idx = startIndex + i;
      if (idx >= slots.length) return;

      const slot = slots[idx];
      if (slot.status !== 'available') return;

      requiredSlots.push(slot.time);
    }

    const [startH, startM] = startTime.split(':').map(Number);
    const endMinutes = startM + durationMinutes;
    const endH = startH + Math.floor(endMinutes / 60);
    const endM = endMinutes % 60;

    const endTimeStr = `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}:00`;

    setChosenDateTime({
      appointment_date: dateString,
      start_time: startTime,
      end_time: endTimeStr,
      required_times: requiredSlots
    });
  };

  const handleRescheduleSubmit = async () => {
    if (!chosenDateTime.appointment_date || !chosenDateTime.start_time) {
      setModalMessage({
          title: "Error",
          content: err.message || 'Please select a time slot.'
      })
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData()
      formData.append("appointment_id", appointment.appointment_id)
      formData.append("new_date", chosenDateTime.appointment_date);
      formData.append("new_start_time", chosenDateTime.start_time);
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
      });/*
      const payload = {
          appointment_id: appointment.appointment_id,
          new_date: chosenDateTime.appointment_date,       // YYYY-MM-DD
          new_start_time: chosenDateTime.start_time,       // HH:MM:SS
          new_note: editData.customer_notes || editData.notes || ""
      }

      const rescheduleResponse = await fetch("/api/appointments/update", {
        method: "PUT",
        credentials: 'include',
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      })*/

      if (!rescheduleResponse.ok) {
        const errorData = await rescheduleResponse.json();
        throw new Error(errorData.error || 'Failed to reschedule your appointment');
      }

      const data = await rescheduleResponse.json();

      setModalMessage({
          title: "Success",
          content: data.message || 'Appointment rescheduled successfully!'
      })
      if (onSuccess) onSuccess()
      setModalOpen(false);
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
      <div className='AppointmentModalContainer'>
        <div className='AppointmentModalTitle'>
          {step === 1 && (<h2 className='step-title'>Select New Date & Time</h2>)}
          {step === 2 && (<h2 className='step-title'>Review Appointment Details</h2>)}
          <img
            className='appointment-close'
            src={deleteIcon}
            alt='Close'
            onClick={() => setModalOpen(false)}
          />
        </div>

        {step === 1 && (
          <div className='AppointmentModalBody'>
            {loadingSlots && <p>Loading weekly schedule...</p>}
            {slotError && <p style={{ color: 'red' }}>{slotError}</p>}

            {chosenDateTime.appointment_date && (
              <div style={{ margin: '0', padding: '15px 20px', background: '#e8f5e9', borderRadius: '8px' , border:'1px solid #b4e0b7ff'}}>
                <h3 className='details-title' style={{margin: '0'}}>New Appointment Details:</h3>
                <p className='details-text'><strong>Date:</strong> {chosenDateTime.appointment_date}</p>
                <p className='details-text'><strong>Start Time:</strong> {chosenDateTime.start_time?.slice(0, 5)}</p>
                <p className='details-text'><strong>End Time:</strong> {chosenDateTime.end_time?.slice(0, 5)}</p>
              </div>
            )}

            {!loadingSlots && !slotError && weeklyAvailability.length > 0 && (
              <div className="weekly-container">
                {/* navigation between weeks */}
                <div className="week-nav">
                  <button
                    className="modal-btns"
                    onClick={prevWeek}
                    disabled={
                      new Date(weekStart).setHours(0, 0, 0, 0) <=
                      new Date(currentWeekStart).setHours(0, 0, 0, 0)
                    }
                  >
                    {'< Prev Week'}
                  </button>
                  <h3 className="week-title">{monthDisplay}</h3>
                  <button className="modal-btns" onClick={nextWeek}>
                    {"Next Week >"}
                  </button>
                </div>
                <div className="weekly-grid">
                  <div className='weekly-grid-row header-row'>
                    <div className="time-col"></div>
                    {daysOfWeek.map((day, index) => {
                      const dateForDay = new Date(weekStart);
                      dateForDay.setDate(weekStart.getDate() + index);

                      return (
                        <div key={day} className='day-col-header'>
                          <div className="weekday">{day.slice(0, 3)}</div>
                          <div className="day-number">{dateForDay.getDate()}</div>
                        </div>
                      );
                    })}
                  </div>
                  {[...new Set(
                    Object.values(weeklyMap).flatMap(day =>
                      day.map(slot => slot.time).sort()
                    )
                  )].map(time => {
                    return (
                      <div key={time} className='weekly-grid-row'>
                        <div className="time-col">{time.slice(0, 5)}</div>

                        {daysOfWeek.map((day, index) => {
                          const slot = weeklyMap[day]?.find(s => s.time === time);
                          const status = slot?.status || "unavailable";

                          const dateForDay = new Date(weekStart);
                          dateForDay.setHours(0, 0, 0, 0);
                          dateForDay.setDate(weekStart.getDate() + index);

                          const past = isPastSlot(day, time);
                          const isSelectedBlock =
                            chosenDateTime.appointment_date === formatDate(dateForDay) &&
                            chosenDateTime.required_times?.includes(time);

                          return (
                            <div
                              key={day + time}
                              title={`${past ? "This time has already passed" : status}`}
                              className={`slot 
                                ${past ? "past-slot" : status}
                                ${isSelectedBlock ? "selected-slot" : ""}`}
                              onClick={() => {
                                if (!past && status === "available") chooseSlot(day, time);
                              }}
                            >
                              {past ? "" : status === "available" ? "✓" : status === "booked" ? "X" : ""}
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
        {step === 2 && (
          <div className="AppointmentModalBody">
            <div style={{ margin: '0 0 10px 0', padding: '15px 20px', background: '#f3ece4', borderRadius: '8px' , border:'1px solid #e0d5c8'}}>
              <h3 className='details-title' style={{ margin: '0 0 5px 0' }}>
                Service
                <Lock size={20} style={{margin:'0 0 0 10px', transform: 'translateY(2px)'}}/>
              </h3>
              <p className='details-text'><strong>Service:</strong> {appointment.service_name}</p>
              <p className='details-text'><strong>Price:</strong> ${appointment.price}</p>
              <p className='details-text'><strong>Duration:</strong> {appointment.service_duration} minutes</p>
            </div>

            {/* Show locked employee */}
            <div style={{ margin: '0 0 10px 0', padding: '15px 20px', background: '#f3ece4', borderRadius: '8px' , border:'1px solid #e0d5c8'}}>
              <h3 className='details-title' style={{ margin: '0 0 5px 0' }}>
                Stylist 
                <Lock size={20} style={{margin:'0 0 0 10px', transform: 'translateY(2px)'}}/>
              </h3>
              <p className='details-text'><strong>Stylist:</strong> {appointment.employee_name}</p>
            </div>

            {/* Show new appointment date and time */}
            {chosenDateTime.appointment_date && (
              <div style={{ margin: '0', padding: '15px 20px', background: '#e8f5e9', borderRadius: '8px' , border:'1px solid #b4e0b7ff'}}>
                <h3 className='details-title' style={{margin: '0'}}>New Appointment Details:</h3>
                <p className='details-text'><strong>Date:</strong> {chosenDateTime.appointment_date}</p>
                <p className='details-text'><strong>Start Time:</strong> {chosenDateTime.start_time?.slice(0, 5)}</p>
                <p className='details-text'><strong>End Time:</strong> {chosenDateTime.end_time?.slice(0, 5)}</p>
              </div>
            )}

            <div className="note-section">
              <h3 className='details-title'
                style={{
                  fontFamily: 'Kumbh Sans',
                  fontWeight: '400',
                  margin: '20px 0 10px 0',
                  fontSize: '20px',
                  textDecoration: 'underline'
                }}
              >
                Additional Details: 
              </h3>
              <textarea className='edit-note'
                  name='customer_notes'
                  value={editData.customer_notes}
                  onChange={handleChange}
                  placeholder='Write appointment notes here...'
                  style={{
                    resize:'vertical',
                    width: '90%',
                    minHeight: '80px',
                    maxHeight: '180px',
                    backgroundColor: '#fdfbf8',
                    borderRadius: '6px',
                    border: '1px solid #e0d5c8',
                    padding: '10px 12px',
                    position: 'relative',
                    boxSizing: 'border-box'
                  }}
              />
              <p className='details-text'
                style={{
                  margin: '10px 0 0 0'
                }}
              >
                  <strong>Reference/Before Photo: </strong>
              </p>
              <input className="input-img"
                  name='image_url'
                  type="file"
                  accept='image/*'
                  onChange={handleImageChange}
              />
              {(imagePreview1 || editData.image_url) && (
                <img className="img-preview" src={imagePreview1 || editData.image_url} />
              )}
              <p className='details-text'
                style={{
                  margin: '30px 0 0 0'
                }}
              >
                  <strong>After Photo: </strong>
              </p>
              <input className="input-img"
                  name='image_after_url'
                  type="file"
                  accept='image/*'
                  onChange={handleImageChange}
              />
              {(imagePreview2 || editData.image_after_url) && (
                <img className="img-preview" src={imagePreview2 || editData.image_after_url} />
              )}
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
          <button
            className="modal-btns"
            disabled={
              (step === 1) ? (!chosenDateTime.appointment_date || loading) : 
              (step === 2 && !chosenDateTime.appointment_date)
            }
            onClick={step === 2 ? handleRescheduleSubmit : nextStep}
          >
            {(step === 2) ? 'SUBMIT DATETIME' : (
              (loading) ? 'Rescheduling...' : 'CONFIRM RESCHEDULE'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
