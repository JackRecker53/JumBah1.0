import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import QuestCard from '../components/QuestCard';
import questsData from '../data/quests.json';
import '../styles/QuestBoard.css';

export default function QuestBoard() {
  const [quests, setQuests] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Filter quests for KK district
    const kkQuests = questsData.filter(q => q.district === 'kk');
    setQuests(kkQuests);
  }, []);



  return (
    <div className="quest-board-container">
      <div className="quest-board-header">
        <button 
          onClick={() => navigate('/game')} 
          className="back-button"
        >
          ← Back to Game
        </button>
        <h1 className="quest-board-title">Quest Board — KK</h1>
        <p className="quest-board-subtitle">
          Explore Kota Kinabalu through interactive quests
        </p>
      </div>

      <div className="quest-stats">
        <div className="stat-item">
          <span className="stat-number">{quests.length}</span>
          <span className="stat-label">Available Quests</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{quests.filter(q => q.type === 'qr').length}</span>
          <span className="stat-label">QR Quests</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{quests.filter(q => q.type === 'photo').length}</span>
          <span className="stat-label">Photo Quests</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{quests.filter(q => q.type === 'trivia').length}</span>
          <span className="stat-label">Trivia Quests</span>
        </div>
      </div>

      <div className="quest-grid">
        {quests.length > 0 ? (
          quests.map(quest => (
            <QuestCard key={quest.id} quest={quest} />
          ))
        ) : (
          <div className="no-quests">
            <p>No quests available at the moment.</p>
          </div>
        )}
      </div>

      <div className="quest-board-footer">
        <p className="footer-text">
          Complete quests to earn stamps and unlock achievements!
        </p>
      </div>
    </div>
  );
}