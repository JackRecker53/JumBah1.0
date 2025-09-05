import React, { useState } from "react";
import "../styles/DictionaryPage.css";
import { API_BASE_URL } from "../config";

// --- Data (same as before) ---
const phrases = [
  { english: "hello", dusun: "Kopivosian" },
  { english: "thank you", dusun: "Pounsikou" },
  { english: "goodbye", dusun: "Kotohuadan" },
  { english: "yes", dusun: "Oou" },
  { english: "no", dusun: "Aran" },
  { english: "excuse me", dusun: "Oduo" },
  { english: "good morning", dusun: "Kopivosian do kosuabon" },
  { english: "how are you?", dusun: "Nunu abal?" },
  { english: "I am fine", dusun: "Avasi zio" },
  { english: "what is your name?", dusun: "Isai ngaran nu?" },
];

const tips = [
  "Greet locals with 'Kopivosian' to start a friendly conversation.",
  "Practice a few phrases every day to build confidence.",
  "Listen to native speakers to get the pronunciation right.",
];

// --- Main Dictionary Page Component ---
const DictionaryPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [translationText, setTranslationText] = useState("");
  const [translationResult, setTranslationResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const filteredPhrases = phrases.filter(
    (p) =>
      p.english.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.dusun.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleTranslate = async () => {
    if (!translationText.trim()) return;

    setIsLoading(true);
    setError(null);
    setTranslationResult(null);

    try {
      console.log("Main translator - Sending request:", {
        text: translationText,
        from_lang: "en",
      });

      const response = await fetch(`${API_BASE_URL}/api/translate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: translationText, from_lang: "en" }),
      });

      console.log("Main translator - Response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Main translator - Error response:", errorText);
        throw new Error(
          `Translation failed: ${response.status} - ${errorText}`
        );
      }

      const data = await response.json();
      console.log("Main translator - Response data:", data);
      setTranslationResult(data);
    } catch (error) {
      console.error("Translation error:", error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="dictionary-container">
      <header className="dictionary-header">
        <h1>Dusun Dictionary & Translator</h1>
        <p>Translate and explore Kadazandusun words</p>
      </header>

      {/* --- Translator Section --- */}
      <section className="translator-section">
        <h2>Text Translation</h2>
        <div className="translator-form">
          <textarea
            value={translationText}
            onChange={(e) => setTranslationText(e.target.value)}
            placeholder="Enter English text to translate to Dusun..."
            rows="4"
            className="translation-input"
          />
          <button
            onClick={handleTranslate}
            className={`translate-btn ${isLoading ? "loading" : ""}`}
            disabled={isLoading}
          >
            {isLoading ? "Translating..." : "Translate"}
          </button>
        </div>

        {error && (
          <div className="error-message">
            <strong>Error:</strong> {error}
          </div>
        )}

        {translationResult && (
          <div className="translation-results">
            <div className="dictionary-translation">
              <h3>Dictionary Translation</h3>
              <p>
                {translationResult.translations?.basic ||
                  translationResult.basic_translation ||
                  "No basic translation available"}
              </p>

              {/* Handle found words - check multiple possible structures */}
              {((translationResult.details?.found_words &&
                translationResult.details.found_words.length > 0) ||
                (translationResult.found_words &&
                  translationResult.found_words.length > 0)) && (
                <div className="found-words">
                  <h4>Words found in dictionary:</h4>
                  <ul>
                    {(
                      translationResult.details?.found_words ||
                      translationResult.found_words ||
                      []
                    ).map((word, idx) => (
                      <li key={idx}>
                        {word.english} → {word.dusun}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Handle not found words - check multiple possible structures */}
              {((translationResult.details?.not_found &&
                translationResult.details.not_found.length > 0) ||
                (translationResult.not_found_words &&
                  translationResult.not_found_words.length > 0)) && (
                <div className="not-found-words">
                  <h4>Words not found in dictionary:</h4>
                  <ul>
                    {(
                      translationResult.details?.not_found ||
                      translationResult.not_found_words ||
                      []
                    ).map((word, idx) => (
                      <li key={idx}>{word}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* AI Enhanced Translation */}
            {(translationResult.translations?.enhanced ||
              translationResult.enhanced_translation) && (
              <div className="ai-translation">
                <h3>
                  AI-Enhanced Translation
                  {translationResult.ai_provider && (
                    <span className="ai-provider">
                      {translationResult.ai_provider === "openai"
                        ? "(ChatGPT)"
                        : "(Gemini)"}
                    </span>
                  )}
                </h3>
                <p>
                  {translationResult.translations?.enhanced ||
                    translationResult.enhanced_translation}
                </p>
              </div>
            )}
          </div>
        )}
      </section>

      {/* --- Dictionary Section --- */}
      <section className="dictionary-section">
        <h2>Dictionary Search</h2>
        <div className="search-container">
          <input
            type="text"
            placeholder="Search phrases in English or Dusun..."
            className="search-bar"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="dictionary-main">
          <ul className="dictionary-list">
            {filteredPhrases.length > 0 ? (
              filteredPhrases.map((p) => (
                <li className="dictionary-item" key={p.english}>
                  <span className="english-word">{p.english}</span>
                  <span className="dusun-word">{p.dusun}</span>
                </li>
              ))
            ) : (
              <li className="no-results">No phrases found.</li>
            )}
          </ul>
        </div>
      </section>

      {/* --- Tips Section --- */}
      <aside className="tips-card">
        <h2>💡 Language Tips</h2>
        <ul>
          {tips.map((tip, index) => (
            <li key={index}>{tip}</li>
          ))}
        </ul>
      </aside>
    </div>
  );
};

export default DictionaryPage;
