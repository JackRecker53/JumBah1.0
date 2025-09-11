import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useGame } from "../contexts/GameContext";
import { FaCheckCircle, FaAward, FaTicketAlt, FaCompass, FaQrcode, FaTrophy, FaPlus } from "react-icons/fa";
import "../styles/GamePage.css";
import { API_BASE_URL } from "../config";
import { useNavigate } from "react-router-dom";
import QRScanner from "../components/QRScanner";
import { questService } from '../services/questService';
import questsData from '../data/quests.json';

// Adventure Gate Component for unauthenticated users
const AdventureGate = () => {
  const navigate = useNavigate();
  
  return (
    <div className="adventure-gate">
      <div className="gate-content">
        <h1>🏔️ Welcome to JumBah Adventure!</h1>
        <p className="welcome-subtitle">
          Your journey through Sabah's wonders awaits...
        </p>
        <div className="sabah-showcase">
          <div className="showcase-item">
            <span className="showcase-icon">🐘</span>
            <span>Borneo Elephants</span>
          </div>
          <div className="showcase-item">
            <span className="showcase-icon">🏔️</span>
            <span>Mount Kinabalu</span>
          </div>
          <div className="showcase-item">
            <span className="showcase-icon">🌺</span>
            <span>Rafflesia Flowers</span>
          </div>
          <div className="showcase-item">
            <span className="showcase-icon">🦧</span>
            <span>Orangutans</span>
          </div>
        </div>
        <div className="gate-features">
          <div className="feature">
            <FaCompass className="feature-icon" />
            <span>Discover Hidden Gems</span>
          </div>
          <div className="feature">
            <FaQrcode className="feature-icon" />
            <span>Scan QR Codes</span>
          </div>
          <div className="feature">
            <FaAward className="feature-icon" />
            <span>Earn Achievements</span>
          </div>
        </div>
        <p className="gate-message">
          Please log in to begin your adventure!
        </p>
        <button 
          className="login-btn"
          onClick={() => navigate('/login')}
        >
          🚀 Login to Start
        </button>
      </div>
    </div>
  );
};

