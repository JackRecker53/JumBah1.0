import { NavLink, Link } from "react-router-dom";
import "../styles/Navbar.css";
import ThemeSwitcher from "./ThemeSwitcher";
import { FaSearch } from "react-icons/fa";
import { useState } from "react";
import SearchModal from "./SearchModal";
import DropdownMenu from "./DropdownMenu";

const Navbar = () => {
  const [searchOpen, setSearchOpen] = useState(false);

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
              to="/explore"
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              Explore
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
              to="/ai-planner"
              className={({ isActive }) =>
                `ai-planner-button ${isActive ? "active" : ""}`
              }
            >
              AI Planner
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
              to="/game"
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              Game
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/dictionary"
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              Dusun Dictionary
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/translator"
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              Translator
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/about"
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              About Sabah
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

          {/* Dropdown Menu - Moved to the right */}
          <DropdownMenu />
        </div>

        {/* Search Modal */}
        <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
      </div>
    </nav>
  );
};

export default Navbar;
