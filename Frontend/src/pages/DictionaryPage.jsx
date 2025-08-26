import React from "react";
import "../styles/DictionaryPage.css";

const phrases = [
  { english: "hello", dusun: "Kopivosian" },
  { english: "thank you", dusun: "Pounsikou" },
  { english: "goodbye", dusun: "Kotohuadan" },
  { english: "yes", dusun: "Oou" },
  { english: "no", dusun: "Aran" },
  { english: "excuse me", dusun: "Oduo" },
];

const tips = [
  "Greet locals in Dusun to start conversations.",
  "Practice a few phrases every day to build confidence.",
  "Use our translator or chat with native speakers for feedback.",
];

const DictionaryPage = () => {
  return (
    <div className="dictionary-container">
      <h1>Dusun Dictionary</h1>
      <ul className="dictionary-list">
        {phrases.map((p) => (
          <li key={p.english}>
            <strong>{p.english}:</strong> {p.dusun}
          </li>
        ))}
      </ul>
      <div className="tips">
        <h2>Language Tips</h2>
        <ul>
          {tips.map((tip, index) => (
            <li key={index}>{tip}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default DictionaryPage;
