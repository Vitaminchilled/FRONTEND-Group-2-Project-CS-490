const originalFetch = window.fetch;
window.fetch = function(url, options) {
  if (typeof url === 'string' && url.startsWith('/api/')) {
    const baseUrl = import.meta.env.VITE_API_URL || '';
    url = baseUrl + url;
  }
  return originalFetch(url, options);
};

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { UserProvider } from './context/UserContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <UserProvider>
        {/* Main Application built in App */}
        <App />
      </UserProvider>
    </BrowserRouter>
  </StrictMode>,
)
