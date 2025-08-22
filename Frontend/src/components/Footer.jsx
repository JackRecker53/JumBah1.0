import React from "react";
import "../styles/Footer.css";
import {
  FaFacebook,
  FaInstagram,
  FaTwitter,
  FaYoutube,
  FaTiktok,
} from "react-icons/fa";

const Footer = () => {
  // Get the current year dynamically
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container footerContainer">
        <div className="footerAbout">
          <h3>JumBah</h3>
          <p>
            Your AI-powered adventure in Sabah, certified by the Sabah Tourism
            Board
          </p>
        </div>
        <div className="socialLinks">
          <a href="#" aria-label="Facebook">
            <FaFacebook />
          </a>
          <a href="#" aria-label="Instagram">
            <FaInstagram />
          </a>
          <a href="#" aria-label="Twitter">
            <FaTwitter />
          </a>
          <a href="#" aria-label="Youtube">
            <FaYoutube />
          </a>
          <a href="#" aria-label="Tiktok">
            <FaTiktok />
          </a>
        </div>
      </div>
      <div className="footerBottom">
        <p>&copy; {currentYear} JumBah. All Rights Reserved Bah!.</p>
      </div>
    </footer>
  );
};

export default Footer;
