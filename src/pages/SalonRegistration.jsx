import { useState } from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "../components/NavBar";
import SalonRegistrationPart1 from "./SalonRegistrationPart1";
import SalonRegistrationPart2 from "./SalonRegistrationPart2";
import "./SalonRegistration.css";

function SalonRegistration() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const usernameAndPasswordRegex = /^(?=.{8,20}$)(?![_.])(?!.*[_.]{2})[a-zA-Z0-9._]+(?<![_.])$/;
  
  const [newSalon, setNewSalon] = useState({
    username: "",
    password: "",
    retypePassword: "",
    firstName: "",
    lastName: "",
    yearOfBirth: "",
    personalEmail: "",
    retypePersonalEmail: "",
    phoneNumber: "",
    gender: "",
    businessName: "",
    description: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    country: "",
    companyEmail: "",
    retypeCompanyEmail: "",
    companyPhone: "",
    category: ""
  });

  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const updateData = (newData) => {
    setNewSalon((prev) => ({ ...prev, ...newData }));
  };

  const handlePart2Submit = async () => {
    setIsLoading(true);
    setMessage("");

    try {
      const response = await fetch('/api/salon-registration/part2', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          services: newSalon.services || [],
          employees: newSalon.employees || []
        })
      });

      const data = await response.json();

      if (response.ok) {
        console.log("Services/Employees added:", data);
        alert("Salon registered successfully! Please log in.");
        navigate('/login');
      } else {
        console.error("Part 2 error:", data);
        alert("Error: " + (data.error || "Failed to add services/employees. Please try again."));
        setMessage(data.error || "Failed to add services/employees. Please try again.");
      }
    } catch (error) {
      console.error('Network error:', error);
      alert("Network error. Please make sure the backend server is running.");
      setMessage("Network error. Please make sure the backend server is running.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!newSalon.username || !newSalon.password || !newSalon.retypePassword) {
      setMessage("Please complete all fields.");
      return;
    }

    if (!usernameAndPasswordRegex.test(newSalon.username)) {
      setMessage("Username not valid. Must be 8-20 characters, only letters, numbers, dots and underscores.");
      return;
    }

    if (!usernameAndPasswordRegex.test(newSalon.password)) {
      setMessage("Password not valid. Must be 8-20 characters, only letters, numbers, dots and underscores.");
      return;
    }

    if (newSalon.password !== newSalon.retypePassword) {
      setMessage("Passwords do not match.");
      return;
    }

    setIsLoading(true);
    setMessage("");

    try {
      const response = await fetch('/api/register/page', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          username: newSalon.username,
          password: newSalon.password,
          password_confirm: newSalon.retypePassword
        })
      });

      const data = await response.json();

      if (response.ok) {
        console.log("Step 1 success:", data);
        setMessage("");
        setCurrentStep(1);
      } else {
        setMessage(data.error || "Registration failed. Please try again.");
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage("Network error. Please make sure the backend server is running.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFinalSubmit = async () => {
    setIsLoading(true);
    setMessage("");

    try {
      const master_tag_ids = [1];

      const response = await fetch('/api/register/salon', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          first_name: newSalon.firstName,
          last_name: newSalon.lastName,
          personal_email: newSalon.personalEmail,
          personal_email_confirm: newSalon.retypePersonalEmail,
          birth_year: newSalon.yearOfBirth,
          phone_number: newSalon.phoneNumber,
          gender: newSalon.gender,
          salon_name: newSalon.businessName,
          description: newSalon.description || "A wonderful salon",
          salon_email: newSalon.companyEmail,
          salon_email_confirm: newSalon.retypeCompanyEmail,
          salon_phone_number: newSalon.companyPhone,
          salon_address: newSalon.address,
          salon_city: newSalon.city,
          salon_state: newSalon.state,
          salon_postal_code: newSalon.zip,
          salon_country: newSalon.country,
          master_tag_ids: master_tag_ids
        })
      });

      const data = await response.json();

      if (response.ok) {
        console.log("Registration success:", data);
        setMessage("");
        setCurrentStep(2);
      } else {
        console.error("Registration error:", data);
        alert("Error: " + (data.error || "Registration failed. Please try again."));
        setMessage(data.error || "Registration failed. Please try again.");
      }
    } catch (error) {
      console.error('Network error:', error);
      alert("Network error. Please make sure the backend server is running.");
      setMessage("Network error. Please make sure the backend server is running.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <NavBar />
      {currentStep === 0 ? (
        <div className="SalonRegistrationBox">
          <div className="leftBox">
            <h1>Welcome</h1>
            <h2>Register Your Salon</h2>
            <h3>
              Start with signing up with <br />
              your salons preferred <br />
              username and password
            </h3>
          </div>

          <div className="rightBox">
            <h1>Register</h1>
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                placeholder="username"
                value={newSalon.username}
                onChange={(e) => setNewSalon({ ...newSalon, username: e.target.value })}
                disabled={isLoading}
              />

              <input
                type="password"
                placeholder="password"
                value={newSalon.password}
                onChange={(e) => setNewSalon({ ...newSalon, password: e.target.value })}
                disabled={isLoading}
              />

              <input
                type="password"
                placeholder="Retype Password"
                value={newSalon.retypePassword}
                onChange={(e) => setNewSalon({ ...newSalon, retypePassword: e.target.value })}
                disabled={isLoading}
              />

              {message && <p style={{ color: 'red', textAlign: 'center' }}>{message}</p>}

              <div className="formButtons">
                <button
                  type="submit"
                  className="nextButton"
                >
                  Continue
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : currentStep === 1 ? (
        <SalonRegistrationPart1
          data={newSalon}
          updateData={updateData}
          onBack={() => setCurrentStep(0)}
          onNext={handleFinalSubmit}
          isLoading={isLoading}
        />
      ) : (
        <SalonRegistrationPart2
          data={newSalon}
          updateData={updateData}
          onBack={() => setCurrentStep(1)}
          onNext={handlePart2Submit}
          isLoading={isLoading}
        />
      )}
    </>
  );
}

export default SalonRegistration;