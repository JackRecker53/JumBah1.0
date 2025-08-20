import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaSearch } from "react-icons/fa";

import { districts } from "../data/attractions";
import "../styles/SearchModal.css";

const SearchModal = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const navigate = useNavigate();

  if (!isOpen) return null;

  // Flatten all attractions into a single array
  const allAttractions = Object.entries(districts).flatMap(([district, data]) =>
    data.attractions.map((attraction) => ({
      ...attraction,
      district,
    }))
  );

  // Enhanced search function with multiple search strategies
  const performSearch = (searchQuery) => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) {
      setResults([]);
      return;
    }

    // Split query into words for multi-word search
    const searchWords = q.split(/\s+/).filter((word) => word.length > 0);

    const searchResults = allAttractions.filter((attraction) => {
      // Convert all searchable text to lowercase
      const searchableText = [
        attraction.name,
        attraction.desc,
        attraction.district,
        attraction.category || "",
        attraction.type || "",
        attraction.location || "",
        attraction.activities?.join(" ") || "",
        attraction.tags?.join(" ") || "",
      ]
        .join(" ")
        .toLowerCase();

      // Strategy 1: Full query match (highest priority)
      if (searchableText.includes(q)) {
        attraction.searchScore = 100;
        return true;
      }

      // Strategy 2: All words must be found somewhere
      const allWordsFound = searchWords.every((word) =>
        searchableText.includes(word)
      );
      if (allWordsFound) {
        attraction.searchScore = 80;
        return true;
      }

      // Strategy 3: Partial word matches (starts with)
      const partialMatches = searchWords.filter((word) => {
        return searchableText
          .split(/\s+/)
          .some((textWord) => textWord.startsWith(word) && word.length >= 2);
      });
      if (partialMatches.length >= Math.ceil(searchWords.length / 2)) {
        attraction.searchScore = 60;
        return true;
      }

      // Strategy 4: Fuzzy matching for typos (simple character similarity)
      const fuzzyMatches = searchWords.filter((word) => {
        if (word.length < 3) return false;
        return searchableText.split(/\s+/).some((textWord) => {
          const similarity = calculateSimilarity(word, textWord);
          return similarity > 0.7; // 70% similarity threshold
        });
      });
      if (fuzzyMatches.length > 0) {
        attraction.searchScore = 40;
        return true;
      }

      return false;
    });

    // Sort by search score (descending) and then by name
    searchResults.sort((a, b) => {
      if (b.searchScore !== a.searchScore) {
        return b.searchScore - a.searchScore;
      }
      return a.name.localeCompare(b.name);
    });

    setResults(searchResults);
  };

  // Simple similarity calculation for fuzzy matching
  const calculateSimilarity = (str1, str2) => {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;

    if (longer.length === 0) return 1.0;

    const editDistance = getEditDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  };

  // Calculate edit distance (Levenshtein distance)
  const getEditDistance = (str1, str2) => {
    const matrix = Array(str2.length + 1)
      .fill(null)
      .map(() => Array(str1.length + 1).fill(null));

    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;

    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1, // deletion
          matrix[j - 1][i] + 1, // insertion
          matrix[j - 1][i - 1] + indicator // substitution
        );
      }
    }

    return matrix[str2.length][str1.length];
  };

  const handleSearch = (e) => {
    e.preventDefault();
    performSearch(query);
  };

  // Live search as you type
  const handleInput = (e) => {
    setQuery(e.target.value);
    performSearch(e.target.value);
  };

  // Handle clicking on a search result
  const handleResultClick = (attraction) => {
    // Close the search modal
    onClose();

    // Navigate to explore page with the district as a parameter
    // You can modify this route based on how your routing is set up
    navigate(
      `/explore?district=${encodeURIComponent(
        attraction.district
      )}&attraction=${encodeURIComponent(attraction.name)}`
    );

    // Alternative: Navigate to map with coordinates if available
    // if (attraction.coordinates) {
    //   navigate(`/map?lat=${attraction.coordinates.lat}&lng=${attraction.coordinates.lng}`);
    // }
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
            <div className="resultsHeader">
              Found {results.length} result{results.length !== 1 ? "s" : ""}
            </div>
            {results.map((a, i) => (
              <div
                key={i}
                className="resultItem clickable"
                onClick={() => handleResultClick(a)}
                style={{ cursor: "pointer" }}
              >
                <div className="resultHeader">
                  <strong>{a.name}</strong>
                  <span style={{ color: "#888", fontSize: "0.9em" }}>
                    ({a.district})
                  </span>
                  {a.searchScore && (
                    <span
                      className="searchScore"
                      style={{
                        color:
                          a.searchScore > 80
                            ? "#4CAF50"
                            : a.searchScore > 60
                            ? "#FF9800"
                            : "#757575",
                        fontSize: "0.8em",
                        marginLeft: "auto",
                      }}
                    >
                      {a.searchScore > 80
                        ? "Exact match"
                        : a.searchScore > 60
                        ? "Good match"
                        : "Partial match"}
                    </span>
                  )}
                </div>
                <div
                  style={{
                    fontSize: "0.95em",
                    color: "#555",
                    marginTop: "4px",
                  }}
                >
                  {a.desc}
                </div>
                {(a.category || a.type) && (
                  <div
                    style={{
                      fontSize: "0.85em",
                      color: "#999",
                      marginTop: "2px",
                    }}
                  >
                    {[a.category, a.type].filter(Boolean).join(" • ")}
                  </div>
                )}
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
