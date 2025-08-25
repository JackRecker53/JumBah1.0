import React, { useState } from "react";
import "../styles/TranslatorPage.css";

const dictionary = {
  hello: "Kopivosian ",
  "thank you": "Pounsikou",
  "how are you": "Onu habar nu?",
  "good morning": "Kopivosian do tadau",
};

const TranslatorPage = () => {
  const [input, setInput] = useState("");
  const [translation, setTranslation] = useState("");

  const handleTranslate = () => {
    const key = input.trim().toLowerCase();
    setTranslation(dictionary[key] || "Translation not found");
  };

  return (
    <div className="translator-container">
      <h1>English to Dusun Translator</h1>
      <div className="translator-box">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter English phrase"
        />
        <button onClick={handleTranslate}>Translate</button>
      </div>
      {translation && <p className="translation">Dusun: {translation}</p>}
      <p className="note">*Basic dictionary – more phrases coming soon!</p>
    </div>
  );
};

export default TranslatorPage;
