import React, { useState, useEffect } from "react";
import { Eye, Volume2, Copy, RefreshCw } from "lucide-react";
import "../styles/TranslatorPage.css";

// --- IMPORTANT: API Key Configuration ---
// Use your Gemini API key from the Vite environment variable.
// Make sure you have VITE_GEMINI_API_KEY set in your .env file.
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

// --- Language Data ---
const languages = [
  { code: "auto", name: "Detect Language" },
  { code: "en", name: "English" },
  { code: "ms", name: "Malay" },
  { code: "zh", name: "Chinese (Mandarin)" },
  { code: "es", name: "Spanish" },
  { code: "fr", name: "French" },
  { code: "de", name: "German" },
  { code: "ja", name: "Japanese" },
  { code: "ko", name: "Korean" },
  { code: "ru", name: "Russian" },
  { code: "ar", name: "Arabic" },
  { code: "hi", name: "Hindi" },
];

// --- Main App Component ---
export default function TranslatorPage() {
  // --- State Management ---
  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");
  const [sourceLang, setSourceLang] = useState("auto");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // --- Event Handlers ---
  const handleTranslate = async () => {
    if (!GEMINI_API_KEY || GEMINI_API_KEY === "YOUR_GEMINI_API_KEY_HERE") {
      setError("Please configure your Gemini API Key in the code.");
      return;
    }
    if (!inputText.trim()) {
      setError("Please enter text to translate.");
      return;
    }
    setError("");
    setIsLoading(true);
    setOutputText("");
    const model = "gemini-pro";
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;
    const prompt = `Translate the following text from ${
      sourceLang === "auto"
        ? "the detected language"
        : languages.find((l) => l.code === sourceLang)?.name
    } to Dusun. Provide only the Dusun translation and nothing else.\n\nText: "${inputText}"\n\nDusun Translation:`;
    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error?.message || `HTTP error! status: ${response.status}`
        );
      }
      const data = await response.json();
      const translation =
        data.candidates?.[0]?.content?.parts?.[0]?.text.trim() ||
        "Translation not available.";
      setOutputText(translation);
    } catch (err) {
      console.error("Translation Error:", err);
      setError(`Failed to translate. ${err.message}`);
      setOutputText("");
    } finally {
      setIsLoading(false);
    }
  };
  const handleSpeak = () => {
    if ("speechSynthesis" in window && inputText) {
      const utterance = new SpeechSynthesisUtterance(inputText);
      if (sourceLang !== "auto") {
        utterance.lang = sourceLang;
      }
      window.speechSynthesis.speak(utterance);
    }
  };
  const handleCopy = (textToCopy) => {
    if (!textToCopy) return;
    navigator.clipboard.writeText(textToCopy).catch(() => {});
  };
  const handleInputChange = (e) => {
    const text = e.target.value;
    if (text.length <= 5000) {
      setInputText(text);
    }
  };

  // --- Render Method ---
  return (
    <div
      className="translator-container"
      style={{
        minHeight: "100vh",
        background: "linear-gradient(120deg, #e0e7ff 0%, #f0f4f8 100%)",
      }}
    >
      <div className="translator-header">
        <h1>Dusun Translator</h1>
        <p>Translate from multiple languages to Dusun with AI.</p>
      </div>
      {error && <div className="error-message">{error}</div>}
      <div className="translator-cards">
        <div className="translator-card input-wrapper">
          <select
            id="sourceLang"
            value={sourceLang}
            onChange={(e) => setSourceLang(e.target.value)}
          >
            {languages.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.name}
              </option>
            ))}
          </select>
          <textarea
            id="inputText"
            placeholder="Enter text to translate..."
            value={inputText}
            onChange={handleInputChange}
          ></textarea>
          <div className="char-count">{inputText.length} / 5000</div>
          <div className="card-actions">
            <button className="icon-btn" onClick={handleSpeak} title="Speak">
              <Volume2 size={20} />
            </button>
            <button
              className="icon-btn"
              onClick={() => handleCopy(inputText)}
              title="Copy"
            >
              <Copy size={20} />
            </button>
            <button
              className="clear-btn"
              onClick={() => {
                setInputText("");
                setOutputText("");
                setError("");
              }}
            >
              Clear
            </button>
          </div>
        </div>
        <div className="translator-card output-wrapper">
          <select disabled>
            <option>Dusun</option>
          </select>
          <textarea
            placeholder="Translation will appear here..."
            value={outputText}
            readOnly
          ></textarea>
          {isLoading && (
            <div className="loader-overlay">
              <RefreshCw className="spinner" size={32} />
            </div>
          )}
          <div className="card-actions">
            <button
              className="icon-btn"
              onClick={() => handleCopy(outputText)}
              title="Copy"
            >
              <Copy size={20} />
            </button>
          </div>
        </div>
      </div>
      <button
        className="translate-btn"
        onClick={handleTranslate}
        disabled={isLoading}
        style={{ margin: "2rem auto 0", display: "block" }}
      >
        {isLoading ? "Translating..." : "Translate"}
      </button>
    </div>
  );
}
