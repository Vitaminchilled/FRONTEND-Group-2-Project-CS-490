import { useState } from "react";
import "./CustomerRegistrationPart1.css";

function CustomerRegistrationPart1({ data, updateData, onBack }) {
  const [personalMessage, setPersonalMessage] = useState("");

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
      data.phoneNumber;

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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validatePersonal()) {
      alert("Customer registered successfully!");
    }
  };

  const goBack = () => {
    setPersonalMessage("");
    onBack?.();
  };

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
          />

          <label>Last Name</label>
          <input
            type="text"
            placeholder="last name"
            value={data.lastName}
            onChange={(e) => updateData({ lastName: e.target.value })}
          />

          <label>Email</label>
          <input
            type="email"
            placeholder="example@company.com"
            value={data.email}
            onChange={(e) => updateData({ email: e.target.value })}
          />

          <label>Retype Email</label>
          <input
            type="email"
            placeholder="example@company.com"
            value={data.retypeEmail}
            onChange={(e) => updateData({ retypeEmail: e.target.value })}
          />

          <label>Phone Number</label>
          <input
            type="tel"
            placeholder="(123) 456-7890"
            value={data.phoneNumber}
            onChange={(e) => updateData({ phoneNumber: e.target.value })}
          />

          <label>Year of Birth</label>
          <input
            type="text"
            placeholder="YYYY"
            value={data.yearOfBirth}
            onChange={(e) => updateData({ yearOfBirth: e.target.value })}
          />

          <div className="buttons">
            <button type="button" onClick={goBack}>
              Back
            </button>
            <button type="submit">Continue</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CustomerRegistrationPart1;
