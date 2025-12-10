import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./CustomerRegistrationPart1.css";

function CustomerRegistrationPart1({ data, updateData, onBack }) {
  const navigate = useNavigate();
  const [personalMessage, setPersonalMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [registrationComplete, setRegistrationComplete] = useState(false);

  //Regex patterns for validation
  const basicRegex = /^[A-Za-z\s]{1,30}$/;
  const yearRegex = /^(19|20)\d{2}$/;
  const phoneRegex = /^\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}$/;

  const validatePersonal = () => {
    const required =
      data.firstName &&
      data.lastName &&
      data.yearOfBirth &&
      data.email &&
      data.retypeEmail &&
      data.phoneNumber &&
      data.gender;

    if (!required) {
      setPersonalMessage("Please fill all fields.");
      return false;
    }

    if (data.email !== data.retypeEmail) {
      setPersonalMessage("Emails do not match.");
      return false;
    }

    if (!basicRegex.test(data.firstName) || !basicRegex.test(data.lastName)) {
      setPersonalMessage("Names must only include letters and spaces.");
      return false;
    }

    if (!yearRegex.test(data.yearOfBirth)) {
      setPersonalMessage("Please enter a valid year of birth.");
      return false;
    }

    if (!phoneRegex.test(data.phoneNumber)) {
      setPersonalMessage("Please enter a valid phone number.");
      return false;
    }

    setPersonalMessage("");
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validatePersonal()) {
      return;
    }

    setIsLoading(true);
    setPersonalMessage("");

    try {
      const response = await fetch('/api/register/customer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          first_name: data.firstName,
          last_name: data.lastName,
          email: data.email,
          phone_number: data.phoneNumber,
          gender: data.gender,
          birth_year: data.yearOfBirth
        })
      });

      const responseData = await response.json();

      if (response.ok) {
        console.log("Registration success:", responseData);
        setRegistrationComplete(true);
      } else {
        console.error("Registration error:", responseData);
        setPersonalMessage(responseData.error || "Registration failed. Please try again.");
      }
    } catch (error) {
      console.error('Network error:', error);
      setPersonalMessage("Network error. Please make sure the backend server is running.");
    } finally {
      setIsLoading(false);
    }
  };

  const goBack = () => {
    setPersonalMessage("");
    onBack?.();
  };

  if (registrationComplete) {
    return (
      <div className="CustomerRegistrationBox">
        <div className="rightBox">
          <h2>Welcome, {data.username}!</h2>
          <p>You've successfully registered as a customer.</p>
          <div className="buttons">
            <button onClick={() => navigate('/login')}>Go to Login</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="CustomerRegistrationBox">
      <div className="leftBox">
        <h1>Welcome</h1>
        <h2>Booking Awaits!</h2>
        <h3>
          Start by logging in or<br />
          signing up to book, view<br />
          and manage appointments<br />
          with salons.
        </h3>
      </div>

      <div className="rightBox">
        <h1>Sign Up</h1>
        {personalMessage && (
          <p style={{ color: "red", textAlign: "center" }}>
            {personalMessage}
          </p>
        )}
        <form onSubmit={handleSubmit}>
          <label>First Name</label>
          <input
            type="text"
            placeholder="first name"
            value={data.firstName}
            onChange={(e) => updateData({ firstName: e.target.value })}
            disabled={isLoading}
          />

          <label>Last Name</label>
          <input
            type="text"
            placeholder="last name"
            value={data.lastName}
            onChange={(e) => updateData({ lastName: e.target.value })}
            disabled={isLoading}
          />

          <label>Email</label>
          <input
            type="email"
            placeholder="example@company.com"
            value={data.email}
            onChange={(e) => updateData({ email: e.target.value })}
            disabled={isLoading}
          />

          <label>Retype Email</label>
          <input
            type="email"
            placeholder="example@company.com"
            value={data.retypeEmail}
            onChange={(e) => updateData({ retypeEmail: e.target.value })}
            disabled={isLoading}
          />

          <label>Phone Number</label>
          <input
            type="tel"
            placeholder="(123) 456-7890"
            value={data.phoneNumber}
            onChange={(e) => updateData({ phoneNumber: e.target.value })}
            disabled={isLoading}
          />

          <label>Year of Birth</label>
          <input
            type="text"
            placeholder="YYYY"
            value={data.yearOfBirth}
            onChange={(e) => updateData({ yearOfBirth: e.target.value })}
            disabled={isLoading}
          />

          <label>Gender</label>
          <select
            value={data.gender}
            onChange={(e) => updateData({ gender: e.target.value })}
            disabled={isLoading}
          >
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>

          <div className="buttons">
            <button type="button" onClick={goBack} disabled={isLoading}>
              Back
            </button>
            <button type="submit" disabled={isLoading}>
              {isLoading ? "Loading..." : "Continue"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CustomerRegistrationPart1;