import React, { createContext, useContext, useEffect, useState } from 'react'

const UserContext = createContext();

export function UserProvider({ children }){
  const [user, setUser] = useState({ 
    type: 'none',
    name: null, 
    username: null, 
    user_id: null,
    salon_id: null,
    is_verified: null 
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/auth/status', { 
          credentials: 'include' 
        });
        const data = await res.json();
        if (data.authenticated) {
          const displayName = data.first_name || data.username || 'Customer';
          const role = data.role || 'customer';
          setUser({
            type: role,
            name: displayName,
            username: data.username || null,
            user_id: data.user_id,
            salon_id: data.salon_id || null,
            is_verified: data.is_verified || null
          });
        } else {
          setUser({ 
            type: 'none', 
            name: null, 
            username: null, 
            user_id: null,
            salon_id: null, 
            is_verified: null 
          });
        }
      } catch (err) {
        console.error("Failed to fetch auth status: ", err)
        setUser({ 
          type: 'none', 
          name: null, 
          username: null, 
          user_id: null,
          salon_id: null, 
          is_verified: null 
        });
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const login = (displayName, role = 'customer', uname = null, userId = null, salonId = null, isVerified = null) => {
    setUser({ 
      type: role, 
      name: displayName, 
      username: uname,
      user_id: userId, 
      salon_id: salonId,
      is_verified: isVerified
    });
  };

  const logout = async () => {
    try {
      await fetch('/api/logout', { method: 'POST', credentials: 'include' });
    } catch {}
    setUser({ 
      type: 'none', 
      name: null, 
      username: null, 
      user_id: null,
      salon_id: null, 
      is_verified: null 
    });
  };

  return (
    <UserContext.Provider value={{ user, setUser, login, logout, loading }}>
      {loading ? (
        <div>Loading...</div> 
      ) : (
        children
      )}
    </UserContext.Provider>
  );
};

export function useUser(){
  return useContext(UserContext);
}