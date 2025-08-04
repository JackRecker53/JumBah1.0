import React from 'react';
import styles from '../styles/Footer.module.css';
import { FaFacebook, FaInstagram, FaTwitter } from 'react-icons/fa';

const Footer = () => {
    // Get the current year dynamically
    const currentYear = new Date().getFullYear();

    return (
        <footer className={styles.footer}>
            <div className={`container ${styles.footerContainer}`}>
                <div className={styles.footerAbout}>
                    <h3>JumBah</h3>
                    <p>Your AI-powered adventure in Sabah, certified by the Sabah Tourism Board -One day nanti :D</p>
                </div>
                <div className={styles.socialLinks}>
                    <a href="#" aria-label="Facebook"><FaFacebook /></a>
                    <a href="#" aria-label="Instagram"><FaInstagram /></a>
                    <a href="#" aria-label="Twitter"><FaTwitter /></a>
                </div>
            </div>
            <div className={styles.footerBottom}>
                <p>&copy; {currentYear} JumBah. All Rights Reserved Bah!.</p>
            </div>
        </footer>
    );
};

export default Footer;