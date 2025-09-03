import { NavLink, Link } from "react-router-dom";
import "../styles/Navbar.css";
import ThemeSwitcher from "./ThemeSwitcher";
import { FaSearch } from "react-icons/fa";
import { useState } from "react";
import SearchModal from "./SearchModal";
import Sidebar from "./Sidebar";

const Navbar = () => {
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <nav className="navbar">
      <div className="navContainer">
        {/* Logo */}
        <Link to="/home" className="logo">
          JumBah
        </Link>

        {/* Menu Links */}
        <div className="navCenter">
          <ul className="navMenu">
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
                to="/game"
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                Game
              </NavLink>
            </li>
          </ul>
        </div>

        {/* Dropdown Menu - Moved to the right */}
        <Sidebar />

        {/* Search Modal */}
        <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
      </div>
    </nav>
  );
};

export default Navbar;
