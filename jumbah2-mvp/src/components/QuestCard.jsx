import React from 'react'
import { Link } from 'react-router-dom'

export default function QuestCard({ quest }) {
  return (
    <div className="card">
      <img src={quest.image} alt={quest.title} loading="lazy" />
      <h3>{quest.title}</h3>
      <p className="small">{quest.description}</p>
      <div style={{display:'flex',gap:8,alignItems:'center',margin:'8px 0'}}>
        <span className="badge">{quest.district.toUpperCase()}</span>
        <span className="badge">{quest.type.toUpperCase()}</span>
        <span className="badge">{quest.reward?.type === 'badge' ? '🎖️' : '🗺️'} {quest.reward?.name}</span>
      </div>
      <Link className="btn" to={`/quest/${quest.id}`}>Start</Link>
    </div>
  )
}
