import React, { useState, useEffect } from 'react'
import '../styles/Stampbook.css'

export default function Stampbook() {
  const [stamps, setStamps] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate loading stamps from localStorage or future Supabase integration
    setTimeout(() => {
      const savedStamps = JSON.parse(localStorage.getItem('jumbah_stamps') || '[]')
      setStamps(savedStamps)
      setLoading(false)
    }, 500)
  }, [])

  const mockStamps = [
    {
      id: 'kk-001',
      name: 'Penjelajah Gaya Street',
      icon: '🏪',
      description: 'Meneroka keunikan Gaya Street',
      dateEarned: '2024-01-15',
      rarity: 'common'
    },
    {
      id: 'kk-002', 
      name: 'Pencinta Tamu',
      icon: '🍜',
      description: 'Menikmati hidangan tempatan di Tamu',
      dateEarned: '2024-01-16',
      rarity: 'uncommon'
    },
    {
      id: 'kk-003',
      name: 'Pengembara Signal Hill',
      icon: '🏔️',
      description: 'Mendaki ke puncak Signal Hill',
      dateEarned: null,
      rarity: 'rare'
    }
  ]

  const earnedStamps = stamps.length > 0 ? stamps : mockStamps.filter(s => s.dateEarned)
  const totalPossibleStamps = mockStamps.length
  const completionPercentage = Math.round((earnedStamps.length / totalPossibleStamps) * 100)

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <h2>Loading Stamp Book...</h2>
        <p>Preparing your stamp collection...</p>
      </div>
    )
  }

  return (
    <div className="stampbook-container">
      <div className="stampbook-header">
        <button onClick={() => navigate('/game')} className="back-button">
          ← Back to Game
        </button>
        <h1>📖 Sabah Stamp Book</h1>
        <p className="subtitle">
          Your Adventure Stamp Collection
        </p>
        
        <div className="progress-section">
          <div className="progress-stats">
            <div className="stat-item">
              <span className="stat-number">{earnedStamps.length}</span>
              <span className="stat-label">Stamps Collected</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{totalPossibleStamps}</span>
              <span className="stat-label">Total Stamps</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{completionPercentage}%</span>
              <span className="stat-label">Progress</span>
            </div>
          </div>
          
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${completionPercentage}%` }}
            ></div>
          </div>
        </div>
      </div>

      <div className="stamps-grid">
        {mockStamps.map(stamp => {
          const isEarned = earnedStamps.some(s => s.id === stamp.id)
          
          return (
            <div 
              key={stamp.id} 
              className={`stamp-card ${isEarned ? 'earned' : 'locked'} ${stamp.rarity}`}
            >
              <div className="stamp-icon">
                {isEarned ? stamp.icon : '🔒'}
              </div>
              
              <div className="stamp-info">
                <h3 className="stamp-name">
                  {isEarned ? stamp.name : '???'}
                </h3>
                <p className="stamp-description">
                  {isEarned ? stamp.description : 'Complete quest to unlock this stamp'}
                </p>
                
                {isEarned && (
                  <div className="stamp-details">
                    <span className="stamp-date">
                      📅 {new Date(stamp.dateEarned).toLocaleDateString('ms-MY')}
                    </span>
                    <span className={`stamp-rarity ${stamp.rarity}`}>
                      {stamp.rarity === 'common' && '⭐ Common'}
                      {stamp.rarity === 'uncommon' && '⭐⭐ Uncommon'}
                      {stamp.rarity === 'rare' && '⭐⭐⭐ Rare'}
                      {stamp.rarity === 'legendary' && '⭐⭐⭐⭐ Legendary'}
                    </span>
                  </div>
                )}
              </div>
              
              {isEarned && (
                <div className="stamp-badge">
                  ✅
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div className="stampbook-info">
        <div className="info-card">
          <h3>🌟 About Stamp Book</h3>
          <p>
            Each quest you complete will give you a unique stamp representing 
            Sabah's experiences and culture. Collect all stamps to become a 
            <strong> True Sabah Ambassador</strong>!
          </p>
          
          <div className="rarity-guide">
            <h4>📊 Stamp Rarity Guide:</h4>
            <div className="rarity-list">
              <div className="rarity-item common">
                <span>⭐ Common</span>
                <span>Easy to obtain</span>
              </div>
              <div className="rarity-item uncommon">
                <span>⭐⭐ Uncommon</span>
                <span>Requires moderate effort</span>
              </div>
              <div className="rarity-item rare">
                <span>⭐⭐⭐ Rare</span>
                <span>Challenging quest</span>
              </div>
              <div className="rarity-item legendary">
                <span>⭐⭐⭐⭐ Legendary</span>
                <span>Special achievement</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="sync-info">
          <p className="sync-message">
            💾 <strong>Note:</strong> Your stamps are saved locally. 
            Cloud sync feature coming soon!
          </p>
        </div>
      </div>

      <div className="sabah-decoration">
        <span className="decoration-icon">🌺</span>
        <span className="decoration-icon">🐘</span>
        <span className="decoration-icon">🦧</span>
        <span className="decoration-icon">🏔️</span>
      </div>
    </div>
  )
}