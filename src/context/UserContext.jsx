import React, { createContext, useContext, useEffect, useState } from 'react'

const UserContext = createContext();

export function UserProvider({ children }){
  const [user, setUser] = useState({ type: 'none', name: null, username: null, salon_id: null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/auth/status', { credentials: 'include' });
        const data = await res.json();
        if (data.authenticated) {
          const displayName = data.first_name || data.username || 'Customer';
          const role = data.role || 'customer';
          setUser({
            type: role,
            name: displayName,
            username: data.username || null,
            salon_id: data.salon_id || null
          });
        } else {
          setUser({ type: 'none', name: null, username: null, salon_id: null });
        }
      } catch {
        setUser({ type: 'none', name: null, username: null, salon_id: null });
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const login = (displayName, role='customer', uname=null, salonId=null) => {
    setUser({ type: role, name: displayName, username: uname, salon_id: salonId });
  };

  const logout = async () => {
    try { await fetch('/api/logout', { method: 'POST', credentials: 'include' }); } catch {}
    setUser({ type: 'none', name: null, username: null, salon_id: null });
  };

  return (
    <UserContext.Provider value={{ user, setUser, login, logout, loading }}>
      {children}
    </UserContext.Provider>
  );
};

export function useUser(){
  return useContext(UserContext);
}
