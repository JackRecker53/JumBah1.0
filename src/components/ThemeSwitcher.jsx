import { useTheme } from '../contexts/ThemeContext';
import { FaSun, FaMoon } from 'react-icons/fa';
import styles from '../styles/Navbar.module.css'; // Can reuse some styles

const ThemeSwitcher = () => {
    const { theme, toggleTheme } = useTheme();

    return (
        <button onClick={toggleTheme} className={styles.themeToggle}>
            {theme === 'light' ? <FaMoon size={22} /> : <FaSun size={22} />}
        </button>
    );
};

export default ThemeSwitcher;