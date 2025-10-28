import { useEffect, useState } from "react";
import MenuBox from '../components/MenuBox.jsx';
import './Verify.css'

function Verify() {
  const [salons, setSalons] = useState([]);
  const [owner, setOwner] = useState([]);
  
  useEffect(() => {
    const fetchSalons = async() => {
    try {
        const response = await fetch(`/api/salonsToVerify`);
        if (!response.ok) {
          throw new Error(`Response status: ${response.status}`);
        }
        const result = await response.json();
        setSalons(result.salons);
        console.log(salons);
      } catch (error) {
        console.error(error.message);
      }
    }
    fetchSalons();
  }, []);

  return (
    <div className='Verify'>
      <h1>Verify</h1>
      <hr />

      <div className="VerifyGrid">
        {salons.map((salon, index) => (
          <MenuBox title={salon.name} key={index}>
            <p>{salon.email}<br />
            {salon.phone_number}<br />
            1 Street St, City, State</ p>
            <p>{salon.first_name} {salon.last_name}(Owner)<br />
            {salon.email}<br />
            {salon.phone_number}<br />
            {salon.birth_year}<br />
            Created on: {salon.created_at}</p>
          </MenuBox>
        ))}
        
      </div>
    </div>
  );
}

export default Verify
