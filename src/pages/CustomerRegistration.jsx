import { useState } from "react";
import CustomerRegistrationPart1 from "./CustomerRegistrationPart1";
import "./CustomerRegistration.css";

function CustomerRegistration() {
  const [currentStep, setCurrentStep] = useState(0);
  const [newCustomer, setNewCustomer] = useState({
    username: "",
    password: "",
    retypePassword: "",
    firstName: "",
    lastName: "",
    yearOfBirth: "",
    email: "",
    retypeEmail: "",
    phoneNumber: "",
    gender: ""
  });

  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const usernameAndPasswordRegex = /^(?=.{8,20}$)(?![_.])(?!.*[_.]{2})[a-zA-Z0-9._]+(?<![_.])$/; //8-20 chars, can't start or end with _/. 


  const updateData = (newData) => {
    setNewCustomer((prev) => ({ ...prev, ...newData }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if(!usernameAndPasswordRegex.test(newCustomer.username)){
        setMessage("Username not valid. Must be 8-20 characters, only letters, numbers, dots and underscores.");
        return;
    }

    if(!usernameAndPasswordRegex.test(newCustomer.password)){
        setMessage("Password not valid. Must be 8-20 characters, only letters, numbers, dots and underscores.");
        return;
    }


    if(!newCustomer.username || !newCustomer.password || !newCustomer.retypePassword){
        setMessage("Please complete all fields.");
        return;
    }

    if (newCustomer.password !== newCustomer.retypePassword){
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
          username: newCustomer.username,
          password: newCustomer.password,
          password_confirm: newCustomer.retypePassword
        })
      });

      const data = await response.json();

      if (response.ok) {
        console.log("Step 1 success:", data);
        setMessage("");
        setCurrentStep(1);
      } else {
        setMessage(data.error || "Error. Try again.");
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage("Network error.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {currentStep === 0 ? (
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
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                placeholder="username"
                value={newCustomer.username}
                onChange={(e) => setNewCustomer({ ...newCustomer, username: e.target.value })}
                disabled={isLoading}
              />

              <input
                type="password"
                placeholder="password"
                value={newCustomer.password}
                onChange={(e) => setNewCustomer({ ...newCustomer, password: e.target.value })}
                disabled={isLoading}
              />

              <input
                type="password"
                placeholder="Retype Password"
                value={newCustomer.retypePassword}
                onChange={(e) => setNewCustomer({ ...newCustomer, retypePassword: e.target.value })}
                disabled={isLoading}
              />

              {message && <p style={{ color: "red", textAlign: "center" }}>{message}</p>}

              <div className="buttons">
                <button type="submit" disabled={isLoading}>
                  {isLoading ? "Loading..." : "Continue"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : (
        <CustomerRegistrationPart1
          data={newCustomer}
          updateData={updateData}
          onBack={() => setCurrentStep(0)}
        />
      )}
    </>
  );
}

export default CustomerRegistration;