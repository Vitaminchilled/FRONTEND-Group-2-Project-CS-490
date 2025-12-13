import { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import './SendNotifications.css';

function SendNotifications() {
  const { user } = useUser();
  const salonId = user.salon_id;

  const [activeTab, setActiveTab] = useState('loyal'); // 'loyal' or 'search'
  const [loyalCustomers, setLoyalCustomers] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomers, setSelectedCustomers] = useState([]);
  
  // Form state
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
    console.log('🏪 Component mounted');
    console.log('👤 User object:', user);
    console.log('🆔 Salon ID:', salonId);
    
    if (salonId) {
      fetchLoyalCustomers();
    } else {
      console.warn('⚠️ No salon ID found!');
    }
  }, [salonId]);

  const fetchLoyalCustomers = async () => {
    console.log('🔍 Fetching loyal customers for salon:', salonId);
    
    try {
      const url = `/api/salon/${salonId}/customers/loyal`;
      console.log('📡 API URL:', url);
      
      const response = await fetch(url, {
        credentials: 'include'
      });
      
      console.log('📥 Response status:', response.status);
      console.log('📥 Response OK:', response.ok);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Data received:', data);
        console.log('👥 Loyal customers:', data.loyal_customers);
        console.log('📊 Customer count:', data.loyal_customers?.length);
        setLoyalCustomers(data.loyal_customers);
      } else {
        const errorText = await response.text();
        console.error('❌ Error response:', errorText);
      }
    } catch (error) {
      console.error('❌ Fetch error:', error);
    }
  };

  const handleSearch = async () => {
    if (searchTerm.length < 2) {
      setStatusMessage('Please enter at least 2 characters to search');
      return;
    }

    console.log('🔍 Searching for:', searchTerm);

    try {
      const url = `/api/salon/${salonId}/customers/search?q=${encodeURIComponent(searchTerm)}`;
      console.log('📡 Search URL:', url);
      
      const response = await fetch(url, {
        credentials: 'include'
      });
      
      console.log('📥 Search response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Search results:', data);
        console.log('👥 Customers found:', data.customers?.length);
        setSearchResults(data.customers);
        if (data.customers.length === 0) {
          setStatusMessage('No customers found matching your search');
        }
      } else {
        const errorText = await response.text();
        console.error('❌ Search error:', errorText);
      }
    } catch (error) {
      console.error('❌ Search error:', error);
      setStatusMessage('Error searching customers. Please try again.');
    }
  };

  const toggleCustomer = (customerId) => {
    setSelectedCustomers(prev => {
      if (prev.includes(customerId)) {
        return prev.filter(id => id !== customerId);
      } else {
        return [...prev, customerId];
      }
    });
  };

  const selectAllLoyal = () => {
    const allIds = loyalCustomers.map(c => c.user_id);
    setSelectedCustomers(allIds);
  };

  const clearSelection = () => {
    setSelectedCustomers([]);
  };

  const handleSendNotification = async () => {
    if (selectedCustomers.length === 0) {
      setStatusMessage('Please select at least one customer');
      return;
    }

    if (!title.trim() || !message.trim()) {
      setStatusMessage('Please provide both a title and message');
      return;
    }

    setLoading(true);
    setStatusMessage('');

    try {
      const response = await fetch(`/api/salon/${salonId}/notifications/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          recipient_ids: selectedCustomers,
          type: 'message',
          title: title.trim(),
          message: message.trim(),
          promo_code: null
        })
      });

      const data = await response.json();

      if (response.ok) {
        setStatusMessage(`Successfully sent notification to ${selectedCustomers.length} customer${selectedCustomers.length !== 1 ? 's' : ''}!`);
        clearSelection();
        setTitle('');
        setMessage('');
      } else {
        setStatusMessage(`Error: ${data.error || 'Failed to send notification'}`);
      }
    } catch (error) {
      setStatusMessage('Network error. Please try again.');
      console.error('Error sending notification:', error);
    } finally {
      setLoading(false);
    }
  };

  const currentCustomers = activeTab === 'loyal' ? loyalCustomers : searchResults;

  if (!salonId) {
    return (
      <div className="send-notifications-container">
        <div className="page-header">
          <h1>Send Notifications</h1>
          <p className="page-subtitle">Notify your loyal customers about in-store promotions and updates</p>
        </div>
        <p style={{color: '#e74c3c', textAlign: 'center', marginTop: '40px'}}>You must be logged in as a salon owner to access this page.</p>
      </div>
    );
  }

  return (
    <div className="send-notifications-container">
      <div className="page-header">
        <h1>Send Notifications</h1>
        <p className="page-subtitle">Notify your loyal customers about in-store promotions and updates</p>
      </div>
      
      {/* Tab Selection */}
      <div className="notification-tabs">
        <button
          className={`tab-button ${activeTab === 'loyal' ? 'active' : ''}`}
          onClick={() => setActiveTab('loyal')}
        >
          <span className="tab-label">Loyalty Program</span>
          <span className="tab-count">{loyalCustomers.length}</span>
        </button>
        <button
          className={`tab-button ${activeTab === 'search' ? 'active' : ''}`}
          onClick={() => setActiveTab('search')}
        >
          <span className="tab-label">Search Customers</span>
        </button>
      </div>

      {/* Search Bar (only for search tab) */}
      {activeTab === 'search' && (
        <div className="search-section">
          <input
            type="text"
            placeholder="Search by name or username..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button className="search-button" onClick={handleSearch}>Search</button>
        </div>
      )}

      {/* Customer List */}
      <div className="customer-section">
        <div className="customer-header">
          <div className="header-left">
            <h3>{activeTab === 'loyal' ? 'Loyalty Program Members' : 'Search Results'}</h3>
            <p className="header-subtitle">
              {activeTab === 'loyal' 
                ? 'Customers with 3 or more appointments' 
                : 'Select customers to notify'}
            </p>
          </div>
          <div className="customer-actions">
            {activeTab === 'loyal' && loyalCustomers.length > 0 && (
              <button className="btn-secondary" onClick={selectAllLoyal}>
                Select All
              </button>
            )}
            {selectedCustomers.length > 0 && (
              <button className="btn-secondary btn-clear" onClick={clearSelection}>
                Clear
              </button>
            )}
          </div>
        </div>

        <div className="customer-list">
          {currentCustomers.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
              </div>
              <p>
                {activeTab === 'loyal' 
                  ? 'No loyalty program members yet. Customers with 3+ appointments will appear here automatically.' 
                  : 'No results found. Try searching for a customer name or username.'}
              </p>
            </div>
          ) : (
            currentCustomers.map(customer => (
              <div
                key={customer.user_id}
                className={`customer-item ${selectedCustomers.includes(customer.user_id) ? 'selected' : ''}`}
                onClick={() => toggleCustomer(customer.user_id)}
              >
                <div className="customer-checkbox">
                  <input
                    type="checkbox"
                    checked={selectedCustomers.includes(customer.user_id)}
                    onChange={() => toggleCustomer(customer.user_id)}
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
                <div className="customer-info">
                  <div className="customer-name">{customer.name}</div>
                  <div className="customer-stats">
                    @{customer.username} • {customer.appointment_count} appointment{customer.appointment_count !== 1 ? 's' : ''}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {selectedCustomers.length > 0 && (
          <div className="selection-summary">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            <span>
              {selectedCustomers.length} customer{selectedCustomers.length !== 1 ? 's' : ''} selected
            </span>
          </div>
        )}
      </div>

      {/* Notification Form */}
      <div className="notification-form">
        <h3>Message Details</h3>
        <p className="form-subtitle">Compose your notification for in-store promotions or updates</p>

        <div className="form-group">
          <label htmlFor="notification-title">Title</label>
          <input
            id="notification-title"
            type="text"
            placeholder="e.g., Special Weekend Promotion"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={100}
          />
          <span className="char-count">{title.length}/100</span>
        </div>

        <div className="form-group">
          <label htmlFor="notification-message">Message</label>
          <textarea
            id="notification-message"
            placeholder="Enter your message here... Let customers know about your in-store deals, special hours, or other important updates."
            rows="5"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            maxLength={500}
          />
          <span className="char-count">{message.length}/500</span>
        </div>

        {/* Preview */}
        {(title || message) && (
          <div className="notification-preview">
            <h4>Preview</h4>
            <div className="preview-card">
              <div className="preview-header">
                <div className="preview-salon">Your Salon</div>
              </div>
              <div className="preview-content">
                <div className="preview-title">{title || 'Your title here'}</div>
                <div className="preview-message">{message || 'Your message here'}</div>
                <div className="preview-time">Just now</div>
              </div>
            </div>
          </div>
        )}

        {/* Status Message */}
        {statusMessage && (
          <div className={`status-message ${statusMessage.includes('Successfully') ? 'success' : 'error'}`}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {statusMessage.includes('Successfully') ? (
                <polyline points="20 6 9 17 4 12"></polyline>
              ) : (
                <>
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </>
              )}
            </svg>
            <span>{statusMessage}</span>
          </div>
        )}

        {/* Send Button */}
        <button
          className="btn-send"
          onClick={handleSendNotification}
          disabled={loading || selectedCustomers.length === 0 || !title.trim() || !message.trim()}
        >
          {loading ? (
            <>
              <span className="spinner"></span>
              Sending...
            </>
          ) : (
            <>
              Send to {selectedCustomers.length} Customer{selectedCustomers.length !== 1 ? 's' : ''}
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export default SendNotifications;