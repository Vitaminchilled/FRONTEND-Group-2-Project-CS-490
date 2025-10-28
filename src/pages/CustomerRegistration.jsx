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
  });

  const [message, setMessage] = useState("");
  const usernameAndPasswordRegex = /^(?=.{8,20}$)(?![_.])(?!.*[_.]{2})[a-zA-Z0-9._]+(?<![_.])$/; //8-20 chars, can't start or end with _/. 


  const updateData = (newData) => {
    setNewCustomer((prev) => ({ ...prev, ...newData }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if(!usernameAndPasswordRegex.test(newCustomer.username)){
        setMessage("Username not valid, please try again.");
        return;
    }

    if(!usernameAndPasswordRegex.test(newCustomer.password)){
        setMessage("Password not valid, please try again.");
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

    setCurrentStep(1);
    setMessage("");
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
              />

              <input
                type="password"
                placeholder="password"
                value={newCustomer.password}
                onChange={(e) => setNewCustomer({ ...newCustomer, password: e.target.value })}
              />

              <input
                type="password"
                placeholder="Retype Password"
                value={newCustomer.retypePassword}
                onChange={(e) => setNewCustomer({ ...newCustomer, retypePassword: e.target.value })}
              />

              {message && <p style={{ color: "red", textAlign: "center" }}>{message}</p>}

              <div className="buttons">
                <button type="submit">Continue</button>
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
