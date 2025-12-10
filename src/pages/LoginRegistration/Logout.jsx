import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';

function Logout() {
  const navigate = useNavigate();
  const { setUser } = useUser();

  useEffect(() => {
    const handleLogout = async () => {
      try {
        // Call backend logout
        await fetch('/api/logout', {
          method: 'POST',
          credentials: 'include'
        });
      } catch (error) {
        console.error('Logout error:', error);
      } finally {
        // CRITICAL: Reset user state to default
        setUser({ 
          type: 'none',
          name: '',
          salon_id: null,
          is_verified: null
        });
        
        // Navigate to login
        navigate('/login');
      }
    };

    handleLogout();
  }, [navigate, setUser]);

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh' 
    }}>
      <p>Logging out...</p>
    </div>
  );
}

export default Logout;