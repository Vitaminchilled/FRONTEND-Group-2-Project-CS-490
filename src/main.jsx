import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { UserProvider } from './context/UserContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      {/* Creates a Single User that all children can access */}
      <UserProvider>
        {/* Main Application built in App */}
        <App />
      </UserProvider>
    </BrowserRouter>
  </StrictMode>,
)
