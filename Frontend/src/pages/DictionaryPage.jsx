import React, { useState } from "react";
import "../styles/DictionaryPage.css";

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

// --- New AI Assistant Component ---
const AIAssistant = () => {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!question.trim()) return;

    setIsLoading(true);
    setAnswer(""); // Clear previous answer

    try {
      const response = await fetch("http://localhost:8000/api/translate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: question, from_lang: "en" }),
      });

      if (!response.ok) {
        throw new Error("Failed to get a response from the server.");
      }

      const data = await response.json();
      setAnswer(data.translation);
    } catch (error) {
      console.error(error);
      setAnswer("Sorry, something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="ai-assistant">
      <h2>AI Translation Assistant</h2>
      <p>Enter text in English to translate to Dusun</p>
      <form onSubmit={handleSubmit}>
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Enter English text to translate..."
          rows="3"
          className="translation-input"
        />
        <button
          className={`ask-ai-btn ${isLoading ? "loading" : ""}`}
          type="submit"
          disabled={isLoading}
        >
          {isLoading ? "Translating..." : "Translate with AI"}
        </button>
      </form>
      {answer && (
        <div className="translation-result">
          <h3>Translation:</h3>
          <p className="dusun-translation">{answer}</p>
        </div>
      )}
    </div>
  );
};

// --- Main Dictionary Page Component ---
const DictionaryPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [translationText, setTranslationText] = useState("");
  const [translationResult, setTranslationResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const filteredPhrases = phrases.filter(
    (p) =>
      p.english.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.dusun.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleTranslate = async (e) => {
    e.preventDefault();
    if (!translationText.trim()) return;

    setIsLoading(true);
    try {
      const response = await fetch("http://localhost:8000/api/translate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: translationText, from_lang: "en" }),
      });

      if (!response.ok) {
        throw new Error("Translation failed");
      }

      const data = await response.json();
      setTranslationResult(data);
    } catch (error) {
      console.error("Translation error:", error);
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
        <form onSubmit={handleTranslate} className="translator-form">
          <textarea
            value={translationText}
            onChange={(e) => setTranslationText(e.target.value)}
            placeholder="Enter English text to translate to Dusun..."
            rows="4"
            className="translation-input"
          />
          <button
            type="submit"
            className={`translate-btn ${isLoading ? "loading" : ""}`}
            disabled={isLoading}
          >
            {isLoading ? "Translating..." : "Translate"}
          </button>
        </form>

        {translationResult && (
          <div className="translation-results">
            <div className="dictionary-translation">
              <h3>Dictionary Translation</h3>
              <p>{translationResult.basic_translation}</p>
              {translationResult.found_words &&
                translationResult.found_words.length > 0 && (
                  <div className="found-words">
                    <h4>Words found in dictionary:</h4>
                    <ul>
                      {translationResult.found_words.map((word, idx) => (
                        <li key={idx}>
                          {word.english} → {word.dusun}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              {translationResult.not_found_words &&
                translationResult.not_found_words.length > 0 && (
                  <div className="not-found-words">
                    <h4>Words not found in dictionary:</h4>
                    <ul>
                      {translationResult.not_found_words.map((word, idx) => (
                        <li key={idx}>{word}</li>
                      ))}
                    </ul>
                  </div>
                )}
            </div>
            {translationResult.enhanced_translation && (
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
                <p>{translationResult.enhanced_translation}</p>
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
