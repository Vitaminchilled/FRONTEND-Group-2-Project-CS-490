import { useEffect, useState } from "react";
import MenuBox from '../components/MenuBox.jsx';
import './Users.css'

function Users() {
  const [users, setUsers] = useState([]);
  
  useEffect(() => {
    const fetchUsers = async() => {
    try {
        const response = await fetch(`/api/allUsers`);
        if (!response.ok) {
          throw new Error(`Response status: ${response.status}`);
        }
        const result = await response.json();
        setUsers(result.users);
      } catch (error) {
        console.error(error.message);
      }
    }
    fetchUsers();
  }, []);

  return (
    <div className='Users'>
      <h1>Users</h1>
      <hr />

      <div className="UsersGrid">
        {users.map((user, index) => (
          <MenuBox title={user.username} key={index} showView={false} showReject={false} showVerify={false} showDelete={true}>
            <p>{user.first_name} (First)<br />
            {user.last_name} (Last)<br />
            Role: {user.role}</ p>
            <p>{user.email}<br />
            {user.phone_number}<br />
            {user.gender}<br />
            {user.birth_year}<br />
            Last logged in:{user.last_login}<br />
            Created: {user.created_at}</p>
          </MenuBox>
        ))}
        
      </div>
    </div>
  );
}

export default Users
