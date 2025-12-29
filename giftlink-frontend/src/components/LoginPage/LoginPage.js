import React, { useState, useEffect } from "react";
import "./LoginPage.css";

// Task 1: Import urlConfig
import { urlConfig } from "../../config";

// Task 2: Import useAppContext
import { useAppContext } from "../../context/AuthContext";

// Task 3: Import useNavigate
import { useNavigate } from "react-router-dom";
function LoginPage() {
  // State variables
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Task 4: Incorrect password / error message
  const [incorrect, setIncorrect] = useState("");

  // Task 5: navigate, bearerToken, setIsLoggedIn
  const navigate = useNavigate();
  const bearerToken = sessionStorage.getItem("auth-token");
  const { setIsLoggedIn } = useAppContext();

  // Task 6: If already logged in, redirect to MainPage
  useEffect(() => {
    if (bearerToken) {
      navigate("/app");
    }
  }, [bearerToken, navigate]);
  // Handle login button click
  const handleLogin = async () => {
    try {
      const response = await fetch(`${urlConfig.backendUrl}/api/auth/login`, {
        // Task 7: Set method
        method: "POST",

        // Task 8: Set headers
        headers: {
          "content-type": "application/json",
          Authorization: bearerToken ? `Bearer ${bearerToken}` : "",
        },

        // Task 9: Set body
        body: JSON.stringify({
          email: email,
          password: password,
        }),
      });

      const json = await response.json();

      if (!response.ok) {
        setIncorrect(json.error || "Login failed");
        return;
      }

      // Save session data
      sessionStorage.setItem("auth-token", json.authtoken);
      sessionStorage.setItem("name", json.userName);
      sessionStorage.setItem("email", json.userEmail);

      // Update global auth state
      setIsLoggedIn(true);

      // Navigate to MainPage
      navigate("/app");
    } catch (e) {
      console.log("Error fetching details:", e.message);
      setIncorrect("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-6">
          <div className="login-card p-4 border rounded">
            <h2 className="text-center mb-4 font-weight-bold">Login</h2>

            {/* Email */}
            <div className="mb-3">
              <label htmlFor="email" className="form-label">
                Email
              </label>
              <input
                id="email"
                type="text"
                className="form-control"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {/* Password */}
            <div className="mb-4">
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <input
                id="password"
                type="password"
                className="form-control"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            {incorrect && <div className="text-danger mb-3">{incorrect}</div>}
            {/* Login Button */}
            <button
              className="btn btn-primary w-100 mb-3"
              onClick={handleLogin}
            >
              Login
            </button>

            <p className="mt-4 text-center">
              New here?{" "}
              <a href="/app/register" className="text-primary">
                Register Here
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
