import { useState } from "react";
import "./SalonRegistrationPart1.css";

function SalonRegistrationPart1({ data, updateData, onNext, onBack, isLoading }) {
  const [personalMessage, setPersonalMessage] = useState("");
  const [businessMessage, setBusinessMessage] = useState("");
  const [step, setStep] = useState(1);

  const basicRegex = /^[A-Za-z\s]{1,30}$/;
  const yearRegex = /^(19|20)\d{2}$/;
  const phoneRegex = /^\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}$/;
  const zipRegex = /^\d{5}(-\d{4})?$/;

  const validatePersonal = () => {
    if (!data.firstName || !data.lastName || !data.yearOfBirth || 
        !data.personalEmail || !data.retypePersonalEmail || !data.phoneNumber) {
      setPersonalMessage("Please fill all fields");
      return false;
    }

    if (data.personalEmail !== data.retypePersonalEmail) {
      setPersonalMessage("Emails do not match.");
      return false;
    }

    if (!basicRegex.test(data.firstName) || !basicRegex.test(data.lastName)){
        setPersonalMessage("Names must only include letters and spaces.");
        return false;
    }

    if(!yearRegex.test(data.yearOfBirth)){
        setPersonalMessage("Please enter a valid year of birth");
        return false;
    }

    if(!phoneRegex.test(data.phoneNumber)){
        setPersonalMessage("Please enter a valid phone number");
        return false;
    }

    setPersonalMessage("");
    return true;
  };

  const validateBusiness = () => {
    if (!data.businessName || !data.companyEmail || !data.retypeCompanyEmail || 
        !data.category || !data.address || !data.city || !data.state || 
        !data.zip || !data.country || !data.companyPhone) {
      setBusinessMessage("Please complete all required business info fields.");
      return false;
    }
    
    if (data.companyEmail !== data.retypeCompanyEmail) {
      setBusinessMessage("Emails do not match");
      return false;
    }

    if(!zipRegex.test(data.zip)){
        setBusinessMessage("Please enter a valid zip code");
        return false;
    }

    if(!basicRegex.test(data.country)){
        setBusinessMessage("Please enter a valid country");
        return false;
    }

    if(!basicRegex.test(data.city)){
        setBusinessMessage("Please enter a valid city");
        return false;
    }

    if(!basicRegex.test(data.state)){
        setBusinessMessage("Please enter a valid state");
        return false;
    }

    if(!phoneRegex.test(data.companyPhone)){
        setBusinessMessage("Please enter a valid phone number");
        return false;
    }

    setBusinessMessage("");
    return true;
  };

  const handleFinalSubmit = () => {
    if (onNext) {
      onNext();
    }
  };

  const goBack = () => {
    setPersonalMessage("");
    setBusinessMessage("");
    if (step === 1) {
      onBack?.();
      return;
    }
    setStep((s) => Math.max(1, s - 1));
  };

  const handleTabClick = (target) => {
    if (target > step) {
      if (step === 1 && !validatePersonal()) return;
      if (step === 2 && target > 2 && !validateBusiness()) return;
    }
    setStep(target);
  };

  return (
    <div className="SalonRegistrationBoxPart1">
      <div className="title">
        <h1>Register Salon</h1>
        <p>Let us take care of booking!</p>
      </div>

      <div className="tabs">
        <div className={`tab ${step === 1 ? "active" : ""}`} onClick={() => handleTabClick(1)}>
          Personal Info
        </div>
        <div className={`tab ${step === 2 ? "active" : ""}`} onClick={() => handleTabClick(2)}>
          Business Info
        </div>
        <div className={`tab ${step === 3 ? "active" : ""}`} onClick={() => handleTabClick(3)}>
          Review
        </div>
      </div>

      <div className="formRegister">
        {step === 1 && (
          <>
            <h2 className="formTitle">Personal Details</h2>
            {personalMessage && (
              <p style={{ color: "red", backgroundColor: "white", fontWeight: "bold",
                fontSize: "18px", padding: "8px", marginTop: "5px", zIndex: 9999,
                textAlign: "center", position: "relative" }}>
                {personalMessage}
              </p>
            )}
            <form onSubmit={(e) => { e.preventDefault(); if (validatePersonal()) setStep(2); }}>
              <div className="formRow">
                <div className="formGroup">
                  <label>First Name *</label>
                  <input type="text" placeholder="First Name" value={data.firstName || ""}
                    onChange={(e) => updateData({ firstName: e.target.value })} />
                </div>
                <div className="formGroup">
                  <label>Personal Email *</label>
                  <input type="email" placeholder="example@email.com" value={data.personalEmail || ""}
                    onChange={(e) => updateData({ personalEmail: e.target.value })} />
                </div>
              </div>

              <div className="formRow">
                <div className="formGroup">
                  <label>Last Name *</label>
                  <input type="text" placeholder="Last Name" value={data.lastName || ""}
                    onChange={(e) => updateData({ lastName: e.target.value })} />
                </div>
                <div className="formGroup">
                  <label>Retype Personal Email *</label>
                  <input type="email" placeholder="example@email.com" value={data.retypePersonalEmail || ""}
                    onChange={(e) => updateData({ retypePersonalEmail: e.target.value })} />
                </div>
              </div>

              <div className="formRow">
                <div className="formGroup">
                  <label>Year of Birth *</label>
                  <input type="number" placeholder="YYYY" value={data.yearOfBirth || ""}
                    onChange={(e) => updateData({ yearOfBirth: e.target.value })} />
                </div>
                <div className="formGroup">
                  <label>Phone Number *</label>
                  <input type="tel" placeholder="(XXX) XXX-XXXX" value={data.phoneNumber || ""}
                    onChange={(e) => updateData({ phoneNumber: e.target.value })} />
                </div>
              </div>

              <div className="formRow">
                <div className="formGroup">
                  <label>Gender *</label>
                  <select value={data.gender || "Male"}
                    onChange={(e) => updateData({ gender: e.target.value })}
                    style={{ padding: '10px', width: '100%' }}>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="formGroup"></div>
              </div>

              <div className="formButtons">
                <button type="button" className="backButton" onClick={goBack}>Back</button>
                <button type="submit" className="nextButton">Next</button>
              </div>
            </form>
          </>
        )}

        {step === 2 && (
          <>
            <h2 className="formTitle">Business Information</h2>
            {businessMessage && (
              <p style={{ color: "red", textAlign: "center", backgroundColor: "white",
                fontWeight: "bold", fontSize: "18px", padding: "8px", marginTop: "5px",
                zIndex: 9999, position: "relative" }}>
                {businessMessage}
              </p>
            )}
            <form onSubmit={(e) => { e.preventDefault(); if (validateBusiness()) setStep(3); }}>
              <div className="formRow">
                <div className="formGroup">
                  <label>Company Name *</label>
                  <input type="text" placeholder="Salon Name" value={data.businessName || ""}
                    onChange={(e) => updateData({ businessName: e.target.value })} />
                </div>
                <div className="formGroup">
                  <label>Category *</label>
                  <input type="text" placeholder="Hair, Nails, Spa..." value={data.category || ""}
                    onChange={(e) => updateData({ category: e.target.value })} />
                </div>
              </div>

              <div className="formRow">
                <div className="formGroup">
                  <label>Company Email *</label>
                  <input type="email" placeholder="business@company.com" value={data.companyEmail || ""}
                    onChange={(e) => updateData({ companyEmail: e.target.value })} />
                </div>
                <div className="formGroup">
                  <label>Retype Company Email *</label>
                  <input type="email" placeholder="business@company.com" value={data.retypeCompanyEmail || ""}
                    onChange={(e) => updateData({ retypeCompanyEmail: e.target.value })} />
                </div>
              </div>

              <div className="formRow">
                <div className="formGroup">
                  <label>Address *</label>
                  <input type="text" placeholder="Street Address" value={data.address || ""}
                    onChange={(e) => updateData({ address: e.target.value })} />
                </div>
                <div className="formGroup">
                  <label>City *</label>
                  <input type="text" placeholder="City" value={data.city || ""}
                    onChange={(e) => updateData({ city: e.target.value })} />
                </div>
              </div>

              <div className="formRow">
                <div className="formGroup">
                  <label>State *</label>
                  <input type="text" placeholder="State" value={data.state || ""}
                    onChange={(e) => updateData({ state: e.target.value })} />
                </div>
                <div className="formGroup">
                  <label>Zip Code *</label>
                  <input type="number" placeholder="ZIP" value={data.zip || ""}
                    onChange={(e) => updateData({ zip: e.target.value })} />
                </div>
              </div>

              <div className="formRow">
                <div className="formGroup">
                  <label>Country *</label>
                  <input type="text" placeholder="Country" value={data.country || ""}
                    onChange={(e) => updateData({ country: e.target.value })} />
                </div>
                <div className="formGroup">
                  <label>Company Phone *</label>
                  <input type="tel" placeholder="(123) 456-7890" value={data.companyPhone || ""}
                    onChange={(e) => updateData({ companyPhone: e.target.value })} />
                </div>
              </div>

              <div className="formButtons">
                <button type="button" className="backButton" onClick={goBack}>Back</button>
                <button type="submit" className="nextButton">Next</button>
              </div>
            </form>
          </>
        )}

        {step === 3 && (
          <>
            <h2 className="formTitle">
              Review all the information below to officially register your salon's account
            </h2>
            {businessMessage && (
              <p style={{ color: "red", textAlign: "center", fontWeight: "bold", padding: "10px" }}>
                {businessMessage}
              </p>
            )}
            <div className="reviewSection">
              <div className="reviewColumn">
                <h3>Personal Info</h3>
                <p><strong>First Name:</strong> {data.firstName}</p>
                <p><strong>Last Name:</strong> {data.lastName}</p>
                <p><strong>Year of Birth:</strong> {data.yearOfBirth}</p>
                <p><strong>Gender:</strong> {data.gender}</p>
                <p><strong>Personal Email:</strong> {data.personalEmail}</p>
                <p><strong>Phone:</strong> {data.phoneNumber}</p>
              </div>
              <div className="reviewColumn">
                <h3>Business Info</h3>
                <p><strong>Company Name:</strong> {data.businessName}</p>
                <p><strong>Category:</strong> {data.category}</p>
                <p><strong>Company Email:</strong> {data.companyEmail}</p>
                <p><strong>Address:</strong> {data.address}, {data.city}, {data.state} {data.zip}, {data.country}</p>
                <p><strong>Company Phone:</strong> {data.companyPhone}</p>
              </div>
            </div>
            <div className="formButtons">
              <button type="button" className="backButton" onClick={goBack} disabled={isLoading}>
                Back
              </button>
              <button type="button" className="nextButton" onClick={handleFinalSubmit} disabled={isLoading}>
                {isLoading ? 'Submitting...' : 'Submit'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default SalonRegistrationPart1;