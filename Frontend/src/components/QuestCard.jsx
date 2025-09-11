import React from 'react';
import { Link } from 'react-router-dom';
import './QuestCard.css';

const QuestCard = ({ quest }) => {
  const getTypeIcon = (type) => {
    switch (type) {
      case 'qr': return '📱';
      case 'photo': return '📸';
      case 'audio': return '🎤';
      case 'trivia': return '🧠';
      default: return '🎯';
    }
  };

  const getRewardIcon = (rewardType) => {
    return rewardType === 'badge' ? '🎖️' : '🗺️';
  };

  return (
    <div className="quest-card">
      <div className="quest-image-container">
        <img src={quest.image} alt={quest.title} loading="lazy" />
        <div className="quest-points">+{quest.points}</div>
      </div>
      
      <div className="quest-content">
        <h3 className="quest-title">{quest.title}</h3>
        <p className="quest-description">{quest.description}</p>
        
        <div className="quest-badges">
          <span className="badge district-badge">{quest.district.toUpperCase()}</span>
          <span className="badge type-badge">
            {getTypeIcon(quest.type)} {quest.type.toUpperCase()}
          </span>
          <span className="badge reward-badge">
            {getRewardIcon(quest.reward?.type)} {quest.reward?.name}
          </span>
        </div>
        
        <Link className="quest-start-btn" to={`/quest/${quest.id}`}>
          Start Quest
        </Link>
      </div>
    </div>
  );
};

export default QuestCard;