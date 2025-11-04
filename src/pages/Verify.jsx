import { useEffect, useState } from "react";
import MenuBox from '../components/MenuBox.jsx';
import './Verify.css'

function Verify() {
  const [salons, setSalons] = useState([]);
  
  useEffect(() => {
    const fetchSalons = async() => {
    try {
        const response = await fetch(`/api/admin/salonsToVerify`);
        if (!response.ok) {
          throw new Error(`Response status: ${response.status}`);
        }
        const result = await response.json();
        setSalons(result.salons);
      } catch (error) {
        console.error(error.message);
      }
    }
    fetchSalons();
  }, []);

  const handleSalonChange = (salon_id) => {
    setSalons((prev) => prev.filter((s) => s.salon_id !== salon_id));
  };

  return (
    <div className='Verify'>
      <h1>Verify</h1>
      <hr />

      <div className="VerifyGrid">
        {salons.map((salon, index) => (
          <MenuBox title={salon.name} key={index} data={salon} onDataChange={handleSalonChange}>
            <p>{salon.email}<br />
            {salon.phone_number}<br />
            {salon.address}<br />
            {salon.city}, {salon.state}, {salon.postal_code}, {salon.country}</ p>
            <p>{salon.owner_first_name} {salon.owner_last_name}(Owner)<br />
            {salon.owner_email}<br />
            {salon.owner_phone_number}<br />
            {salon.owner_birth_year}</p>
          </MenuBox>
        ))}
        
      </div>
    </div>
  );
}

export default Verify
