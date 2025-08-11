import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";
import { useAuth } from "../contexts/AuthContext";
import { useGame } from "../contexts/GameContext";
import {
  FaEllipsisV,
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
} from "react-icons/fa";
import "../styles/DropdownMenu.css";

const DropdownMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { isAuthenticated, logout, user } = useAuth();
  const { points, completedQuests, collectedStamps } = useGame();
  const dropdownRef = useRef(null);
  const panelRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      const isOutsideDropdown =
        dropdownRef.current && !dropdownRef.current.contains(event.target);
      const isOutsidePanel =
        panelRef.current && !panelRef.current.contains(event.target);

      if (isOutsideDropdown && isOutsidePanel) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleItemClick = () => {
    setIsOpen(false);
  };

  const handleLogout = () => {
    logout();
    handleItemClick();
  };

  return (
    <>
      <div className="dropdown" ref={dropdownRef}>
        <button
          className="dropdownToggle"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="More options"
        >
          <FaEllipsisV />
        </button>
      </div>

      {/* Backdrop */}
      {isOpen && (
        <div className="dropdownBackdrop" onClick={() => setIsOpen(false)} />
      )}

      {/* Sliding Panel */}
      <div className={`dropdownMenu ${isOpen ? "open" : ""}`} ref={panelRef}>
        <div className="dropdownHeader">
          <h3>TRAVEL TOOLS</h3>
          <button className="closeButton" onClick={() => setIsOpen(false)}>
            <FaTimes />
          </button>
        </div>{" "}
        {/* Profile Section - Only if authenticated */}
        {isAuthenticated && (
          <>
            <div className="profileSection">
              <div className="profileInfo">
                <FaUserCircle className="profileAvatar" />
                <div className="profileDetails">
                  <span className="userName">{user?.name || "Explorer"}</span>
                  <div className="statsContainer">
                    <div className="statItem">
                      <FaCoins className="statIcon" />
                      <span>{points} points</span>
                    </div>
                    <div className="statItem">
                      <FaTrophy className="statIcon" />
                      <span>{completedQuests?.size || 0} quests</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="dropdownDivider"></div>
          </>
        )}
        {/* Quick Access Tools */}
        <Link to="/explore" className="dropdownItem" onClick={handleItemClick}>
          <FaMap />
          <span>Interactive Map</span>
        </Link>
        <div className="dropdownItem">
          <button
            onClick={() => {
              // Add translator functionality here
              alert("Translator feature coming soon!");
              handleItemClick();
            }}
            className="toolButton"
          >
            <FaLanguage />
            <span>Bahasa Malaysia Translator</span>
          </button>
        </div>
        {isAuthenticated && (
          <>
            <div className="dropdownDivider"></div>

            <Link
              to="/profile"
              className="dropdownItem"
              onClick={handleItemClick}
            >
              <FaUser />
              <span>My Profile</span>
            </Link>

            <Link
              to="/adventure"
              className="dropdownItem"
              onClick={handleItemClick}
            >
              <FaTrophy />
              <span>My Adventures</span>
            </Link>

            <Link
              to="/settings"
              className="dropdownItem"
              onClick={handleItemClick}
            >
              <FaCog />
              <span>Settings</span>
            </Link>

            <div className="dropdownDivider"></div>

            <button className="dropdownItem signOut" onClick={handleLogout}>
              <FaSignOutAlt />
              <span>Sign Out</span>
            </button>
          </>
        )}
        {!isAuthenticated && (
          <>
            <div className="dropdownDivider"></div>
            <Link
              to="/login"
              className="dropdownItem loginCta"
              onClick={handleItemClick}
            >
              <FaUser />
              <span>Sign In to Save Progress</span>
            </Link>
          </>
        )}
        {/* Theme Toggle - As dropdown item */}
        <div className="dropdownDivider"></div>
        <div className="dropdownItem">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleTheme();
            }}
            className="theme-toggle-btn"
          >
            {theme === "dark" ? <FaSun /> : <FaMoon />}
            <span>Switch to {theme === "dark" ? "Light" : "Dark"} mode</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default DropdownMenu;
