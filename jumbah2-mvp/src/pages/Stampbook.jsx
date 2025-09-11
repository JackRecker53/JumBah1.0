import React from 'react'

export default function Stampbook() {
  // For MVP this can read from localStorage or Supabase in the future
  return (
    <div className="container">
      <h2>Your Stampbook</h2>
      <div className="card">
        <p className="small">Complete quests to collect stickers and badges. Coming soon: cloud sync with Supabase.</p>
      </div>
    </div>
  )
}
