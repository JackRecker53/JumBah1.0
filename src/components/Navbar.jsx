import { NavLink, Link } from 'react-router-dom';
import styles from '../styles/Navbar.module.css';
import { useAuth } from '../contexts/AuthContext';
import ThemeSwitcher from './ThemeSwitcher';
import { FaUserCircle } from "react-icons/fa";

const Navbar = () => {
    const { isAuthenticated } = useAuth();

    return (
        <nav className={styles.navbar}>
            <div className={styles.navContainer}>
                <Link to="/" className={styles.logo}>JumBah</Link>
                <ul className={styles.navMenu}>
                    <li><NavLink to="/" className={({ isActive }) => isActive ? styles.active : ''}>Home</NavLink></li>
                    <li><NavLink to="/events" className={({ isActive }) => isActive ? styles.active : ''}>Events</NavLink></li>
                    <li><NavLink to="/adventure" className={({ isActive }) => isActive ? styles.active : ''}>Adventure</NavLink></li>
                    <li><NavLink to="/about" className={({ isActive }) => isActive ? styles.active : ''}>About</NavLink></li>
                </ul>
                <div className={styles.navControls}>
                    <ThemeSwitcher />
                    {isAuthenticated ? (
                        <Link to="/profile" className={styles.profileIcon}><FaUserCircle size={28} /></Link>
                    ) : (
                        <Link to="/login" className={styles.loginButton}>Login</Link>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;