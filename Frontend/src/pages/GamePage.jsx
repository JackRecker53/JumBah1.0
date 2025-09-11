import React, { useState } from "react";
import { QrReader } from "react-qr-reader";
import { useAuth } from "../contexts/AuthContext";
import "../styles/GamePage.css";
import { API_BASE_URL } from "../config";

const GamePage = () => {
  const { isAuthenticated } = useAuth();
  const [district, setDistrict] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [showScore, setShowScore] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);

  const handleScan = (result, error) => {
    if (result) {
      const scannedDistrict = result?.text;
      if (scannedDistrict) {
        setDistrict(scannedDistrict);
        fetchQuestions(scannedDistrict);
      }
    }
    if (error) {
      console.error(error);
    }
  };

  const fetchQuestions = async (dist) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/quiz?district=${encodeURIComponent(dist)}&difficulty=easy`
      );
      const data = await response.json();
      setQuestions(data.questions);
    } catch (err) {
      console.error("Error fetching questions:", err);
    }
  };

  const handleAnswerClick = (answer) => {
    if (selectedAnswer !== null) return;
    const correct = answer === questions[currentQuestionIndex].correctAnswer;
    setSelectedAnswer(answer);
    setIsCorrect(correct);
    if (correct) {
      setScore(score + 1);
    }
    setTimeout(() => {
      const next = currentQuestionIndex + 1;
      if (next < questions.length) {
        setCurrentQuestionIndex(next);
        setSelectedAnswer(null);
        setIsCorrect(null);
      } else {
        setShowScore(true);
      }
    }, 1500);
  };

  const restart = () => {
    setDistrict(null);
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setScore(0);
    setShowScore(false);
    setSelectedAnswer(null);
    setIsCorrect(null);
  };

  if (!isAuthenticated) {
    return (
      <div className="login-warning">
        <p>Please log in to play.</p>
        <button onClick={() => (window.location.href = "/login")}>Login</button>
      </div>
    );
  }

  return (
    <div className="game-container">
      {!district && (
        <div className="qr-section">
          <h2>Scan a hotspot QR to begin</h2>
          <div className="qr-reader">
            <QrReader
              constraints={{ facingMode: "environment" }}
              onResult={handleScan}
            />
          </div>
        </div>
      )}

      {district && questions.length === 0 && <p>Loading questions...</p>}

      {district && questions.length > 0 && (
        <section className="game-section">
          <h2>{district} Quiz</h2>
          {showScore ? (
            <div className="score-section">
              <h2>
                You scored {score} out of {questions.length}
              </h2>
              <button onClick={restart}>Scan Another QR</button>
            </div>
          ) : (
            <div className="quiz-section">
              <div className="question-count">
                <span>Question {currentQuestionIndex + 1}</span>/{questions.length}
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
        </section>
      )}
    </div>
  );
};

export default GamePage;

