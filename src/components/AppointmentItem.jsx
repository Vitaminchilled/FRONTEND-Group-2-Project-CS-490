import React, { useState } from 'react';
import './AppointmentItem.css';

function AppointmentItem({
  accountType = 'owner',
  appointment,
  onCancel,
  onReschedule,
  onViewMore,
  onSendNote,
  selected
}) {
  const [isReplying, setIsReplying] = useState(false);
  const [replyText, setReplyText] = useState('');

  const canModify =
    accountType === 'owner' ||
    accountType === 'staff' ||
    accountType === 'admin';

  const formattedPrice =
    appointment?.price != null
      ? Number(appointment.price).toFixed(2)
      : '0.00';

  // ✅ Show customer name for business/staff/admin views, salon name for customer view
  const getPrimaryName = () => {
    const firstLast =
      `${appointment?.first_name || ''} ${appointment?.last_name || ''}`.trim();

    // Customer-facing pages: show salon name
    if (accountType === 'customer' || accountType === 'user') {
      return (
        appointment?.salon_name ||
        appointment?.salon ||
        'Salon'
      );
    }

    // Business-facing pages: show customer name
    return (
      appointment?.customer_name ||
      appointment?.customerName ||
      appointment?.client_name ||
      appointment?.clientName ||
      (firstLast ? firstLast : null) ||
      'Customer'
    );
  };

  const handleSendReply = () => {
    if (!replyText.trim()) return;
    onSendNote?.(appointment, replyText.trim());
    setReplyText('');
    setIsReplying(false);
  };

  return (
    <div className={`appointment-card ${selected ? 'selected' : ''}`}>
      {/* Top row with basic info */}
      <div className="appointment-main">
        <div className="appointment-left">
          <p className="appt-customer">{getPrimaryName()}</p>
          <p className="appt-datetime">
            {appointment?.appointment_date} – {appointment?.start_time}
          </p>
          <p className="appt-service">{appointment?.service_name}</p>
        </div>

        <div className="appointment-middle">
          <p className="appt-staff">{appointment?.staff_name}</p>
          <p className="appt-price">${formattedPrice}</p>
        </div>

        <div className="appointment-right">
          <button
            className="appt-btn appt-btn-cancel"
            onClick={() => onCancel?.(appointment)}
            disabled={!onCancel || appointment?.status === 'completed' || appointment?.status === 'cancelled'}
          >
            Cancel
          </button>
          <button
            className="appt-btn appt-btn-reschedule"
            onClick={() => onReschedule?.(appointment)}
            disabled={!onReschedule || appointment?.status === 'completed' || appointment?.status === 'cancelled'}
          >
            Reschedule
          </button>
          <button
            className="appt-btn appt-btn-view"
            onClick={() => onViewMore?.(appointment)}
            disabled={!onViewMore} //add thing to viewmore regardless??
          >
            View More
          </button>
        </div>
      </div>

      {/* Notes section */}
      <div className="appointment-notes">
        <p className="appt-notes-title">Customer Notes</p>

        <div className="appt-notes-box">
          {appointment?.customer_notes ? (
            <p className="appt-notes-text">
              {appointment.customer_notes}
            </p>
          ) : (
            <p className="appt-notes-empty">
              No notes have been added yet.
            </p>
          )}

          {!isReplying ? (
            <button
              className="appt-notes-reply-link"
              onClick={() => canModify && setIsReplying(true)}
              disabled={!canModify}
            >
              Reply or Send Note
            </button>
          ) : (
            <div className="appt-reply-area">
              <textarea
                className="appt-reply-input"
                placeholder="Write a note to the customer..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
              />
              <div className="appt-reply-actions">
                <button
                  className="appt-reply-send"
                  onClick={handleSendReply}
                  disabled={!replyText.trim()}
                >
                  Send
                </button>
                <button
                  className="appt-reply-cancel"
                  onClick={() => {
                    setReplyText('');
                    setIsReplying(false);
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AppointmentItem;