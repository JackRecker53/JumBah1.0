import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaBars,
  FaMoon,
  FaSun,
  FaCog,
  FaUser,
  FaSignOutAlt,
  FaMap,
  FaLanguage,
  FaTrophy,
  FaCoins,
  FaUserCircle,
  FaTimes,
  FaChevronRight,
  FaBook,
} from "react-icons/fa";
import { useTheme } from "../contexts/ThemeContext";
import { useAuth } from "../contexts/AuthContext";
import "../styles/DropdownMenu.css";

const DropdownMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const dropdownRef = useRef(null);
  const panelRef = useRef(null);
  const navigate = useNavigate();

  // Use real theme context
  const { theme, toggleTheme } = useTheme();
  // Use real auth context
  const { user, isAuthenticated, login, logout } = useAuth();
  // For demo: completedQuests and points can be part of user or context
  const completedQuests = user?.completedQuests || new Set([1, 2, 3]);
  const points = user?.points ?? 1250;

  // Dusun dictionary phrases
  const dusunPhrases = [
    { english: "hello", dusun: "Kopivosian" },
    { english: "thank you", dusun: "Pounsikou" },
    { english: "goodbye", dusun: "Kotohuadan" },
    { english: "yes", dusun: "Oou" },
    { english: "no", dusun: "Aran" },
    { english: "excuse me", dusun: "Oduo" },
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        panelRef.current &&
        !panelRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleOpen = () => {
    setIsOpen(true);
    setIsAnimating(true);
  };

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => setIsOpen(false), 200);
  };

  const handleItemClick = () => {
    handleClose();
  };

  const handleLogout = () => {
    logout();
    handleItemClick();
    navigate("/");
  };

  // Simple login handler for demo (replace with real form/modal as needed)
  const handleLogin = () => {
    login({ email: "demo@email.com" });
    handleItemClick();
    navigate("/profile");
  };

  const menuItems = [
    {
      icon: <FaMap />,
      label: "Map of Interests",
      to: "/map",
      color: "#4285f4",
    },
    {
      icon: <FaBook />,
      label: "Dusun Dictionary",
      to: "/dictionary",
      color: "#10b981",
    },
  ];

  const authenticatedItems = [
    {
      icon: <FaUser />,
      label: "My Profile",
      to: "/profile",
      color: "#6366f1",
    },
    {
      icon: <FaTrophy />,
      label: "My Adventures",
      to: "/adventure",
      color: "#f59e0b",
    },
    {
      icon: <FaCog />,
      label: "Settings",
      to: "/settings",
      color: "#6b7280",
    },
  ];

  return (
    <div className="dropdown-container">
      {/* Dropdown Toggle Button */}
      <button
        ref={dropdownRef}
        className="dropdown-toggle"
        onClick={() => (isOpen ? handleClose() : handleOpen())}
        aria-label="Open menu"
      >
        <FaBars />
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div
          className={`backdrop ${
            isAnimating ? "backdrop-enter" : "backdrop-exit"
          }`}
          onClick={handleClose}
        />
      )}

      {/* Dropdown Panel */}
      {isOpen && (
        <div
          ref={panelRef}
          className={`dropdown-panel ${
            isAnimating ? "panel-enter" : "panel-exit"
          }`}
        >
          {/* Header */}
          <div className="dropdown-header">
            <div className="header-content">
              <h3 className="app-title">JumBah</h3>
              <p className="app-subtitle">Explore Malaysia</p>
            </div>
            <button
              className="close-button"
              onClick={handleClose}
              aria-label="Close menu"
            >
              <FaTimes />
            </button>
          </div>

          {/* Login/Sign Up at top (if NOT authenticated) */}
          {!isAuthenticated && (
            <div className="login-section">
              <button className="login-button" onClick={handleLogin}>
                <FaUser />
                <span>Login / Sign Up</span>
                <FaChevronRight className="arrow" />
              </button>
            </div>
          )}

          {/* Profile Section (if authenticated) */}
          {isAuthenticated && (
            <div className="profile-section">
              <div className="profile-card">
                <div className="profile-avatar">
                  <FaUserCircle />
                </div>
                <div className="profile-info">
                  <h4 className="profile-name">{user?.name || "Explorer"}</h4>
                  <div className="profile-stats">
                    <div className="stat-item">
                      <FaCoins className="stat-icon coins" />
                      <span>{points.toLocaleString()} pts</span>
                    </div>
                    <div className="stat-item">
                      <FaTrophy className="stat-icon trophy" />
                      <span>{completedQuests?.size || 0} quests</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Menu Items */}
          <div className="menu-section">
            <div className="menu-group">
              <h5 className="menu-group-title">Explore</h5>
              {menuItems.map((item, index) => (
                <MenuItem
                  key={index}
                  icon={item.icon}
                  label={item.label}
                  to={item.to}
                  onClick={item.onClick || handleItemClick}
                  color={item.color}
                />
              ))}
            </div>

            {isAuthenticated && (
              <div className="menu-group">
                <h5 className="menu-group-title">Account</h5>
                {authenticatedItems.map((item, index) => (
                  <MenuItem
                    key={index}
                    icon={item.icon}
                    label={item.label}
                    to={item.to}
                    onClick={handleItemClick}
                    color={item.color}
                  />
                ))}

                <button className="menu-item danger" onClick={handleLogout}>
                  <div className="menu-item-content">
                    <FaSignOutAlt style={{ color: "#ef4444" }} />
                    <span>Sign Out</span>
                  </div>
                </button>
              </div>
            )}

            <div className="menu-group">
              <h5 className="menu-group-title">Preferences</h5>
              <button
                className="menu-item"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  toggleTheme();
                }}
                type="button"
              >
                <div className="menu-item-content">
                  {theme === "dark" ? (
                    <FaSun style={{ color: "#f59e0b" }} />
                  ) : (
                    <FaMoon style={{ color: "#6366f1" }} />
                  )}
                  <span>
                    Switch to {theme === "dark" ? "Light" : "Dark"} mode
                  </span>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const MenuItem = ({ icon, label, to, onClick, color }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) onClick();
    if (to) {
      navigate(to);
    }
  };

  return (
    <button className="menu-item" onClick={handleClick}>
      <div className="menu-item-content">
        {React.cloneElement(icon, { style: { color } })}
        <span>{label}</span>
      </div>
    </button>
  );
};

export default DropdownMenu;
