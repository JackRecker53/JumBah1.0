import React from 'react'
import { Routes, Route, Link } from 'react-router-dom'
import Home from './pages/Home.jsx'
import District from './pages/District.jsx'
import QuestBoard from './pages/QuestBoard.jsx'
import Quest from './pages/Quest.jsx'
import Stampbook from './pages/Stampbook.jsx'
import Chatbot from './pages/Chatbot.jsx'

export default function App() {
  return (
    <div className="app">
      <nav className="nav">
        <Link to="/" className="logo">🐘 JumBah</Link>
        <div className="nav-links">
          <Link to="/stampbook">Stampbook</Link>
          <Link to="/chat">Chat</Link>
        </div>
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/district/:id" element={<District />} />
        <Route path="/district/:id/quests" element={<QuestBoard />} />
        <Route path="/quest/:id" element={<Quest />} />
        <Route path="/stampbook" element={<Stampbook />} />
        <Route path="/chat" element={<Chatbot />} />
      </Routes>
    </div>
  )
}
