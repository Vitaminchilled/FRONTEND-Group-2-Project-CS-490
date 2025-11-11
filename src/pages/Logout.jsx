import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';

export default function Logout(){
  const { logout } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      await logout();
      navigate('/');
    })();
  }, [logout, navigate]);

  return null;
}
