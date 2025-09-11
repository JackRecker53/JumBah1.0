import React from 'react'
import { useParams, Link } from 'react-router-dom'

export default function District() {
  const { id } = useParams()
  return (
    <div className="container">
      <h2 style={{margin:'8px 0'}}>District: {id.toUpperCase()}</h2>
      <p className="small">Choose a board to start quests.</p>
      <Link to={`/district/${id}/quests`} className="btn">Open Quest Board</Link>
    </div>
  )
}
