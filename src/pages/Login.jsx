import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import "./Login.css";

function Login() {
  const navigate = useNavigate();
  const { login } = useUser();

  const [currentStep, setCurrentStep] = useState(0);
  const [user, setUser] = useState({ username: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user.username || !user.password) {
      setMessage("Please complete both fields.");
      return;
    }

    setIsLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          username: user.username,
          password: user.password,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        let role = data.role || "customer";
        let salonId = data.salon_id || null;
        let displayName =
          (data.first_name && data.first_name.trim()) || user.username;

        if (!data.role || !data.first_name) {
          try {
            const who = await fetch("/api/auth/status", {
              credentials: "include",
            }).then((r) => r.json());
            role = who.role || role;
            salonId = who.salon_id || salonId;
            displayName =
              (who.first_name && who.first_name.trim()) ||
              who.username ||
              displayName;
          } catch {}
        }

        login(displayName, role, user.username, salonId);
        navigate("/");
      } else {
        setMessage(data.error || "Login failed.");
      }
    } catch {
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
            <h1>Login</h1>
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                placeholder="username"
                value={user.username}
                onChange={(e) =>
                  setUser({ ...user, username: e.target.value })
                }
                disabled={isLoading}
              />

              <input
                type="password"
                placeholder="password"
                value={user.password}
                onChange={(e) =>
                  setUser({ ...user, password: e.target.value })
                }
                disabled={isLoading}
              />

              {message && (
                <p style={{ color: "red", textAlign: "center" }}>{message}</p>
              )}

              <div className="buttons">
                <button type="submit" disabled={isLoading}>
                  {isLoading ? "Logging in..." : "Login"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : (
        <div className="CustomerRegistrationBox">
          <div className="rightBox">
            <h2>Welcome, {user.username}!</h2>
            <p>You've successfully logged in!</p>
            <div className="buttons">
              <button onClick={() => navigate("/")}>Go Home</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Login;
