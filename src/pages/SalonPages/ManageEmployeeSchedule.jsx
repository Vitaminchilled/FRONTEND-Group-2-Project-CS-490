import { useState, useEffect } from 'react';
import { useUser } from '../../context/UserContext';
import './ManageEmployeeSchedule.css';

function ManageEmployeeSchedule() {
  const { user } = useUser();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [schedules, setSchedules] = useState({});
  const [breaks, setBreaks] = useState({}); // Store breaks by employee_id and day
  const [editingDay, setEditingDay] = useState(null);
  const [tempSchedule, setTempSchedule] = useState({ start: '09:00', end: '17:00' });
  const [addingBreak, setAddingBreak] = useState(null); // Track which day is adding a break
  const [tempBreak, setTempBreak] = useState({ start: '12:00', end: '13:00' });

  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  // Fetch employees
  useEffect(() => {
    if (user.salon_id) {
      fetchEmployees();
    }
  }, [user.salon_id]);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/salon/${user.salon_id}/employees`, { credentials: 'include' });
      if (!response.ok) throw new Error('Failed to fetch employees');
      const data = await response.json();
      setEmployees(data.employees || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch employee schedule and breaks
  const fetchEmployeeSchedule = async (employeeId) => {
    const formatLocalISODate = (d = new Date()) => {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    };

    try {
      const response = await fetch(
        `/api/employees/${employeeId}/weekly-availability/sunday-based?date=${formatLocalISODate()}`,
        { credentials: 'include' }
      );
      if (!response.ok) throw new Error('Failed to fetch schedule');

      const data = await response.json();
      const week = Array.isArray(data) ? data : data.week;
      const scheduleByDay = {};
      const breaksByDay = {};

      if (Array.isArray(week)) {
        week.forEach((dayEntry) => {
          const sched = dayEntry?.employee_schedule;
          if (sched?.start_time && sched?.end_time) {
            scheduleByDay[dayEntry.day] = {
              start_time: sched.start_time,
              end_time: sched.end_time,
              is_active: true
            };
          }
        });
      }

      setSchedules((prev) => ({ ...prev, [employeeId]: scheduleByDay }));
      
      // Fetch breaks separately
      await fetchEmployeeBreaks(employeeId);
    } catch (err) {
      console.error('Error fetching schedule:', err);
      setSchedules((prev) => ({ ...prev, [employeeId]: {} }));
    }
  };

  // Fetch breaks (unavailable time slots) for an employee
  const fetchEmployeeBreaks = async (employeeId) => {
    try {
      const response = await fetch(
        `/api/employees/${employeeId}/breaks`,
        { credentials: 'include' }
      );
      
      if (!response.ok) {
        // If endpoint doesn't exist yet, that's okay
        if (response.status === 404) {
          setBreaks((prev) => ({ ...prev, [employeeId]: {} }));
          return;
        }
        throw new Error('Failed to fetch breaks');
      }

      const data = await response.json();
      const breaksByDay = {};

      // Expecting: { breaks: [{ day, start_time, end_time, slot_id }] }
      if (data.breaks && Array.isArray(data.breaks)) {
        data.breaks.forEach((breakItem) => {
          if (!breaksByDay[breakItem.day]) {
            breaksByDay[breakItem.day] = [];
          }
          breaksByDay[breakItem.day].push({
            slot_id: breakItem.slot_id,
            start_time: breakItem.start_time,
            end_time: breakItem.end_time
          });
        });
      }

      setBreaks((prev) => ({ ...prev, [employeeId]: breaksByDay }));
    } catch (err) {
      console.error('Error fetching breaks:', err);
      setBreaks((prev) => ({ ...prev, [employeeId]: {} }));
    }
  };

  // Handle employee selection
  const handleSelectEmployee = (employee) => {
    setSelectedEmployee(employee);
    setEditingDay(null);
    setAddingBreak(null);
    fetchEmployeeSchedule(employee.employee_id);
  };

  // Convert 24-hour time to 12-hour display format
  const formatTimeTo12Hour = (time24) => {
    if (!time24) return '';
    const [hours, minutes] = time24.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHour = hours % 12 || 12;
    return `${displayHour}:${String(minutes).padStart(2, '0')} ${period}`;
  };

  // Handle day click (edit shift hours)
  const handleDayClick = (day) => {
    const existingSchedule = schedules[selectedEmployee.employee_id]?.[day];

    if (existingSchedule) {
      const start = existingSchedule.start_time.substring(0, 5);
      const end = existingSchedule.end_time.substring(0, 5);
      setTempSchedule({ start, end });
    } else {
      setTempSchedule({ start: '09:00', end: '17:00' });
    }

    setEditingDay(day);
    setAddingBreak(null);
  };

  // Save schedule (shift hours)
  const handleSaveSchedule = async () => {
    if (!editingDay || !selectedEmployee) return;

    const employeeId = selectedEmployee.employee_id;
    const startTime24 = `${tempSchedule.start}:00`;
    const endTime24 = `${tempSchedule.end}:00`;

    const payload = {
      salon_id: user.salon_id,
      day: editingDay,
      start_time: startTime24,
      end_time: endTime24
    };

    try {
      const delRes = await fetch(
        `/api/employees/${employeeId}/schedule/${encodeURIComponent(editingDay)}`,
        { method: 'DELETE', credentials: 'include' }
      );

      if (!delRes.ok && delRes.status !== 404) {
        const delErr = await delRes.json().catch(() => ({}));
        throw new Error(delErr.error || `Failed to clear old schedule (${delRes.status})`);
      }

      const response = await fetch(`/api/employees/${employeeId}/schedule`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload)
      });

      const responseData = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(responseData.error || 'Failed to save schedule');
      }

      setSchedules(prev => ({
        ...prev,
        [employeeId]: {
          ...(prev[employeeId] || {}),
          [editingDay]: { start_time: startTime24, end_time: endTime24, is_active: true }
        }
      }));

      setEditingDay(null);
      await fetchEmployeeSchedule(employeeId);
      alert('Schedule saved successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to save schedule: ' + err.message);
    }
  };

  // Delete schedule for a day
  const handleDeleteSchedule = async (day) => {
    if (!selectedEmployee) return;
    if (!confirm(`Remove ${selectedEmployee.first_name}'s schedule for ${day}?`)) return;

    try {
      const response = await fetch(`/api/employees/${selectedEmployee.employee_id}/schedule/${day}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (!response.ok) throw new Error('Failed to delete schedule');

      setSchedules(prev => {
        const newSchedules = { ...prev };
        if (newSchedules[selectedEmployee.employee_id]) {
          delete newSchedules[selectedEmployee.employee_id][day];
        }
        return newSchedules;
      });

      await fetchEmployeeSchedule(selectedEmployee.employee_id);
      alert('Schedule removed successfully!');
    } catch (err) {
      alert('Failed to remove schedule: ' + err.message);
    }
  };

  // Handle adding a break
  const handleStartAddBreak = (day) => {
    setAddingBreak(day);
    setEditingDay(null);
    setTempBreak({ start: '12:00', end: '13:00' });
  };

  // Save a new break
  const handleSaveBreak = async () => {
    if (!addingBreak || !selectedEmployee) return;

    const employeeId = selectedEmployee.employee_id;
    const startTime24 = `${tempBreak.start}:00`;
    const endTime24 = `${tempBreak.end}:00`;

    const payload = {
      salon_id: user.salon_id,
      employee_id: employeeId,
      day: addingBreak,
      start_time: startTime24,
      end_time: endTime24,
      is_available: false
    };

    try {
      const response = await fetch(`/api/employees/${employeeId}/breaks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload)
      });

      const responseData = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(responseData.error || 'Failed to save break');
      }

      setAddingBreak(null);
      await fetchEmployeeSchedule(employeeId);
      alert('Break added successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to add break: ' + err.message);
    }
  };

  // Delete a break
  const handleDeleteBreak = async (day, slotId) => {
    if (!selectedEmployee) return;
    if (!confirm('Remove this break?')) return;

    try {
      const response = await fetch(
        `/api/employees/${selectedEmployee.employee_id}/breaks/${slotId}`,
        { method: 'DELETE', credentials: 'include' }
      );

      if (!response.ok) throw new Error('Failed to delete break');

      await fetchEmployeeSchedule(selectedEmployee.employee_id);
      alert('Break removed successfully!');
    } catch (err) {
      alert('Failed to remove break: ' + err.message);
    }
  };

  if (loading) return <div className="manage-schedule-page"><p>Loading employees...</p></div>;
  if (error) return <div className="manage-schedule-page"><p className="error">{error}</p></div>;

  return (
    <div className="manage-schedule-page">
      <h1>Manage Employee Schedules</h1>
      <p className="subtitle">Set weekly working hours and break times for your staff</p>

      <div className="schedule-layout">
        {/* Employee List */}
        <div className="employee-list">
          <h2>Select Employee</h2>
          {employees.map(emp => (
            <div
              key={emp.employee_id}
              className={`employee-card ${selectedEmployee?.employee_id === emp.employee_id ? 'selected' : ''}`}
              onClick={() => handleSelectEmployee(emp)}
            >
              <h3>{emp.first_name} {emp.last_name}</h3>
              <p>{emp.description}</p>
            </div>
          ))}
        </div>

        {/* Weekly Schedule */}
        <div className="schedule-container">
          {selectedEmployee ? (
            <>
              <h2>{selectedEmployee.first_name} {selectedEmployee.last_name}'s Weekly Schedule</h2>
              <div className="weekly-schedule">
                {daysOfWeek.map(day => {
                  const daySchedule = schedules[selectedEmployee.employee_id]?.[day];
                  const dayBreaks = breaks[selectedEmployee.employee_id]?.[day] || [];
                  const isEditing = editingDay === day;
                  const isAddingBreakForDay = addingBreak === day;

                  return (
                    <div key={day} className="day-card">
                      <div className="day-header">
                        <h3>{day}</h3>
                        {daySchedule && !isEditing && (
                          <button
                            className="delete-btn"
                            onClick={() => handleDeleteSchedule(day)}
                            title="Remove entire shift"
                          >
                            ×
                          </button>
                        )}
                      </div>

                      {/* Main Shift Hours */}
                      {isEditing ? (
                        <div className="time-editor">
                          <div className="time-section">
                            <label>Begins:</label>
                            <input
                              type="time"
                              value={tempSchedule.start}
                              onChange={(e) => setTempSchedule({ ...tempSchedule, start: e.target.value })}
                            />
                          </div>

                          <div className="time-section">
                            <label>Ends:</label>
                            <input
                              type="time"
                              value={tempSchedule.end}
                              onChange={(e) => setTempSchedule({ ...tempSchedule, end: e.target.value })}
                            />
                          </div>

                          <div className="editor-actions">
                            <button className="save-btn" onClick={handleSaveSchedule}>Save</button>
                            <button className="cancel-btn" onClick={() => setEditingDay(null)}>Cancel</button>
                          </div>
                        </div>
                      ) : daySchedule ? (
                        <div className="time-display" onClick={() => handleDayClick(day)}>
                          <p><strong>Shift:</strong> {formatTimeTo12Hour(daySchedule.start_time)} - {formatTimeTo12Hour(daySchedule.end_time)}</p>
                          <span className="edit-hint">Click to edit</span>
                        </div>
                      ) : (
                        <button className="set-hours-btn" onClick={() => handleDayClick(day)}>
                          Set Hours
                        </button>
                      )}

                      {/* Breaks Section */}
                      {daySchedule && !isEditing && (
                        <div className="breaks-section">
                          <div className="breaks-header">
                            <h4>Breaks / Blocked Times</h4>
                            {!isAddingBreakForDay && (
                              <button
                                className="add-break-btn"
                                onClick={() => handleStartAddBreak(day)}
                              >
                                + Add Break
                              </button>
                            )}
                          </div>

                          {/* Existing Breaks */}
                          {dayBreaks.length > 0 && (
                            <div className="breaks-list">
                              {dayBreaks.map((breakItem, idx) => (
                                <div key={idx} className="break-item">
                                  <span className="break-time">
                                    {formatTimeTo12Hour(breakItem.start_time)} - {formatTimeTo12Hour(breakItem.end_time)}
                                  </span>
                                  <button
                                    className="delete-break-btn"
                                    onClick={() => handleDeleteBreak(day, breakItem.slot_id)}
                                    title="Remove break"
                                  >
                                    ×
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Add Break Form */}
                          {isAddingBreakForDay && (
                            <div className="add-break-form">
                              <div className="break-time-inputs">
                                <div className="break-input-group">
                                  <label>Start:</label>
                                  <input
                                    type="time"
                                    value={tempBreak.start}
                                    onChange={(e) => setTempBreak({ ...tempBreak, start: e.target.value })}
                                  />
                                </div>
                                <div className="break-input-group">
                                  <label>End:</label>
                                  <input
                                    type="time"
                                    value={tempBreak.end}
                                    onChange={(e) => setTempBreak({ ...tempBreak, end: e.target.value })}
                                  />
                                </div>
                              </div>
                              <div className="break-actions">
                                <button className="save-btn" onClick={handleSaveBreak}>Save Break</button>
                                <button className="cancel-btn" onClick={() => setAddingBreak(null)}>Cancel</button>
                              </div>
                            </div>
                          )}

                          {dayBreaks.length === 0 && !isAddingBreakForDay && (
                            <p className="no-breaks">No breaks set</p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="no-selection">
              <p>Select an employee to manage their schedule</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ManageEmployeeSchedule;