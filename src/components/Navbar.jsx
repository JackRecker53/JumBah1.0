import { NavLink, Link } from "react-router-dom";
import "../styles/Navbar.css";
import { useAuth } from "../contexts/AuthContext";
import ThemeSwitcher from "./ThemeSwitcher";
import { FaSearch } from "react-icons/fa";
import { useState, useRef, useEffect } from "react";
import SearchModal from "./SearchModal";
import { FaUserCircle } from "react-icons/fa";
import DropdownMenu from "./DropdownMenu";

const Navbar = () => {
  const { isAuthenticated } = useAuth();

  const [searchOpen, setSearchOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const dropdownRef = useRef(null);

  // Close dropdown if click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="navbar">
      <div className="navContainer">
        {/* Logo */}
        <Link to="/" className="logo">
          JumBah
        </Link>

        {/* Menu Links */}
        <ul className="navMenu">
          <li>
            <NavLink
              to="/"
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              Home
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/events"
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              Events
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/adventure"
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              Adventure
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/about"
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              About
            </NavLink>
          </li>
        </ul>

        {/* Right Controls */}
        <div className="navControls">
          {/* Search */}
          <button
            className="searchButton"
            onClick={() => setSearchOpen(true)}
            aria-label="Search"
          >
            <FaSearch size={22} />
          </button>

          {/* Theme Switcher */}
          <ThemeSwitcher />

          {/* Dropdown Menu */}
          <DropdownMenu />

          {/* Login Button (if not authenticated) */}
          {!isAuthenticated && (
            <Link to="/login" className="loginButton">
              Login
            </Link>
          )}
        </div>

        {/* Search Modal */}
        <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
      </div>
    </nav>
  );
};

export default Navbar;
