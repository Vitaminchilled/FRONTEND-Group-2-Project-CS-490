import { useState } from "react";
import "./Login.css";

function Login() {
  const [currentStep, setCurrentStep] = useState(0);
  const [user, setUser] = useState({
    username: "",
    password: "",
  });

  const [message, setMessage] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!user.username || !user.password) {
      setMessage("Please complete both fields.");
      return;
    }

    console.log("Logging in with:", user);

    setMessage("");
    setCurrentStep(1);
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
            <h1>Login</h1>
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                placeholder="username"
                value={user.username}
                onChange={(e) =>
                  setUser({ ...user, username: e.target.value })
                }
              />

              <input
                type="password"
                placeholder="password"
                value={user.password}
                onChange={(e) =>
                  setUser({ ...user, password: e.target.value })
                }
              />

              {message && (
                <p style={{ color: "red", textAlign: "center" }}>{message}</p>
              )}

              <div className="buttons">
                <button type="submit">Login</button>
              </div>
            </form>
          </div>
        </div>
      ) : (
        <div className="CustomerRegistrationBox">
          <div className="rightBox">
            <h2>Welcome, {user.username}!</h2>
            <p>You’ve successfully logged in.</p>
          </div>
        </div>
      )}
    </>
  );
}

export default Login;