// Main GamePage Component
const GamePage = () => {
  const { isAuthenticated } = useAuth();
  const { 
    points, 
    collectedStamps, 
    achievements, 
    activeQuests,
    quests,
    completedQuests,
    addQuest,
    completeQuest 
  } = useGame();
  const navigate = useNavigate();

  // Quiz Game State
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [score, setScore] = useState(0);
  const [showScore, setShowScore] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [scanResult, setScanResult] = useState(null);


  // Sample quiz questions
  const [questions] = useState([
    {
      question: "What is the highest mountain in Sabah?",
      answers: ["Mount Kinabalu", "Mount Trus Madi", "Mount Tambuyukon", "Mount Alab"],
      correctAnswer: "Mount Kinabalu"
    },
    {
      question: "Which city is known as the 'Nature Resort City' of Sabah?",
      answers: ["Kota Kinabalu", "Sandakan", "Tawau", "Lahad Datu"],
      correctAnswer: "Kota Kinabalu"
    },
    {
      question: "What is the famous wildlife sanctuary in Sabah known for orangutans?",
      answers: ["Sepilok", "Danum Valley", "Maliau Basin", "Crocker Range"],
      correctAnswer: "Sepilok"
    },
    {
      question: "Which island near Sabah is famous for diving?",
      answers: ["Sipadan", "Mabul", "Kapalai", "All of the above"],
      correctAnswer: "All of the above"
    },
    {
      question: "What is the traditional boat used by the Bajau people?",
      answers: ["Lepa", "Sampan", "Junk", "Prahu"],
      correctAnswer: "Lepa"
    }
  ]);

  // Sample leaderboard data
  const [leaderboard] = useState([
    { username: "AdventureSeeker", score: 2500 },
    { username: "ExploreMore", score: 2200 },
    { username: "QuestMaster", score: 1800 },
    { username: "TravelBug", score: 1500 },
    { username: "Wanderer", score: 1200 }
  ]);

  // Quiz Functions
  const handleAnswerClick = (selectedAnswer) => {
    setSelectedAnswer(selectedAnswer);
    const correct = selectedAnswer === questions[currentQuestionIndex].correctAnswer;
    setIsCorrect(correct);
    
    if (correct) {
      setScore(score + 1);
    }

    setTimeout(() => {
      const nextQuestion = currentQuestionIndex + 1;
      if (nextQuestion < questions.length) {
        setCurrentQuestionIndex(nextQuestion);
        setSelectedAnswer(null);
        setIsCorrect(false);
      } else {
        setShowScore(true);
      }
    }, 1500);
  };

  const restartQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setScore(0);
    setShowScore(false);
    setIsCorrect(false);
  };

  // QR Scanner Functions
  const handleQRScanSuccess = (data) => {
    console.log('QR Code scanned:', data);
    setScanResult({ 
      success: true, 
      message: `Successfully scanned: ${data}` 
    });
    setShowQRScanner(false);
    
    // Add quest based on QR code
    const newQuest = {
      id: Date.now(),
      title: `Explore ${data}`,
      description: `You've discovered a new location: ${data}`,
      points: 100,
      completed: false
    };
    addQuest(newQuest);
    
    setTimeout(() => setScanResult(null), 3000);
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
        <div className="header-top">
          <h1>Your Adventure Hub</h1>
        </div>
        <div className="game-stats">
          <div className="stat-item">
            <FaAward className="stat-icon" />
            <span>{points} Points</span>
          </div>
          <div className="stat-item">
            <FaTicketAlt className="stat-icon" />
            <span>{collectedStamps.size} Stamps</span>
          </div>
          <div className="stat-item">
            <FaTrophy className="stat-icon" />
            <span>{achievements.length} Achievements</span>
          </div>
        </div>
      </header>

      {/* Quest Board Navigation */}
      <section className="quest-board-navigation">
        <div className="quest-nav-header">
          <h2>🏔️ An Interactive Sabah Experience</h2>
          <p>Explore the beauty and culture of Sabah through exciting quests!</p>
        </div>
        <div className="quest-nav-buttons">
          <button 
            className="nav-btn quest-board-btn"
            onClick={() => navigate('/quest-board')}
          >
            <FaCompass className="nav-icon" />
            <div className="nav-text">
              <span className="nav-title">Quest Board</span>
              <span className="nav-subtitle">View all available quests</span>
            </div>
          </button>
          <button 
            className="nav-btn stampbook-btn"
            onClick={() => navigate('/stampbook')}
          >
            <FaTrophy className="nav-icon" />
            <div className="nav-text">
              <span className="nav-title">Stampbook</span>
              <span className="nav-subtitle">Your achievement collection</span>
            </div>
          </button>
          <button 
            className="nav-btn qr-scan-btn"
            onClick={() => setShowQRScanner(true)}
          >
            <FaQrcode className="nav-icon" />
            <div className="nav-text">
              <span className="nav-title">QR Scanner</span>
              <span className="nav-subtitle">Scan quest QR codes</span>
            </div>
          </button>
        </div>
      </section>

      <div className="game-content-grid">
        {/* --- Main Content (Quests & Quiz) --- */}
        <main className="game-main-content">
          {/* Quest Discovery */}
          <section className="game-section quest-discovery">
            <div className="quest-discovery-header">
              <h2>Quest Discovery</h2>
              <div className="quest-buttons">
                <button 
                  className="qr-scan-btn"
                  onClick={() => setShowQRScanner(true)}
                >
                  <FaQrcode /> Scan QR Code
                </button>
              </div>
            </div>
            
            {scanResult && (
              <div className={`scan-result ${scanResult.success ? 'success' : 'error'}`}>
                {scanResult.message}
              </div>
            )}
            
            {/* Available Quests Grid */}
            <div className="available-quests-grid">
              {questsData.map(quest => (
                <div key={quest.id} className="discovery-quest-card">
                  <div className="quest-image-container">
                    <img src={quest.image} alt={quest.title} />
                    <div className="quest-type-badge">{quest.type.toUpperCase()}</div>
                  </div>
                  <div className="quest-info">
                    <h3>{quest.title}</h3>
                    <p>{quest.description}</p>
                    <div className="quest-meta">
                      <span className="quest-points">+{quest.points} pts</span>
                      <span className="quest-category">{quest.category}</span>
                    </div>
                    <button 
                      className="start-quest-btn"
                      onClick={() => {
                        addQuest({
                          id: quest.id,
                          title: quest.title,
                          description: quest.description,
                          points: quest.points,
                          completed: false
                        });
                        setScanResult({ success: true, message: `Quest "${quest.title}" added to your active quests!` });
                        setTimeout(() => setScanResult(null), 3000);
                      }}
                      disabled={activeQuests.some(q => q.id === quest.id)}
                    >
                      {activeQuests.some(q => q.id === quest.id) ? 'Added' : 'Start Quest'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* My Quests */}
          <section className="game-section">
            <h2>My Quests</h2>
            {quests.length > 0 ? (
              <div className="quests-grid">
                {quests.map(quest => {
                  const isCompleted = completedQuests.has(quest.id);
                  return (
                    <div key={quest.id} className={`quest-card ${isCompleted ? 'completed' : ''}`}>
                      <h3>{quest.title}</h3>
                      <p>{quest.description}</p>
                      <div className="quest-points">{quest.points} points</div>
                      {!isCompleted ? (
                        <button 
                          className="complete-quest-btn modern-btn"
                          onClick={() => completeQuest(quest.id)}
                        >
                          <span className="btn-icon">✓</span>
                          <span className="btn-text">Complete Quest</span>
                          <span className="btn-points">+{quest.points}</span>
                        </button>
                      ) : (
                        <div className="completed-badge">
                          <span className="completed-icon">✅</span>
                          <span className="completed-text">Completed</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="no-quests">No quests yet. Start a quest from the Quest Discovery section above!</p>
            )}
          </section>

          {/* Achievements */}
          <section className="game-section">
            <h2>Achievements</h2>
            {achievements.length > 0 ? (
              <div className="achievements-grid">
                {achievements.map((achievement, index) => (
                  <div key={achievement.id || index} className="achievement-card">
                    <span className="achievement-icon">{achievement.icon || '🏆'}</span>
                    <div className="achievement-info">
                      <h4>{achievement.title}</h4>
                      <p>{achievement.description}</p>
                      <span className="achievement-points">+{achievement.points} pts</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-achievements">Complete quests to unlock achievements!</p>
            )}
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
      
      {/* QR Scanner Modal */}
      <QRScanner 
        isOpen={showQRScanner}
        onScanSuccess={handleQRScanSuccess}
        onClose={() => setShowQRScanner(false)}
      />
    </div>
  );
};

export default GamePage;
