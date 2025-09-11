import React from 'react'
import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <div className="container">
      <div className="card">
        <h1>🐘 JumBah 2.0</h1>
        <p>Play quests, collect stickers, learn local phrases. No directory overload—just fun exploration.</p>
        <div style={{display:'flex', gap:12}}>
          <Link className="btn" to="/district/kk/quests">Play in KK</Link>
          <Link className="btn secondary" to="/chat">Translate / Chat</Link>
        </div>
      </div>
      <div className="footer-cta small">Tip: On mobile, add to Home Screen for an app-like feel.</div>
    </div>
  )
}
