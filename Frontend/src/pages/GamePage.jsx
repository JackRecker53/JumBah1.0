import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useGame } from "../contexts/GameContext";
import { FaCheckCircle, FaAward, FaTicketAlt, FaCompass } from "react-icons/fa";
import "../styles/GamePage.css";
import { API_BASE_URL } from "../config";
import { useNavigate } from "react-router-dom";

// --- Child Component for the Login Prompt ---
const AdventureGate = () => {
  const navigate = useNavigate();
  return (
    <div className="adventure-gate">
      <div className="gate-icon">
        <FaCompass />
      </div>
      <h2>Your Adventure Awaits!</h2>
      <p>
        Log in or create an account to save your quiz scores, earn points, and
        climb the official Sabah leaderboard!
      </p>
      <button onClick={() => navigate("/login")}>Login to Continue</button>
    </div>
  );
};

// --- Main Game Page Component ---
const GamePage = () => {
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [showScore, setShowScore] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const { isAuthenticated, token, user } = useAuth();
  const { points, completedQuests, collectedStamps, quests } = useGame();

  useEffect(() => {
    fetchQuestions();
    fetchLeaderboard();
  }, []);

  const fetchQuestions = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/quiz`);
      const data = await response.json();
      setQuestions(data);
    } catch (error) {
      console.error("Error fetching questions:", error);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/leaderboard`);
      const data = await response.json();
      setLeaderboard(data);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
    }
  };

  const handleAnswerClick = (answer) => {
    if (selectedAnswer !== null) return;

    const isAnswerCorrect =
      answer === questions[currentQuestionIndex].correctAnswer;
    setSelectedAnswer(answer);
    setIsCorrect(isAnswerCorrect);

    if (isAnswerCorrect) {
      setScore(score + 1);
    }

    setTimeout(() => {
      const nextQuestion = currentQuestionIndex + 1;
      if (nextQuestion < questions.length) {
        setCurrentQuestionIndex(nextQuestion);
        setSelectedAnswer(null);
        setIsCorrect(null);
      } else {
        setShowScore(true);
        if (isAuthenticated) {
          submitScore(score + (isAnswerCorrect ? 1 : 0));
        }
      }
    }, 1500);
  };

  const submitScore = async (finalScore) => {
    if (!isAuthenticated) return;
    try {
      await fetch(`${API_BASE_URL}/scores`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ score: finalScore }),
      });
      fetchLeaderboard();
    } catch (error) {
      console.error("Error submitting score:", error);
    }
  };

  const restartQuiz = () => {
    setCurrentQuestionIndex(0);
    setScore(0);
    setShowScore(false);
    setSelectedAnswer(null);
    setIsCorrect(null);
  };

  // --- RENDER LOGIC ---

  if (!isAuthenticated) {
    return <AdventureGate />;
  }

  if (questions.length === 0) {
    return <div className="loading-message">Loading your adventure...</div>;
  }

  return (
    <div className="game-page-container">
      {/* --- Header with User Stats --- */}
      <header className="game-header">
        <h1>Your Adventure Hub</h1>
        <div className="game-stats">
          <div className="stat-item">
            <FaAward className="stat-icon" />
            <span>{points} Points</span>
          </div>
          <div className="stat-item">
            <FaTicketAlt className="stat-icon" />
            <span>{collectedStamps.size} Stamps</span>
          </div>
        </div>
      </header>

      <div className="game-content-grid">
        {/* --- Main Content (Quests & Quiz) --- */}
        <main className="game-main-content">
          <section className="game-section">
            <h2>Quests</h2>
            <ul className="quest-list">
              {quests.map((quest) => (
                <li
                  key={quest.id}
                  className={`quest-item ${
                    completedQuests.has(quest.id) ? "completed" : ""
                  }`}
                >
                  <div className="quest-info">
                    <h3>{quest.title}</h3>
                    <p>{quest.description}</p>
                  </div>
                  <div className="quest-reward">
                    {completedQuests.has(quest.id) ? (
                      <FaCheckCircle className="check-icon" />
                    ) : (
                      <span>{quest.points} pts</span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <section className="game-section">
            <h2>Quiz Game</h2>
            {showScore ? (
              <div className="score-section">
                <h2>
                  You scored {score} out of {questions.length}
                </h2>
                <button onClick={restartQuiz} className="restart-button">
                  Restart Quiz
                </button>
              </div>
            ) : (
              <div className="quiz-section">
                <div className="question-count">
                  <span>Question {currentQuestionIndex + 1}</span>/
                  {questions.length}
                </div>
                <div className="question-text">
                  {questions[currentQuestionIndex].question}
                </div>
                <div className="answer-section">
                  {questions[currentQuestionIndex].answers.map(
                    (answer, index) => {
                      const isSelected = selectedAnswer === answer;
                      const isCorrectAnswer =
                        answer ===
                        questions[currentQuestionIndex].correctAnswer;
                      let buttonClass = "";
                      if (isSelected) {
                        buttonClass = isCorrect ? "correct" : "incorrect";
                      } else if (selectedAnswer !== null && isCorrectAnswer) {
                        buttonClass = "correct";
                      }
                      return (
                        <button
                          key={index}
                          className={`answer-button ${buttonClass}`}
                          onClick={() => handleAnswerClick(answer)}
                          disabled={selectedAnswer !== null}
                        >
                          {answer}
                        </button>
                      );
                    }
                  )}
                </div>
              </div>
            )}
          </section>
        </main>

        {/* --- Sidebar (Leaderboard) --- */}
        <aside className="leaderboard-sidebar">
          <h3>Leaderboard</h3>
          <ol>
            {leaderboard.map((entry, index) => (
              <li key={index}>
                <span>{entry.username}</span>
                <span>{entry.score} pts</span>
              </li>
            ))}
          </ol>
        </aside>
      </div>
    </div>
  );
};

export default GamePage;
