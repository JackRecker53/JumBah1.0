import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/AuthForm.css";
import { API_BASE_URL } from "../config";

const Register = () => {
  const [username, setUsername] = useState("");
  const [useremail, setUseremail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState(""); // Fixed naming
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Add password confirmation validation
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    // Add basic validation
    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(useremail)) {
      setError("Please enter a valid email address");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        // Fixed: Include all form fields in the request
        body: JSON.stringify({
          username,
          email: useremail, // Changed to 'email' for consistency
          password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Optional: Show success message before navigating
        alert("Registration successful! Please login.");
        navigate("/login");
      } else {
        setError(data.msg || "Registration failed");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
      console.error("Registration error:", err);
    }
  };

  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h2>Register</h2>
        <p>Create your account to get started</p>

        {error && <p className="error-message">{error}</p>}

        <div className="form-group">
          <label htmlFor="username">User Name</label> {/* Fixed htmlFor */}
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your username"
            required
            minLength="3"
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">Email Address</label> {/* Fixed htmlFor */}
          <input
            type="email"
            id="email"
            value={useremail}
            onChange={(e) => setUseremail(e.target.value)}
            placeholder="Enter your email address"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">New Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            required
            minLength="6"
          />
        </div>

        <div className="form-group">
          <label htmlFor="confirmPassword">Confirm Password</label>
          <input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm your password"
            required
            minLength="6"
          />
        </div>

        <button type="submit" className="btn-primary">
          Sign Up
        </button>

        <div className="switch-auth">
          Already have an account? <a href="/login">Sign in</a>
        </div>
      </form>
    </div>
  );
};

export default Register;
