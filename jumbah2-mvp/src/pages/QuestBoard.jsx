import React, { useEffect, useState } from 'react'
import QuestCard from '../components/QuestCard.jsx'
import questsData from '../data/quests.json'

export default function QuestBoard() {
  const [quests, setQuests] = useState([])

  useEffect(() => {
    // In a real app fetch from Supabase; here we start with local JSON
    setQuests(questsData.filter(q => q.district === 'kk'))
  }, [])

  return (
    <div className="container">
      <h2>Quest Board — KK</h2>
      <div className="grid">
        {quests.map(q => <QuestCard key={q.id} quest={q} />)}
      </div>
    </div>
  )
}
