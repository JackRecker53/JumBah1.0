import React, { useState } from "react";
import { FaSearch } from "react-icons/fa";

import { districts } from "../data/attractions";
import "../styles/SearchModal.css";

const SearchModal = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);

  if (!isOpen) return null;

  // Flatten all attractions into a single array
  const allAttractions = Object.entries(districts).flatMap(([district, data]) =>
    data.attractions.map((attraction) => ({
      ...attraction,
      district,
    }))
  );

  const handleSearch = (e) => {
    e.preventDefault();
    const q = query.trim().toLowerCase();
    if (!q) {
      setResults([]);
      return;
    }
    setResults(
      allAttractions.filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          a.desc.toLowerCase().includes(q) ||
          a.district.toLowerCase().includes(q)
      )
    );
  };

  // Live search as you type
  const handleInput = (e) => {
    setQuery(e.target.value);
    const q = e.target.value.trim().toLowerCase();
    if (!q) {
      setResults([]);
      return;
    }
    setResults(
      allAttractions.filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          a.desc.toLowerCase().includes(q) ||
          a.district.toLowerCase().includes(q)
      )
    );
  };

  return (
    <div className="dropdownSearchPanel">
      <div className="searchContainer">
        <button className="closeButton" onClick={onClose}>
          &times;
        </button>
        <form className="searchInputContainer" onSubmit={handleSearch}>
          <input
            className="searchInput"
            type="text"
            placeholder="Search for something in Sabah"
            autoFocus
            value={query}
            onChange={handleInput}
          />
          <button className="searchSubmitButton" type="submit">
            <FaSearch />
          </button>
        </form>
        {results.length > 0 && (
          <div className="searchResults">
            {results.map((a, i) => (
              <div key={i} className="resultItem">
                <strong>{a.name}</strong>{" "}
                <span style={{ color: "#888" }}>({a.district})</span>
                <div style={{ fontSize: "0.95em", color: "#555" }}>
                  {a.desc}
                </div>
              </div>
            ))}
          </div>
        )}
        {query && results.length === 0 && (
          <div className="searchResults">
            <div className="resultItem" style={{ color: "#888" }}>
              No results found.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchModal;
