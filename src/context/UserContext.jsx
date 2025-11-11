import React, { createContext, useContext, useState } from 'react'

const UserContext = createContext();

export function UserProvider({ children }){
    const [user, setUser] = useState({
        type: 'owner', //none, customer, owner, admin
        name: 'John Doe'
    });
    return (
        <UserContext.Provider value={{user, setUser}}>
            {children}
        </UserContext.Provider>
    );
};

export function useUser(){
    return useContext(UserContext);
}