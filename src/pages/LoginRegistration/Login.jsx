import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../context/UserContext";
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
      
      // DEBUG: Log the entire response
      console.log("=== LOGIN RESPONSE ===");
      console.log("Status:", res.status);
      console.log("Response data:", JSON.stringify(data, null, 2));
      console.log("Role:", data.role);
      console.log("Salon ID:", data.salon_id);
      console.log("First Name:", data.first_name);
      
      if (res.ok) {
        let role = data.role || "customer";
        let salonId = data.salon_id || null;
        let displayName =
          (data.first_name && data.first_name.trim()) || user.username;

        // If data is incomplete, try to fetch from auth/status
        if (!data.role || !data.first_name) {
          console.log("=== FETCHING AUTH STATUS ===");
          try {
            const who = await fetch("/api/auth/status", {
              credentials: "include",
            }).then((r) => r.json());
            
            console.log("Auth status response:", JSON.stringify(who, null, 2));
            
            role = who.role || role;
            salonId = who.salon_id || salonId;
            displayName =
              (who.first_name && who.first_name.trim()) ||
              who.username ||
              displayName;
          } catch (err) {
            console.error("Error fetching auth status:", err);
          }
        }

        console.log("=== FINAL VALUES ===");
        console.log("Role:", role);
        console.log("Salon ID:", salonId);
        console.log("Display Name:", displayName);

        login(displayName, role, user.username, salonId);

        // Redirect based on role - with debug logging
        console.log("=== REDIRECT LOGIC ===");
        console.log("Is salon/owner?", role === "salon" || role === "owner");
        console.log("Has salon ID?", !!salonId);
        
        if ((role === "salon" || role === "owner") && salonId) {
          console.log(`Redirecting to: /salon/${salonId}`);
          navigate(`/salon/${salonId}`);
        } else {
          console.log("Redirecting to: /");
          navigate("/");
        }
        window.location.reload();
      } else {
        setMessage(data.error || "Login failed.");
      }
    } catch (err) {
      console.error("Login error:", err);
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