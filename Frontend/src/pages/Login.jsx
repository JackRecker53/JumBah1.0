import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { useGame } from "../contexts/GameContext";
import { FcGoogle } from "react-icons/fc";
import "../styles/AuthForm.css";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const { completeQuest, completedQuests } = useGame();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await login(username, password);
      if (!completedQuests.has("q1")) {
        completeQuest("q1");
      }
      navigate("/profile");
    } catch (err) {
      setError(err.message || "Login failed. Please check your password.");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form">
        <h2>Welcome</h2>
        <p>Log in to sabah adventure.</p>
        {error && <p className="error-message">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Email address or phone number"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>
          <button type="submit" className="btn-primary">
            Log In
          </button>
        </form>
        <p className="switch-auth">
          Don't have an account? <Link to="/register">Register here</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
