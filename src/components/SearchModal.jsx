import React from "react";
import styles from "../styles/SearchModal.module.css";
import { FaSearch } from "react-icons/fa";

const SearchModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  return (
    <div className={styles.fullscreenOverlay}>
      <div className={styles.searchContainer}>
        <button className={styles.closeButton} onClick={onClose}>
          &times;
        </button>
        <div className={styles.searchInputContainer}>
          <input
            className={styles.searchInput}
            type="text"
            placeholder="Search for something in Sabah"
            autoFocus
          />
          <button className={styles.searchSubmitButton}>
            <FaSearch />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SearchModal;
