import React, { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { aiPlannerService } from "../services/aiPlannerService";
import "../styles/AIPlanner.css";
import {
  FaRobot,
  FaUser,
  FaPaperPlane,
  FaSpinner,
  FaMapMarkedAlt,
  FaPlane,
  FaHeart,
  FaCalendarAlt,
  FaMoneyBillWave,
  FaUsers,
  FaBed,
  FaCopy,
  FaDownload,
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
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Form states for structured requests
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

  const quickQuestions = [
    "What are the best diving spots in Sabah?",
    "When is the best time to climb Mount Kinabalu?",
    "What local food should I try in Kota Kinabalu?",
    "How much does a 5-day trip to Sabah cost?",
    "What should I pack for a Sabah adventure?",
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const addMessage = (type, content) => {
    const newMessage = {
      id: Date.now(),
      type,
      content,
      timestamp: new Date(),
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

  const handleQuickQuestion = (question) => {
    setInputMessage(question);
    setTimeout(() => handleSendMessage(), 100);
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
    if (itineraryForm.interests.length === 0) {
      addMessage(
        "bot",
        "Please select at least one interest before generating an itinerary."
      );
      return;
    }

    setIsLoading(true);
    addMessage(
      "user",
      `Generate a ${itineraryForm.duration} itinerary for ${itineraryForm.group_size} people with a budget of RM${itineraryForm.budget}`
    );

    try {
      const response = await aiPlannerService.generateItinerary(itineraryForm);
      if (response.success) {
        addMessage("bot", response.itinerary);
      } else {
        addMessage(
          "bot",
          "I'm sorry, I couldn't generate the itinerary. Please try again."
        );
      }
    } catch (error) {
      console.error("Error:", error);
      addMessage(
        "bot",
        "I'm having trouble generating your itinerary. Please ensure the backend server is running."
      );
    } finally {
      setIsLoading(false);
      setActiveMode("chat");
    }
  };

  const getFlightRecommendations = async () => {
    if (!flightForm.origin.trim()) {
      addMessage(
        "bot",
        "Please enter your departure city before getting flight recommendations."
      );
      return;
    }

    setIsLoading(true);
    addMessage(
      "user",
      `Find flights from ${flightForm.origin} to Kota Kinabalu for ${flightForm.passengers} passengers`
    );

    try {
      const response = await aiPlannerService.getFlightRecommendations(
        flightForm
      );
      if (response.success) {
        addMessage("bot", response.recommendations);
      } else {
        addMessage(
          "bot",
          "I'm sorry, I couldn't get flight recommendations. Please try again."
        );
      }
    } catch (error) {
      console.error("Error:", error);
      addMessage(
        "bot",
        "I'm having trouble getting flight information. Please ensure the backend server is running."
      );
    } finally {
      setIsLoading(false);
      setActiveMode("chat");
    }
  };

  const copyMessage = (content) => {
    navigator.clipboard.writeText(content);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="ai-planner">
      <div className="planner-container">
        {/* Sidebar */}
        <div className="planner-sidebar">
          {/* Sidebar Header */}
          <div className="sidebar-header">
            <div className="header-content">
              <FaRobot className="ai-icon" />
              <div>
                <h1>AI Travel Assistant</h1>
                <p>Your personal guide to exploring Sabah, Malaysia</p>
              </div>
            </div>
          </div>

          {/* Mode Selection */}
          <div className="sidebar-modes">
            <h3>Planning Tools</h3>
            <div className="mode-toggles">
              <button
                className={`mode-btn ${activeMode === "chat" ? "active" : ""}`}
                onClick={() => setActiveMode("chat")}
              >
                <FaHeart /> Free Chat
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
                className={`mode-btn ${
                  activeMode === "flights" ? "active" : ""
                }`}
                onClick={() => setActiveMode("flights")}
              >
                <FaPlane /> Find Flights
              </button>
            </div>
          </div>

          {/* Sidebar Content */}
          <div className="sidebar-content">
            {/* Structured Forms */}
            {activeMode === "itinerary" && (
              <div className="form-panel">
                <h3>
                  <FaMapMarkedAlt /> Create Custom Itinerary
                </h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label>
                      <FaCalendarAlt /> Duration
                    </label>
                    <select
                      value={itineraryForm.duration}
                      onChange={(e) =>
                        setItineraryForm((prev) => ({
                          ...prev,
                          duration: e.target.value,
                        }))
                      }
                    >
                      <option value="1-2 days">1-2 days</option>
                      <option value="3-5 days">3-5 days</option>
                      <option value="1 week">1 week</option>
                      <option value="2 weeks">2 weeks</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>
                      <FaMoneyBillWave /> Budget (MYR)
                    </label>
                    <input
                      type="number"
                      value={itineraryForm.budget}
                      onChange={(e) =>
                        setItineraryForm((prev) => ({
                          ...prev,
                          budget: e.target.value,
                        }))
                      }
                      placeholder="Enter budget"
                    />
                  </div>

                  <div className="form-group">
                    <label>
                      <FaUsers /> Group Size
                    </label>
                    <select
                      value={itineraryForm.group_size}
                      onChange={(e) =>
                        setItineraryForm((prev) => ({
                          ...prev,
                          group_size: e.target.value,
                        }))
                      }
                    >
                      <option value="1">Solo</option>
                      <option value="2">Couple</option>
                      <option value="3-4">Small Group (3-4)</option>
                      <option value="5+">Large Group (5+)</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>
                      <FaBed /> Accommodation
                    </label>
                    <select
                      value={itineraryForm.accommodation}
                      onChange={(e) =>
                        setItineraryForm((prev) => ({
                          ...prev,
                          accommodation: e.target.value,
                        }))
                      }
                    >
                      <option value="budget">
                        Budget (Hostels, Guesthouses)
                      </option>
                      <option value="mid-range">Mid-range (Hotels)</option>
                      <option value="luxury">Luxury (Resorts)</option>
                      <option value="eco-lodge">Eco-lodge</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Interests</label>
                  <div className="interests-grid">
                    {interestOptions.map((interest) => (
                      <button
                        key={interest}
                        className={`interest-btn ${
                          itineraryForm.interests.includes(interest)
                            ? "selected"
                            : ""
                        }`}
                        onClick={() => handleInterestToggle(interest)}
                      >
                        {interest}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  className="generate-btn"
                  onClick={generateItinerary}
                  disabled={isLoading || itineraryForm.interests.length === 0}
                >
                  {isLoading ? (
                    <>
                      <FaSpinner className="spinner" /> Generating...
                    </>
                  ) : (
                    <>
                      <FaMapMarkedAlt /> Generate Itinerary
                    </>
                  )}
                </button>
              </div>
            )}

            {activeMode === "flights" && (
              <div className="form-panel">
                <h3>
                  <FaPlane /> Flight Recommendations
                </h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Origin City</label>
                    <input
                      type="text"
                      value={flightForm.origin}
                      onChange={(e) =>
                        setFlightForm((prev) => ({
                          ...prev,
                          origin: e.target.value,
                        }))
                      }
                      placeholder="Enter departure city"
                    />
                  </div>

                  <div className="form-group">
                    <label>Departure Date</label>
                    <input
                      type="date"
                      value={flightForm.departure_date}
                      onChange={(e) =>
                        setFlightForm((prev) => ({
                          ...prev,
                          departure_date: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label>Return Date</label>
                    <input
                      type="date"
                      value={flightForm.return_date}
                      onChange={(e) =>
                        setFlightForm((prev) => ({
                          ...prev,
                          return_date: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label>
                      <FaUsers /> Passengers
                    </label>
                    <select
                      value={flightForm.passengers}
                      onChange={(e) =>
                        setFlightForm((prev) => ({
                          ...prev,
                          passengers: e.target.value,
                        }))
                      }
                    >
                      <option value="1">1 passenger</option>
                      <option value="2">2 passengers</option>
                      <option value="3">3 passengers</option>
                      <option value="4">4 passengers</option>
                      <option value="5+">5+ passengers</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Class</label>
                    <select
                      value={flightForm.class}
                      onChange={(e) =>
                        setFlightForm((prev) => ({
                          ...prev,
                          class: e.target.value,
                        }))
                      }
                    >
                      <option value="economy">Economy</option>
                      <option value="premium-economy">Premium Economy</option>
                      <option value="business">Business</option>
                      <option value="first">First Class</option>
                    </select>
                  </div>
                </div>

                <button
                  className="generate-btn"
                  onClick={getFlightRecommendations}
                  disabled={isLoading || !flightForm.origin.trim()}
                >
                  {isLoading ? (
                    <>
                      <FaSpinner className="spinner" /> Searching...
                    </>
                  ) : (
                    <>
                      <FaPlane /> Find Flights
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="planner-main">
          {/* Chat Header */}
          <div className="chat-header">
            <h2>
              {activeMode === "chat" && "Chat with AI Assistant"}
              {activeMode === "itinerary" && "Itinerary Planning"}
              {activeMode === "flights" && "Flight Search"}
            </h2>
            <div className="chat-status">
              <div className="status-indicator"></div>
              <span>Online</span>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="chat-container">
            <div className="messages-area">
              {messages.map((message) => (
                <div key={message.id} className={`message ${message.type}`}>
                  <div className="message-avatar">
                    {message.type === "bot" ? <FaRobot /> : <FaUser />}
                  </div>
                  <div className="message-content">
                    <div className="message-text">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          a: ({ node, ...props }) => (
                            <a {...props} target="_blank" rel="noreferrer" />
                          ),
                        }}
                      >
                        {String(message.content ?? "")}
                      </ReactMarkdown>
                    </div>
                    <div className="message-actions">
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
                      <FaSpinner className="spinner" />
                      <span>AI is thinking...</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input Area */}
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
                style={{
                  height: "auto",
                  minHeight: "44px",
                  maxHeight: "120px",
                }}
                onInput={(e) => {
                  e.target.style.height = "auto";
                  e.target.style.height =
                    Math.min(e.target.scrollHeight, 120) + "px";
                }}
              />
              <button
                className="send-btn"
                onClick={handleSendMessage}
                disabled={isLoading || !inputMessage.trim()}
              >
                {isLoading ? (
                  <FaSpinner className="spinner" />
                ) : (
                  <FaPaperPlane />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIPlanner;
