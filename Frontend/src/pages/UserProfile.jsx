import React from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import "../styles/AuthForm.css";

const UserProfile = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/"); // Redirect to home page after logout
  };

  if (!isAuthenticated) {
    // This is a safeguard in case a non-logged-in user accesses the URL
    return (
      <div className="authContainer">
        <h2>You are not logged in.</h2>
        <button onClick={() => navigate("/login")} className="btn-primary">
          Go to Login
        </button>
      </div>
    );
  }

  return (
    <div className="authContainer">
      <div className="authForm">
        <h2>Profile</h2>
        <p>
          <strong>Welcome, {user.name}!</strong>
        </p>
        <p>
          <strong>Email:</strong> {user.email}
        </p>
        <button onClick={handleLogout} className="logoutBtn btn-primary">
          Log Out
        </button>

        <div className="feedbackSection">
          <h3>Leaving Sabah Soon?</h3>
          <p>We'd love to hear your feedback to improve for future visitors!</p>
          <button className="feedbackBtn">Fill Out Departure Form</button>
        </div>

        <div className="formGroup">
          {/* Additional form elements can go here */}
        </div>
        <div className="divider">OR</div>
        <button className="googleBtn">
          {/* Google sign-in button can go here */}
        </button>
      </div>
    </div>
  );
};

export default UserProfile;
