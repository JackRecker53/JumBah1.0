import React, { useState } from 'react'
import phrases from '../data/phrases.json'

export default function Chatbot() {
  const [tab, setTab] = useState('translate')
  const [text, setText] = useState('Hello')
  const pack = phrases

  const findPhrase = (t) => {
    const lower = t.toLowerCase().trim()
    for (const group of Object.values(pack)) {
      for (const item of group) {
        if (item.en.toLowerCase() === lower) return item
      }
    }
    return null
  }

  const translated = findPhrase(text)

  return (
    <div className="container">
      <h2>AI Companion</h2>
      <div className="card">
        <div style={{display:'flex', gap:8, marginBottom:12}}>
          <button className="btn" onClick={() => setTab('translate')}>Translate</button>
          <button className="btn secondary" onClick={() => setTab('facts')}>Fun Facts</button>
        </div>

        {tab === 'translate' && (
          <div>
            <p className="small">Translator Lite (preset phrases). Type an English phrase like <i>Hello</i> or <i>Where is the toilet?</i></p>
            <input value={text} onChange={(e)=>setText(e.target.value)} style={{width:'100%', padding:8, margin:'8px 0'}} />
            {translated ? (
              <div>
                <p><b>BM:</b> {translated.bm}</p>
                <p><b>Dusun:</b> {translated.dusun}</p>
              </div>
            ) : <p className="small">No preset found. (Future: AI translate)</p>}
          </div>
        )}

        {tab === 'facts' && (
          <ul>
            <li className="small">Kaamatan celebrates the rice harvest in May.</li>
            <li className="small">Sabah’s iconic residents include the Bornean pygmy elephant 🐘.</li>
          </ul>
        )}
      </div>
    </div>
  )
}
