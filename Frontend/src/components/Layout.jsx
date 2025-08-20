import { useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import ChatbotWidget from "./ChatbotWidget";
import "../styles/Layout.css";

const Layout = ({ children }) => {
  const location = useLocation();
  const isAIPlannerPage = location.pathname === "/ai-planner";

  return (
    <div className="layout-wrapper">
      <Navbar />
      <main className="layout-main">{children}</main>
      <ChatbotWidget />
      <Footer />
    </div>
  );
};

export default Layout;
