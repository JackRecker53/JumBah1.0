import React from "react";
import "../styles/Footer.css";
import { FaFacebook, FaInstagram, FaTwitter } from "react-icons/fa";

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
            Board -One day nanti :D
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
        </div>
      </div>
      <div className="footerBottom">
        <p>&copy; {currentYear} JumBah. All Rights Reserved Bah!.</p>
      </div>
    </footer>
  );
};

export default Footer;
