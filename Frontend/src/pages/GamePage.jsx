import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import "../styles/GamePage.css";

const GamePage = () => {
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [showScore, setShowScore] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const { isAuthenticated, token } = useAuth();

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
        if (isAuthenticated) {
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

  if (questions.length === 0) {
    return <div>Loading questions...</div>;
  }

  return (
    <div className="game-container">
      <div className="game-main">
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
              {questions[currentQuestionIndex].answers.map((answer, index) => {
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
              })}
            </div>
          </div>
        )}
      </div>
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
