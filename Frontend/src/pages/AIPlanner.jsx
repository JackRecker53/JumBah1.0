import React, { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { aiPlannerService } from "../services/aiPlannerService";
import "../styles/AIPlanner.css"; // Make sure to create and link this CSS file
import {
  FaRobot,
  FaUser,
  FaPaperPlane,
  FaSpinner,
  FaMapMarkedAlt,
  FaPlane,
  FaCommentDots, // Changed from FaHeart for clarity
  FaCalendarAlt,
  FaMoneyBillWave,
  FaUsers,
  FaBed,
  FaCopy,
} from "react-icons/fa";

const AIPlanner = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: "bot",
      content:
        "Hello! I'm your AI Travel Assistant for Sabah, Malaysia. I can help you:\n\n🗺️ Create detailed itineraries\n✈️ Find flight recommendations\n💡 Answer any travel questions\n\nWhat would you like to explore today?",
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeMode, setActiveMode] = useState("chat"); // 'chat', 'itinerary', 'flights'

  // --- RECODE FIX 1: Add a ref for the scrollable chat container ---
  const chatContainerRef = useRef(null);
  const inputRef = useRef(null);

  const [itineraryForm, setItineraryForm] = useState({
    duration: "3-5 days",
    budget: "1000",
    interests: [],
    accommodation: "mid-range",
    group_size: "2",
  });
  const [flightForm, setFlightForm] = useState({
    origin: "",
    departure_date: "",
    return_date: "",
    passengers: "1",
    class: "economy",
  });
  const interestOptions = [
    "Nature & Wildlife",
    "Adventure Sports",
    "Cultural Experiences",
    "Photography",
    "Diving & Snorkeling",
    "Food & Cuisine",
    "Relaxation",
    "Shopping",
    "Nightlife",
    "History",
  ];

  // --- RECODE FIX 2: Updated scroll function for reliability ---
  // This now directly manipulates the scrollTop of the container, which is more robust.
  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  };

  // --- RECODE FIX 3: useEffect now watches 'isLoading' as well ---
  // This ensures the view scrolls down when the "thinking..." message appears.
  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const addMessage = (type, content) => {
    const isOffTopic =
      type === "bot" &&
      typeof content === "string" &&
      content.trim() === "Sorry, I can only help with Sabah travel questions.";
    const newMessage = {
      id: Date.now(),
      type,
      content,
      timestamp: new Date(),
      isOffTopic,
    };
    setMessages((prev) => [...prev, newMessage]);
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;
    const userMessage = inputMessage.trim();
    addMessage("user", userMessage);
    setInputMessage("");
    setIsLoading(true);

    try {
      const response = await aiPlannerService.getTravelRecommendations(
        userMessage
      );
      if (response.success) {
        addMessage("bot", response.recommendations);
      } else {
        addMessage(
          "bot",
          "I'm sorry, I encountered an error. Please try again."
        );
      }
    } catch (error) {
      console.error("Error:", error);
      addMessage(
        "bot",
        "I'm having trouble connecting. Please check that the backend server is running and try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleInterestToggle = (interest) => {
    setItineraryForm((prev) => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter((i) => i !== interest)
        : [...prev.interests, interest],
    }));
  };

  const generateItinerary = async () => {
    if (isLoading) return;
    addMessage(
      "user",
      `Plan itinerary for ${itineraryForm.duration} with RM${itineraryForm.budget} budget`
    );
    setIsLoading(true);
    try {
      const response = await aiPlannerService.generateItinerary(itineraryForm);
      if (response.success && response.itinerary) {
        addMessage("bot", response.itinerary);
      } else {
        addMessage("bot", "I couldn't generate an itinerary. Please try again.");
      }
    } catch (error) {
      console.error("Itinerary error:", error);
      addMessage(
        "bot",
        "I'm having trouble generating the itinerary. Please ensure the backend server is running and try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const getFlightRecommendations = async () => {
    if (isLoading) return;
    addMessage(
      "user",
      `Find flights from ${flightForm.origin} on ${flightForm.departure_date}`
    );
    setIsLoading(true);
    try {
      const response = await aiPlannerService.getFlightRecommendations(
        flightForm
      );
      if (response.success && response.recommendations) {
        addMessage("bot", response.recommendations);
      } else {
        addMessage("bot", "I couldn't find flights. Please try again.");
      }
    } catch (error) {
      console.error("Flight error:", error);
      addMessage(
        "bot",
        "I'm having trouble fetching flights. Please ensure the backend server is running and try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const copyMessage = (content) => {
    navigator.clipboard.writeText(String(content ?? ""));
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Auto-resize logic for textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
      const scrollHeight = inputRef.current.scrollHeight;
      inputRef.current.style.height = Math.min(scrollHeight, 120) + "px";
    }
  }, [inputMessage]);

  return (
    <div className="ai-planner">
      <div className="planner-container">
        {/* Sidebar */}
        <div className="planner-sidebar">
          <div className="sidebar-header">
            <FaRobot className="header-icon" />
            <div>
              <h1>SabahAI</h1>
              <p>Your personal travel planner</p>
            </div>
          </div>

          <div className="sidebar-modes">
            <button
              className={`mode-btn ${activeMode === "chat" ? "active" : ""}`}
              onClick={() => setActiveMode("chat")}
            >
              <FaCommentDots /> AIChat
            </button>
            <button
              className={`mode-btn ${
                activeMode === "itinerary" ? "active" : ""
              }`}
              onClick={() => setActiveMode("itinerary")}
            >
              <FaMapMarkedAlt /> Plan Itinerary
            </button>
            <button
              className={`mode-btn ${activeMode === "flights" ? "active" : ""}`}
              onClick={() => setActiveMode("flights")}
            >
              <FaPlane /> Find Flights
            </button>
          </div>
          <div className="sidebar-form">
            {activeMode === "itinerary" && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  generateItinerary();
                }}
              >
                <div className="form-group">
                  <label>Duration</label>
                  <select
                    value={itineraryForm.duration}
                    onChange={(e) =>
                      setItineraryForm({
                        ...itineraryForm,
                        duration: e.target.value,
                      })
                    }
                  >
                    <option value="1-3 days">1-3 days</option>
                    <option value="3-5 days">3-5 days</option>
                    <option value="5-7 days">5-7 days</option>
                    <option value="7+ days">7+ days</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Budget (MYR)</label>
                  <input
                    type="number"
                    value={itineraryForm.budget}
                    onChange={(e) =>
                      setItineraryForm({
                        ...itineraryForm,
                        budget: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="form-group">
                  <label>Interests</label>
                  <div className="interest-options">
                    {interestOptions.map((interest) => (
                      <label key={interest}>
                        <input
                          type="checkbox"
                          checked={itineraryForm.interests.includes(interest)}
                          onChange={() => handleInterestToggle(interest)}
                        />
                        {interest}
                      </label>
                    ))}
                  </div>
                </div>
                <div className="form-group">
                  <label>Accommodation</label>
                  <select
                    value={itineraryForm.accommodation}
                    onChange={(e) =>
                      setItineraryForm({
                        ...itineraryForm,
                        accommodation: e.target.value,
                      })
                    }
                  >
                    <option value="budget">Budget</option>
                    <option value="mid-range">Mid-range</option>
                    <option value="luxury">Luxury</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Group Size</label>
                  <input
                    type="number"
                    min="1"
                    value={itineraryForm.group_size}
                    onChange={(e) =>
                      setItineraryForm({
                        ...itineraryForm,
                        group_size: e.target.value,
                      })
                    }
                  />
                </div>
                <button
                  type="submit"
                  className="submit-btn"
                  disabled={isLoading}
                >
                  Generate Itinerary
                </button>
              </form>
            )}

            {activeMode === "flights" && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  getFlightRecommendations();
                }}
              >
                <div className="form-group">
                  <label>Origin</label>
                  <input
                    type="text"
                    value={flightForm.origin}
                    onChange={(e) =>
                      setFlightForm({ ...flightForm, origin: e.target.value })
                    }
                  />
                </div>
                <div className="form-group">
                  <label>Departure Date</label>
                  <input
                    type="date"
                    value={flightForm.departure_date}
                    onChange={(e) =>
                      setFlightForm({
                        ...flightForm,
                        departure_date: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="form-group">
                  <label>Return Date</label>
                  <input
                    type="date"
                    value={flightForm.return_date}
                    onChange={(e) =>
                      setFlightForm({
                        ...flightForm,
                        return_date: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="form-group">
                  <label>Passengers</label>
                  <input
                    type="number"
                    min="1"
                    value={flightForm.passengers}
                    onChange={(e) =>
                      setFlightForm({
                        ...flightForm,
                        passengers: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="form-group">
                  <label>Class</label>
                  <select
                    value={flightForm.class}
                    onChange={(e) =>
                      setFlightForm({ ...flightForm, class: e.target.value })
                    }
                  >
                    <option value="economy">Economy</option>
                    <option value="business">Business</option>
                    <option value="first">First</option>
                  </select>
                </div>
                <button
                  type="submit"
                  className="submit-btn"
                  disabled={isLoading}
                >
                  Search Flights
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="planner-main">
          <div className="chat-header">
            <h2>Chat with AI Assistant</h2>
            <div className="chat-status">
              <div className="status-indicator"></div>
              <span>Online</span>
            </div>
          </div>

          {/* --- RECODE FIX 4: Attach the ref to the scrollable container --- */}
          <div className="chat-container" ref={chatContainerRef}>
            <div className="messages-area">
              {messages.map((message) => (
                <div key={message.id} className={`message ${message.type}`}>
                  <div className="message-avatar">
                    {message.type === "bot" ? <FaRobot /> : <FaUser />}
                  </div>
                  <div className="message-content">
                    <div className="message-text">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {String(message.content ?? "")}
                      </ReactMarkdown>
                    </div>
                    <div className="message-footer">
                      <span className="message-time">
                        {message.timestamp.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      {message.type === "bot" && (
                        <button
                          className="action-btn"
                          onClick={() => copyMessage(message.content)}
                          title="Copy message"
                        >
                          <FaCopy />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="message bot">
                  <div className="message-avatar">
                    <FaRobot />
                  </div>
                  <div className="message-content">
                    <div className="typing-indicator">
                      <span className="dot"></span>
                      <span className="dot"></span>
                      <span className="dot"></span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="input-area">
            <div className="input-container">
              <textarea
                ref={inputRef}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything about traveling to Sabah..."
                disabled={isLoading}
                rows={1}
              />
              <button
                className="send-btn"
                onClick={handleSendMessage}
                disabled={isLoading || !inputMessage.trim()}
              >
                <FaPaperPlane />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIPlanner;
