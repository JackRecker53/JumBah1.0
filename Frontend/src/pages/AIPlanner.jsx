import React, { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { aiPlannerService } from "../services/aiPlannerService";
import "../styles/AIPlanner.css";
import {
  FaUser,
  FaPaperPlane,
  FaMapMarkedAlt,
  FaPlane,
  FaCommentDots,
  FaCalendarAlt,
  FaMoneyBillWave,
  FaUsers,
  FaBed,
  FaCopy,
  FaSync,
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
  const [activeMode, setActiveMode] = useState("chat");

  // AI Status Management
  const [isAIOnline, setIsAIOnline] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(true);
  const [lastStatusCheck, setLastStatusCheck] = useState(null);

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

  // Function to check AI backend status
  const checkAIStatus = async () => {
    setIsCheckingStatus(true);
    try {
      // Option 1: Simple health check - replace with your actual health endpoint
      const response = await fetch("/api/health", {
        method: "GET",
        timeout: 5000,
      });

      if (response.ok) {
        setIsAIOnline(true);
      } else {
        setIsAIOnline(false);
      }
    } catch (error) {
      // Option 2: Test with actual AI service call
      try {
        const testResponse = await aiPlannerService.getTravelRecommendations(
          "ping",
          { short_answer: true, test: true }
        );
        setIsAIOnline(testResponse.success);
      } catch (aiError) {
        console.error("AI backend check failed:", aiError);
        setIsAIOnline(false);
      }
    } finally {
      setIsCheckingStatus(false);
      setLastStatusCheck(new Date());
    }
  };

  // Check AI status on component mount and set up periodic checks
  useEffect(() => {
    // Initial check
    checkAIStatus();

    // Check every 30 seconds
    const interval = setInterval(checkAIStatus, 30000);

    // Cleanup interval on component unmount
    return () => clearInterval(interval);
  }, []);

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  };

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

    // Check if AI is offline before sending
    if (!isAIOnline) {
      addMessage(
        "bot",
        "⚠️ AI Assistant is currently offline. Please wait while I try to reconnect..."
      );
      await checkAIStatus(); // Try to reconnect
      if (!isAIOnline) {
        addMessage(
          "bot",
          "❌ Unable to connect to AI service. Please try again later."
        );
        return;
      }
    }

    const userMessage = inputMessage.trim();
    addMessage("user", userMessage);
    setInputMessage("");
    setIsLoading(true);

    try {
      const response = await aiPlannerService.getTravelRecommendations(
        userMessage,
        { short_answer: true }
      );
      if (response.success) {
        addMessage("bot", response.recommendations);
        // Update status to online since request was successful
        setIsAIOnline(true);
      } else {
        addMessage(
          "bot",
          "I'm sorry, I encountered an error. Please try again."
        );
        // Check if this was a connection issue
        setIsAIOnline(false);
      }
    } catch (error) {
      console.error("Error:", error);
      setIsAIOnline(false); // Mark as offline due to error
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
    // Your existing logic...
  };

  const getFlightRecommendations = async () => {
    // Your existing logic...
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

  // Manual status refresh
  const handleStatusRefresh = () => {
    checkAIStatus();
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
            <img
              src="/backgrounds/sunbear.jpg"
              alt="Madu icon"
              className="header-icon"
            />
            <div>
              <h1>MaduAI</h1>
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

          {/* Form Content will be rendered here based on activeMode */}
        </div>

        {/* Main Chat Area */}
        <div className="planner-main">
          <div className="chat-header">
            <h2>Chat with AI Assistant</h2>
            <div className="chat-status">
              <div
                className={`status-indicator ${
                  isCheckingStatus
                    ? "checking"
                    : isAIOnline
                    ? "online"
                    : "offline"
                }`}
              ></div>
              <span
                className={`status-text ${
                  isCheckingStatus
                    ? "checking"
                    : isAIOnline
                    ? "online"
                    : "offline"
                }`}
              >
                {isCheckingStatus
                  ? "Checking..."
                  : isAIOnline
                  ? "Online"
                  : "Offline"}
              </span>
              <button
                className="status-refresh-btn"
                onClick={handleStatusRefresh}
                disabled={isCheckingStatus}
                title="Refresh status"
              >
                <FaSync className={isCheckingStatus ? "spinning" : ""} />
              </button>
            </div>
          </div>

          <div className="chat-container" ref={chatContainerRef}>
            <div className="messages-area">
              {messages.map((message) => (
                <div key={message.id} className={`message ${message.type}`}>
                  <div className="message-avatar">
                    {message.type === "bot" ? (
                      <img src="/backgrounds/sunbear.jpg" alt="Madu" />
                    ) : (
                      <FaUser />
                    )}
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
                    <img src="/backgrounds/sunbear.jpg" alt="Madu" />
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
                placeholder={
                  isAIOnline
                    ? "Ask me anything about traveling to Sabah..."
                    : "AI is offline - Please wait for reconnection..."
                }
                disabled={isLoading || !isAIOnline}
                rows={1}
              />
              <button
                className="send-btn"
                onClick={handleSendMessage}
                disabled={isLoading || !inputMessage.trim() || !isAIOnline}
              >
                <FaPaperPlane />
              </button>
            </div>
            {lastStatusCheck && (
              <div className="status-info">
                Last checked: {lastStatusCheck.toLocaleTimeString()}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIPlanner;
