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
  const [editingDay, setEditingDay] = useState(null);
  const [tempSchedule, setTempSchedule] = useState({ start: '09:00', end: '17:00' });

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
      const response = await fetch(`/api/salon/${user.salon_id}/employees`);
      if (!response.ok) throw new Error('Failed to fetch employees');
      const data = await response.json();
      setEmployees(data.employees || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch employee schedule
  const fetchEmployeeSchedule = async (employeeId) => {
    try {
      const response = await fetch(`/api/employees/${employeeId}/schedule`);
      if (!response.ok) throw new Error('Failed to fetch schedule');
      const data = await response.json();
      
      console.log('Fetched schedule data:', data);
      
      // Convert schedule array to object keyed by day
      const scheduleByDay = {};
      data.forEach(slot => {
        scheduleByDay[slot.day] = {
          start_time: slot.start_time,
          end_time: slot.end_time,
          is_active: slot.is_active
        };
      });
      
      setSchedules(prev => ({ ...prev, [employeeId]: scheduleByDay }));
    } catch (err) {
      console.error('Error fetching schedule:', err);
      setSchedules(prev => ({ ...prev, [employeeId]: {} }));
    }
  };

  // Handle employee selection
  const handleSelectEmployee = (employee) => {
    setSelectedEmployee(employee);
    setEditingDay(null);
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

  // Handle day click
  const handleDayClick = (day) => {
    const existingSchedule = schedules[selectedEmployee.employee_id]?.[day];
    
    if (existingSchedule) {
      // Use existing times (already in HH:MM:SS format from database)
      const start = existingSchedule.start_time.substring(0, 5); // HH:MM
      const end = existingSchedule.end_time.substring(0, 5); // HH:MM
      
      setTempSchedule({ start, end });
    } else {
      setTempSchedule({ start: '09:00', end: '17:00' });
    }
    
    setEditingDay(day);
  };

  // Save schedule
  const handleSaveSchedule = async () => {
    if (!editingDay || !selectedEmployee) return;

    // Time inputs are already in 24-hour HH:MM format, just add seconds
    const startTime24 = `${tempSchedule.start}:00`;
    const endTime24 = `${tempSchedule.end}:00`;

    const payload = {
      salon_id: user.salon_id,
      day: editingDay,
      start_time: startTime24,
      end_time: endTime24
    };

    console.log('Saving schedule:', payload);

    try {
      const response = await fetch(`/api/employees/${selectedEmployee.employee_id}/schedule`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const responseData = await response.json();
      console.log('Response:', responseData);

      if (!response.ok) {
        throw new Error(responseData.error || 'Failed to save schedule');
      }

      // Update local state
      setSchedules(prev => ({
        ...prev,
        [selectedEmployee.employee_id]: {
          ...prev[selectedEmployee.employee_id],
          [editingDay]: {
            start_time: startTime24,
            end_time: endTime24,
            is_active: true
          }
        }
      }));

      setEditingDay(null);
      alert('Schedule saved successfully!');
    } catch (err) {
      console.error('Full error:', err);
      alert('Failed to save schedule: ' + err.message);
    }
  };

  // Delete schedule for a day
  const handleDeleteSchedule = async (day) => {
    if (!selectedEmployee) return;
    if (!confirm(`Remove ${selectedEmployee.first_name}'s schedule for ${day}?`)) return;

    try {
      const response = await fetch(`/api/employees/${selectedEmployee.employee_id}/schedule/${day}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Failed to delete schedule');

      // Update local state
      setSchedules(prev => {
        const newSchedules = { ...prev };
        if (newSchedules[selectedEmployee.employee_id]) {
          delete newSchedules[selectedEmployee.employee_id][day];
        }
        return newSchedules;
      });

      alert('Schedule removed successfully!');
    } catch (err) {
      alert('Failed to remove schedule: ' + err.message);
    }
  };

  if (loading) return <div className="manage-schedule-page"><p>Loading employees...</p></div>;
  if (error) return <div className="manage-schedule-page"><p className="error">{error}</p></div>;

  return (
    <div className="manage-schedule-page">
      <h1>Manage Employee Schedules</h1>
      <p className="subtitle">Set weekly working hours for your staff</p>

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
                  const isEditing = editingDay === day;

                  return (
                    <div key={day} className="day-card">
                      <div className="day-header">
                        <h3>{day}</h3>
                        {daySchedule && !isEditing && (
                          <button
                            className="delete-btn"
                            onClick={() => handleDeleteSchedule(day)}
                          >
                            ×
                          </button>
                        )}
                      </div>

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

                          <div className="edit-actions">
                            <button className="save-btn" onClick={handleSaveSchedule}>Save</button>
                            <button className="cancel-btn" onClick={() => setEditingDay(null)}>Cancel</button>
                          </div>
                        </div>
                      ) : daySchedule ? (
                        <div className="time-display" onClick={() => handleDayClick(day)}>
                          <p>{formatTimeTo12Hour(daySchedule.start_time)} - {formatTimeTo12Hour(daySchedule.end_time)}</p>
                          <span className="edit-hint">Click to edit</span>
                        </div>
                      ) : (
                        <button className="set-hours-btn" onClick={() => handleDayClick(day)}>
                          Set Hours
                        </button>
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