import AppointmentItem from '../components/AppointmentItem'
import './AccountDetails.css'

function AccountDetails() {

  const booked_appointment = {
    salon_name: 'Awesome Hair Salon',
    appointment_date: 'October 5th, 2025',
    appointment_time: '5:00 pm',
    service_name: 'Haircut',
    service_price: '40.00',
    employee_name: 'Jane Doe',
    loyalty_pts: 40,
    status: 'booked'
  }

  const completed_appointment = {
    salon_name: 'Awesome Hair Salon',
    appointment_date: 'October 5th, 2025',
    appointment_time: '5:00 pm',
    service_name: 'Haircut',
    service_price: '40.00',
    employee_name: 'Jane Doe',
    loyalty_pts: 40,
    status: 'completed'
  }

  return (
    <div>
        <br></br>
        <br></br>
        <br></br>
        <div className="upcoming-section">
          <AppointmentItem
            appointment={booked_appointment}
          />
          <AppointmentItem
            appointment={completed_appointment}
          />
        </div>
        <div className="appointment-item booked">
          <div className="grid-layout">
            <h3 className="salon-name">Awesome Hair Salon</h3>
            <p className="appointment-date">October 5th, 2025</p>
            <p className="appointment-time">5:00 pm</p>
            <p className="service-name">Haircut</p>
            <p className="employee-name">Jane Doe</p>
            <p className="service-price">$40.00</p>
            <div className="appt-interact">
              <button className="appt-btn">Cancel</button>
              <button className="appt-btn">Notes v</button>
              <button className="appt-btn">Reschedule</button>
            </div>
          </div>
        </div>
        <div className="appointment-item completed">
          <div className="grid-layout">
            <h3 className="salon-name">Awesome Hair Salon</h3>
            <p className="appointment-date">October 5th, 2025</p>
            <p className="appointment-time">5:00 pm</p>
            <p className="service-name">Haircut</p>
            <p className="employee-name">Jane Doe</p>
            <p className="service-price">$40.00</p>
            <p className="loyalty-earned">40 loyalty points</p>
          </div>
        </div>


    </div>
  )
}

export default AccountDetails