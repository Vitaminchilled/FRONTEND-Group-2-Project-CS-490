import { useState } from "react";
import "./SalonRegistration.css";
import SalonRegistrationPart1 from "./SalonRegistrationPart1";

//Added currentStep
function SalonRegistration() {
  const [currentStep, setCurrentStep] = useState(0);

  const usernameAndPasswordRegex = /^(?=.{8,20}$)(?![_.])(?!.*[_.]{2})[a-zA-Z0-9._]+(?<![_.])$/; //8-20 chars, can't start or end with _/. 

  
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

    businessName: "",
    companyEmail: "",
    retypeCompanyEmail: "",
    category: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    country: "",
    companyPhone: ""
  });

  const [message, setMessage] = useState("");

  const updateData = (newData) => {
    setNewSalon((prev) => ({ ...prev, ...newData }));
  };

  // Salon Registration Sign Up
  const handleSubmit = (e) => {
    e.preventDefault();

    if(!usernameandPasswordRegex.test(newSalon.username)){
      setMessage("Username not valid, please try again.");
    }

    if (newSalon.password !== newSalon.retypePassword){
        setMessage("Passwords do not match.");
        return;
    }

    if(!newSalon.username || !newSalon.password || !newSalon.retypePassword){
        setMessage("Please complete all fields.");
        return;
    }

    setCurrentStep(1);
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
              />

              <input
              type="password"
              placeholder="password"
              value={newSalon.password}
              onChange={(e) => setNewSalon({ ...newSalon, password: e.target.value })}
              />

              <input
              type="password"
              placeholder="Retype Password"
              value={newSalon.retypePassword}
              onChange={(e) => setNewSalon({ ...newSalon, retypePassword: e.target.value })}
              />
              
              {message && <p style={{color: 'red', textAlign: 'center'}}>{message}</p>}
          
          <div className="buttons">
            <button type="submit">Continue</button>
          </div>
          </form>
        </div>
      </div>
    ) : (
      <SalonRegistrationPart1
        data={newSalon}
        updateData={updateData} //Needed if going back and forth between pages
        onNext={() => setCurrentStep(2)}
        onBack={() => setCurrentStep(0)}
        setMessage={setMessage}
      />
    )}
  </>
  );
}

export default SalonRegistration;