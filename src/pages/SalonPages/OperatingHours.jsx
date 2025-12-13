import { useState, useEffect } from "react";
import { useUser } from "../../context/UserContext";
import "./OperatingHours.css";

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

function OperatingHours() {
  const { user } = useUser();
  const salonId = user.salon_id;  // ✅ Use salon_id with underscore
  
  const [hours, setHours] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!salonId) {
      setMessage("❌ Error: No salon ID found. Please log in as a salon owner.");
      return;
    }
    
    const initialHours = {};
    DAYS.forEach(day => {
      initialHours[day] = {
        isOpen: true,
        openTime: "09:00",
        closeTime: "17:00"
      };
    });
    setHours(initialHours);
    fetchOperatingHours();
  }, [salonId]);

  const fetchOperatingHours = async () => {
    if (!salonId) return;
    
    try {
      const response = await fetch(`/api/salon/${salonId}/operating-hours`, {
        credentials: "include"
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.hours && data.hours.length > 0) {
          const hoursMap = {};
          
          data.hours.forEach(item => {
            hoursMap[item.day] = {
              isOpen: !item.is_closed,
              openTime: item.open_time.substring(0, 5),
              closeTime: item.close_time.substring(0, 5)
            };
          });
          
          setHours(hoursMap);
        }
      }
    } catch (error) {
      console.error("Error fetching hours:", error);
    }
  };

  const handleToggle = (day) => {
    setHours(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        isOpen: !prev[day].isOpen
      }
    }));
  };

  const handleTimeChange = (day, field, value) => {
    setHours(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value
      }
    }));
  };

  const handleSave = async () => {
    if (!salonId) {
      setMessage("❌ Error: No salon ID found.");
      return;
    }
    
    // Validate times
    for (const day of DAYS) {
      if (hours[day]?.isOpen) {
        const open = hours[day].openTime;
        const close = hours[day].closeTime;
        
        if (open >= close) {
          setMessage(`❌ Error: ${day} closing time must be after opening time`);
          return;
        }
      }
    }

    setLoading(true);
    setMessage("");

    try {
      const operatingHours = DAYS.map(day => ({
        day,
        open_time: hours[day].openTime + ":00",
        close_time: hours[day].closeTime + ":00",
        is_closed: !hours[day].isOpen
      }));

      const response = await fetch(`/api/salon/${salonId}/operating-hours`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ hours: operatingHours })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("✅ Operating hours saved successfully!");
      } else {
        setMessage(`❌ Error: ${data.error}`);
      }
    } catch (error) {
      setMessage("❌ Network error. Please try again.");
      console.error("Error saving hours:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!salonId) {
    return (
      <div className="operating-hours-container">
        <h1>Operating Hours</h1>
        <p style={{color: 'red', textAlign: 'center'}}>You must be logged in as a salon owner to access this page.</p>
      </div>
    );
  }

  return (
    <div className="operating-hours-container">
      <h1>Salon Operating Hours</h1>
      <p className="subtitle">Set the days and times your salon is open</p>

      <div className="hours-grid">
        {DAYS.map(day => (
          <div key={day} className={`day-row ${!hours[day]?.isOpen ? 'closed' : ''}`}>
            <div className="day-checkbox">
              <input
                type="checkbox"
                id={`checkbox-${day}`}
                checked={hours[day]?.isOpen || false}
                onChange={() => handleToggle(day)}
              />
              <label htmlFor={`checkbox-${day}`}>{day}</label>
            </div>

            {hours[day]?.isOpen ? (
              <div className="time-inputs">
                <div className="time-group">
                  <label>Open:</label>
                  <input
                    type="time"
                    value={hours[day].openTime}
                    onChange={(e) => handleTimeChange(day, 'openTime', e.target.value)}
                  />
                </div>
                <span className="time-separator">—</span>
                <div className="time-group">
                  <label>Close:</label>
                  <input
                    type="time"
                    value={hours[day].closeTime}
                    onChange={(e) => handleTimeChange(day, 'closeTime', e.target.value)}
                  />
                </div>
              </div>
            ) : (
              <div className="closed-label">Closed</div>
            )}
          </div>
        ))}
      </div>

      {message && (
        <div className={`message ${message.includes('✅') ? 'success' : 'error'}`}>
          {message}
        </div>
      )}

      <button 
        className="save-button" 
        onClick={handleSave}
        disabled={loading}
      >
        {loading ? "Saving..." : "Save Operating Hours"}
      </button>
    </div>
  );
}

export default OperatingHours;