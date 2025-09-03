import { useState } from "react";
import "../styles/Chatbot.css";
import { runChat } from "../services/geminiService";
import { FaTimes, FaSpinner } from "react-icons/fa";
import { useGame } from "../contexts/GameContext";
import "../styles/DropdownMenu.css";

const ChatbotWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { completeQuest, completedQuests } = useGame();

  const toggleOpen = () => {
    const next = !isOpen;
    setIsOpen(next);

    if (next && messages.length === 0) {
      setMessages([
        {
          sender: "bot",
          text: "Hello! I'm Madu, your Sabahan sun bear guide. How can I help you plan your adventure?",
        },
      ]);
    }
  };

  const handleSend = async () => {
    if (input.trim() === "" || isLoading) return;

    const userMessage = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const botResponse = await runChat(input);
      const botMessage = { sender: "bot", text: botResponse };
      setMessages((prev) => [...prev, botMessage]);

      if (!completedQuests.has("q2")) completeQuest("q2");
      if (
        input.toLowerCase().includes("how to say") &&
        !completedQuests.has("q4")
      ) {
        completeQuest("q4");
      }
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: "Oops! I'm having a little trouble connecting. Please try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fab-container">
      {/* Tooltip: always in DOM, only shows on hover via CSS; hidden when chat is open */}
      {!isOpen && (
        <div className="fab-tooltip">
          Hi, I'm Madu. Your AI Sabah companion.
        </div>
      )}

      <button
        className="fab"
        onClick={toggleOpen}
        aria-label={isOpen ? "Close Chatbot" : "Open Chatbot"}
        onFocus={(e) => e.currentTarget.classList.add("is-focus")} // a11y (keyboard)
        onBlur={(e) => e.currentTarget.classList.remove("is-focus")}
      >
        {isOpen ? (
          <FaTimes />
        ) : (
          <img
            src="/backgrounds/sunbear.jpg"
            alt="Madu Chat"
            className="fabIcon"
          />
        )}
      </button>

      {isOpen && (
        <div className="chatWindow">
          <div className="chatHeader">
            <h3>Chat with Madu</h3>
            <button onClick={toggleOpen} aria-label="Close">
              <FaTimes />
            </button>
          </div>

          <div className="chatBody">
            {messages.map((msg, idx) => (
              <div key={idx} className={`message ${msg.sender}`}>
                {msg.text}
              </div>
            ))}
            {isLoading && (
              <div className="message bot">
                <FaSpinner className="spinner" />
              </div>
            )}
          </div>

          <div className="chatInput">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Ask me about Sabah..."
            />
            <button
              onClick={handleSend}
              aria-label="Send"
              className="chatSendButton"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path
                  d="M2 21L23 12L2 3V10L17 12L2 14V21Z"
                  fill="currentColor"
                />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatbotWidget;
