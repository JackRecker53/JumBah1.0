import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { FaEllipsisV, FaMoon, FaSun, FaCog, FaUser, FaSignOutAlt } from 'react-icons/fa';
import '../styles/DropdownMenu.css';

const DropdownMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { isAuthenticated, logout } = useAuth();
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleItemClick = () => {
    setIsOpen(false);
  };

  const handleLogout = () => {
    logout();
    handleItemClick();
  };

  return (
    <div className="dropdown" ref={dropdownRef}>
      <button 
        className="dropdownToggle"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="More options"
      >
        <FaEllipsisV />
      </button>
      
      {isOpen && (
        <div className="dropdownMenu">
          <div className="dropdownItem">
            <button 
              onClick={() => {
                toggleTheme();
                handleItemClick();
              }}
              className="themeToggle"
            >
              {theme === 'dark' ? <FaSun /> : <FaMoon />}
              <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
            </button>
          </div>
          
          {isAuthenticated && (
            <>
              <div className="dropdownDivider"></div>
              
              <Link to="/profile" className="dropdownItem" onClick={handleItemClick}>
                <FaUser />
                <span>Profile</span>
              </Link>
              
              <Link to="/settings" className="dropdownItem" onClick={handleItemClick}>
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
        </div>
      )}
    </div>
  );
};

export default DropdownMenu;
      <div className={styles.navContainer}>
        {/* Logo */}
        <Link to="/" className={styles.logo}>
          JumBah
        </Link>

        {/* Menu Links */}
        <ul className={styles.navMenu}>
          <li>
            <NavLink
              to="/"
              className={({ isActive }) => (isActive ? styles.active : "")}
            >
              Home
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/events"
              className={({ isActive }) => (isActive ? styles.active : "")}
            >
              Events
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/adventure"
              className={({ isActive }) => (isActive ? styles.active : "")}
            >
              Adventure
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/about"
              className={({ isActive }) => (isActive ? styles.active : "")}
            >
              About
            </NavLink>
          </li>
        </ul>

        {/* Right Controls */}
        <div className={styles.navControls}>
          {/* Search */}
          <button
            className={styles.searchButton}
            onClick={() => setSearchOpen(true)}
            aria-label="Search"
          >
            <FaSearch size={22} />
          </button>

          {/* Theme Switcher */}
          <ThemeSwitcher />

          {/* If logged in → Dropdown */}
          {isAuthenticated ? (
            <div className={styles.dropdownWrapper} ref={dropdownRef}>
              <button
                className={styles.profileIcon}
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                <FaUserCircle size={28} />
              </button>
              {dropdownOpen && (
                <div className={styles.dropdownMenu}>
                  <Link to="/profile" className={styles.dropdownItem}>
                    Profile
                  </Link>
                  <Link to="/settings" className={styles.dropdownItem}>
                    Settings
                  </Link>
                  <Link to="/logout" className={styles.dropdownItem}>
                    Logout
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className={styles.loginButton}>
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
