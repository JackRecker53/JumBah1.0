import { useTheme } from "../contexts/ThemeContext";
import { FaSun, FaMoon } from "react-icons/fa";
import "../styles/Navbar.css";

const ThemeSwitcher = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button onClick={toggleTheme} className="themeToggle">
      {theme === "light" ? <FaMoon size={22} /> : <FaSun size={22} />}
    </button>
  );
};

export default ThemeSwitcher;
