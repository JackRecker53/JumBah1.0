import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useGame } from "../contexts/GameContext";
import { quests } from "../data/quests";
import { FaCheckCircle, FaAward, FaTicketAlt } from "react-icons/fa";
import "../styles/GamePage.css";

const GamePage = () => {
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [showScore, setShowScore] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const { isAuthenticated, token, user, guestLogin } = useAuth();
  const { points, completedQuests, collectedStamps } = useGame();

  useEffect(() => {
    fetchQuestions();
    fetchLeaderboard();
  }, []);

  const fetchQuestions = async () => {
    try {
      const response = await fetch("http://localhost:5000/quiz");
      const data = await response.json();
      setQuestions(data);
    } catch (error) {
      console.error("Error fetching questions:", error);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      const response = await fetch("http://localhost:5000/leaderboard");
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
        if (isAuthenticated && !user?.is_guest) {
          submitScore(score + (isAnswerCorrect ? 1 : 0));
        }
      }
    }, 1500);
  };

  const submitScore = async (finalScore) => {
    try {
      await fetch("http://localhost:5000/scores", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ score: finalScore }),
      });
      fetchLeaderboard(); // Refresh leaderboard after submitting score
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

  if (!isAuthenticated) {
    return (
      <div className="container loginWall">
        <h2>Join the Adventure!</h2>
        <p>
          Log in or continue as a guest to track your quests and earn points!
        </p>
        <button
          className="btn-primary"
          onClick={() => (window.location.href = "/login")}
        >
          Login to Begin
        </button>
        <button className="btn-secondary" onClick={guestLogin}>
          Continue as Guest
        </button>
      </div>
    );
  }

  if (questions.length === 0) {
    return <div>Loading questions...</div>;
  }

  return (
    <div className="game-container">
      {/* Profile & Stats Section */}
      <header className="game-header">
        <h1>Your Adventure Hub</h1>
        <div className="game-stats">
          <div className="stat-item">
            <FaAward size={30} className="stat-icon" />
            <span>{points} Points</span>
          </div>
          <div className="stat-item">
            <FaTicketAlt size={30} className="stat-icon" />
            <span>{collectedStamps.size} Stamps</span>
          </div>
          {user && (
            <div className="stat-item">
              <span>Profile: {user.username || user.email || "User"}</span>
            </div>
          )}
        </div>
      </header>

      <div className="game-main">
        {/* Quests Section */}
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
                    <FaCheckCircle size={24} className="check-icon" />
                  ) : (
                    <span>{quest.points} pts</span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* Achievements Section */}
        <section className="game-section">
          <h2>Achievements</h2>
          <p className="coming-soon">
            More exciting badges and achievements are coming soon!
          </p>
        </section>

        {/* Quiz Section */}
        <section className="game-section">
          <h2>Quiz Game</h2>
          {showScore ? (
            <div className="score-section">
              <h2>
                You scored {score} out of {questions.length}
              </h2>
              <button onClick={restartQuiz}>Restart Quiz</button>
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
                      answer === questions[currentQuestionIndex].correctAnswer;

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
      </div>

      {/* Leaderboard Section */}
      <div className="leaderboard-section">
        <h3>Leaderboard</h3>
        <ol>
          {leaderboard.map((entry, index) => (
            <li key={index}>
              {entry.username}: {entry.score}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
};

export default GamePage;
