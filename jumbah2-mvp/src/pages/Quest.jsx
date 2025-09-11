import React, { useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import questsData from '../data/quests.json'
import QRScanner from '../components/QRScanner.jsx'

export default function Quest() {
  const { id } = useParams()
  const quest = useMemo(() => questsData.find(q => q.id === id), [id])
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  if (!quest) return <div className="container"><p>Quest not found.</p></div>

  const handleScan = async (code) => {
    // Expected QR payload format: quest:<questId>:<secret>
    if (!code || typeof code !== 'string') {
      setError('Invalid QR data.')
      return
    }
    const parts = code.split(':')
    if (parts.length !== 3 || parts[0] !== 'quest' || parts[1] !== id) {
      setError('This QR is not for this quest.')
      return
    }
    const secret = parts[2]
    if (secret !== (quest.qr_secret || '')) {
      setError('Wrong QR secret. Try another QR station.')
      return
    }
    // TODO: Call Supabase Edge Function to mark completion server-side.
    setResult('Success! Stamp earned: ' + (quest.reward?.name || ''))
    setError(null)
  }

  return (
    <div className="container">
      <div className="card">
        <img src={quest.image} alt={quest.title} />
        <h2>{quest.title}</h2>
        <p className="small">{quest.description}</p>

        {quest.type === 'qr' && (
          <>
            <h3>Scan QR</h3>
            <QRScanner onScan={handleScan} onError={(e) => console.debug(e)} />
            <p className="small">Tip: Use HTTPS or localhost for camera access.</p>
          </>
        )}

        {quest.type === 'photo' && (
          <div className="qr-box" style={{flexDirection:'column'}}>
            <p>Photo task placeholder — integrate camera/gallery upload here.</p>
            <button className="btn" onClick={() => setResult('Photo submitted! Stamp earned: ' + (quest.reward?.name || ''))}>Mock Submit</button>
          </div>
        )}

        {quest.type === 'trivia' && (
          <div className="qr-box" style={{flexDirection:'column', alignItems:'flex-start'}}>
            {(quest.trivia || []).map((t, i) => (
              <div key={i} style={{marginBottom:8}}>
                <div><b>Q{i+1}:</b> {t.q}</div>
                <details className="small"><summary>Show answer</summary>{t.a}</details>
              </div>
            ))}
            <button className="btn" onClick={() => setResult('Trivia complete! Stamp earned: ' + (quest.reward?.name || ''))}>Complete</button>
          </div>
        )}

        {quest.type === 'audio' && (
          <div className="qr-box" style={{flexDirection:'column'}}>
            <p>Audio task placeholder — record a phrase and submit.</p>
            <button className="btn" onClick={() => setResult('Audio submitted! Stamp earned: ' + (quest.reward?.name || ''))}>Mock Submit</button>
          </div>
        )}

        {error && <p style={{color:'#b91c1c'}}>{error}</p>}
        {result && <p style={{color:'#065f46'}}>{result}</p>}
      </div>
    </div>
  )
}
