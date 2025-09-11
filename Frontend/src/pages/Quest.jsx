import React, { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import QRScanner from '../components/QRScanner'
import questsData from '../data/quests.json'
import { useGame } from '../contexts/GameContext'
import '../styles/Quest.css'

export default function Quest() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { completeQuest, collectStamp } = useGame()
  const quest = useMemo(() => questsData.find(q => q.id === id), [id])
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [showScanner, setShowScanner] = useState(false)
  const [photoTaken, setPhotoTaken] = useState(null)
  const [audioRecorded, setAudioRecorded] = useState(false)
  const [mediaRecorder, setMediaRecorder] = useState(null)
  const [audioBlob, setAudioBlob] = useState(null)
  const [photoFile, setPhotoFile] = useState(null)

  if (!quest) {
    return (
      <div className="quest-container">
        <div className="quest-header">
          <button 
            onClick={() => navigate('/quest-board')} 
            className="back-button"
          >
            ← Back to Quest Board
          </button>
        </div>
        <div className="error-container">
          <h2>Quest Not Found</h2>
          <p>The quest you are looking for does not exist.</p>
          <button 
            onClick={() => navigate('/quest-board')} 
            className="return-button"
          >
            Return to Quest Board
          </button>
        </div>
      </div>
    )
  }

  const handleScan = async (code) => {
    // Expected QR payload format: quest:<questId>:<secret>
    if (!code || typeof code !== 'string') {
      setError('🚫 Invalid QR data.')
      return
    }
    const parts = code.split(':')
    if (parts.length !== 3 || parts[0] !== 'quest' || parts[1] !== id) {
      setError('🎯 This QR is not for this quest. Try another QR.')
      return
    }
    const secret = parts[2]
    if (secret !== (quest.qr_secret || '')) {
      setError('🔐 Wrong QR secret. Try another QR station.')
      return
    }
    // Success!
    completeQuest(quest.id)
    collectStamp(quest.reward?.name || quest.id)
    setResult(`🎉 Success! Stamp earned: ${quest.reward?.name || ''}\n\n✨ Congratulations! You have completed this quest brilliantly!`)
    setError(null)
    setShowScanner(false)
  }

  const handlePhotoUpload = (event) => {
    const file = event.target.files[0]
    if (file) {
      setPhotoFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setPhotoTaken(e.target.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handlePhotoSubmit = () => {
    completeQuest(quest.id)
    collectStamp(quest.reward?.name || quest.id)
    setResult(`📸 Photo uploaded successfully! Stamp earned: ${quest.reward?.name || ''}\n\n🌟 Beautiful photo! Quest completed!`)
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      setMediaRecorder(recorder)
      setAudioRecorded(false)
      setAudioRecording(true)
      
      const chunks = []
      recorder.ondataavailable = (e) => chunks.push(e.data)
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/wav' })
        setAudioBlob(blob)
        setAudioRecording(false)
      }
      
      recorder.start()
    } catch (err) {
      console.error('Error starting recording:', err)
      setError('Could not start recording')
    }
  }

  const stopRecording = () => {
    if (mediaRecorder && audioRecording) {
      mediaRecorder.stop()
      mediaRecorder.stream.getTracks().forEach(track => track.stop())
    }
  }

  const handleAudioSubmit = () => {
    completeQuest(quest.id)
    collectStamp(quest.reward?.name || quest.id)
    setResult(`🎤 Audio recording successful! Stamp earned: ${quest.reward?.name || ''}\n\n🗣️ Great pronunciation! You have mastered the local language!`)
  }

  return (
    <div className="quest-container">
      <div className="quest-header">
        <button 
          onClick={() => navigate('/quest-board')} 
          className="back-button"
        >
          ← Back to Quest Board
        </button>
      </div>

      <div className="quest-card">
        <img src={quest.image} alt={quest.title} className="quest-image" />
        <div className="quest-content">
          <h1 className="quest-title">{quest.title}</h1>
          <p className="quest-description">{quest.description}</p>
          
          <div className="quest-badges">
            <span className="quest-badge district-badge">{quest.district.toUpperCase()}</span>
            <span className="quest-badge type-badge">{quest.type.toUpperCase()}</span>
            <span className="quest-badge reward-badge">
              {quest.reward?.type === 'badge' ? '🎖️' : '🗺️'} {quest.reward?.name}
            </span>
            <span className="quest-badge points-badge">+{quest.points} Points</span>
          </div>
        </div>
      </div>

      {quest.type === 'qr' && (
        <div className="quest-action">
          <h3>🔍 Scan QR</h3>
          <p>Find the QR code at the location and scan it to complete this quest.</p>
          
          {!showScanner ? (
            <button 
              onClick={() => setShowScanner(true)} 
              className="action-button scan-button"
            >
              📱 Start QR Scan
            </button>
          ) : (
            <div className="scanner-container">
              <QRScanner 
                onScanSuccess={handleScan}
                onClose={() => setShowScanner(false)}
                isOpen={showScanner}
              />
              <button 
                onClick={() => setShowScanner(false)} 
                className="action-button stop-button"
              >
                ⏹️ Stop Scanning
              </button>
              <p className="scanner-tip">Tip: Use HTTPS or localhost for camera access.</p>
            </div>
          )}
        </div>
      )}

      {quest.type === 'trivia' && (
        <div className="quest-action">
          <h3>🧠 Heritage Trivia</h3>
          <p>Answer the cultural questions to earn your stamp!</p>
          
          <div className="trivia-container">
             {(quest.trivia || []).map((item, index) => (
               <div key={index} className="trivia-item">
                 <div className="trivia-question">
                   <strong>Q{index + 1}:</strong> {item.q}
                 </div>
                 <details className="trivia-answer">
                   <summary>Show Answer</summary>
                   <div className="answer-text">{item.a}</div>
                 </details>
               </div>
             ))}
           </div>
          
          <button 
            onClick={() => {
              completeQuest(quest.id)
              collectStamp(quest.reward?.name || quest.id)
              setResult(`🧠 Trivia completed! Stamp earned: ${quest.reward?.name || ''}\n\n🎓 Excellent knowledge of Sabah culture!`)
            }}
            className="action-button submit-button"
          >
            🏆 Complete Trivia
          </button>
        </div>
      )}

      {quest.type === 'photo' && (
        <div className="quest-action">
          <h3>📸 Photo Task</h3>
          <p>Take a photo related to this quest and upload it.</p>
          
          <div className="photo-upload-container">
            <input 
              type="file" 
              accept="image/*" 
              capture="environment"
              onChange={handlePhotoUpload}
              className="photo-input"
              id="photo-upload"
            />
            <label htmlFor="photo-upload" className="action-button photo-button">
              📷 Take Photo
            </label>
            
            {photoFile && (
              <div className="photo-preview">
                <img 
                  src={URL.createObjectURL(photoFile)} 
                  alt="Quest photo" 
                  className="preview-image"
                />
                <button 
                  onClick={handlePhotoSubmit}
                  className="action-button submit-button"
                >
                  ✅ Submit Photo
                </button>
              </div>
            )}
            
            {!photoFile && (
              <button 
                className="action-button mock-button"
                onClick={() => {
                completeQuest(quest.id)
                collectStamp(quest.reward?.name || quest.id)
                setResult('Photo submitted! Stamp earned: ' + (quest.reward?.name || ''))
              }}
            >
              📸 Mock Submit
              </button>
            )}
          </div>
        </div>
      )}

      {quest.type === 'audio' && (
        <div className="quest-action">
          <h3>🎤 Audio Task</h3>
          <p>Record yourself saying a local phrase to complete this quest.</p>
          

          
          <div className="audio-container">
            {!audioRecording ? (
              <button 
                onClick={startRecording} 
                className="action-button record-button"
              >
                🎤 Start Recording
              </button>
            ) : (
              <div className="recording-container">
                <div className="recording-indicator">
                  <span className="recording-dot"></span>
                  Recording...
                </div>
                <button 
                  onClick={stopRecording} 
                  className="action-button stop-button"
                >
                  ⏹️ Stop Recording
                </button>
              </div>
            )}
            
            {audioBlob && (
              <div className="audio-preview">
                <audio controls src={URL.createObjectURL(audioBlob)} />
                <button 
                  onClick={handleAudioSubmit}
                  className="action-button submit-button"
                >
                  ✅ Submit Recording
                </button>
              </div>
            )}
            
            <button 
              className="action-button mock-button"
              onClick={() => {
                completeQuest(quest.id)
                collectStamp(quest.reward?.name || quest.id)
                setResult('Audio submitted! Stamp earned: ' + (quest.reward?.name || ''))
              }}
            >
              🎤 Mock Submit
            </button>
          </div>
        </div>
      )}

      {error && <div className="error-message">{error}</div>}
      {result && (
        <div className="success-message">
          <p>{result}</p>
          <button 
            onClick={() => navigate('/quest-board')} 
            className="action-button return-button"
          >
            🏆 Return to Quest Board
          </button>
        </div>
      )}

      <div className="sabah-decoration">
        <span className="decoration-icon">🌺</span>
        <span className="decoration-icon">🐘</span>
        <span className="decoration-icon">🏔️</span>
      </div>
    </div>
  )
}