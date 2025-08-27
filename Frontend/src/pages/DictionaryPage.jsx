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
      // This fetch call goes to our new backend function in /api/generate.js
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question }),
      });

      if (!response.ok) {
        throw new Error("Failed to get a response from the server.");
      }

      const data = await response.json();
      setAnswer(data.answer);
    } catch (error) {
      console.error(error);
      setAnswer("Sorry, something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="ai-assistant">
      <h2>Ask the AI Language Tutor</h2>
      <p>Ask for example sentences, grammar, or cultural context.</p>
      <form onSubmit={handleSubmit}>
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="e.g., 'Use Kopivosian in a sentence'"
          rows="3"
        />
        <button type="submit" disabled={isLoading}>
          {isLoading ? "Thinking..." : "Ask AI"}
        </button>
      </form>
      {answer && (
        <div className="ai-answer">
          <p>{answer}</p>
        </div>
      )}
    </div>
  );
};

// --- Main Dictionary Page Component ---
const DictionaryPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const filteredPhrases = phrases.filter(
    (p) =>
      p.english.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.dusun.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="dictionary-container">
      <header className="dictionary-header">
        <h1>Dusun Dictionary & Phrases</h1>
        <p>Your quick guide to basic Kadazandusun words.</p>
      </header>

      {/* --- Dictionary Section --- */}
      <div className="search-container">
        <input
          type="text"
          placeholder="Search in English or Dusun..."
          className="search-bar"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <main className="dictionary-main">
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
      </main>

      {/* --- AI Assistant Section --- */}
      <AIAssistant />

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
