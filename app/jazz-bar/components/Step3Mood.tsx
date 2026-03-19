'use client'

import { useJazzBar } from '../context/JazzBarContext'

const MOODS = [
  { id: 'calm',       name: '平静', icon: '🌙', desc: 'MAJ',  color: '#38bdf8' },
  { id: 'sad',        name: '忧伤', icon: '🌧️', desc: 'MIN',  color: '#c084fc' },
  { id: 'mysterious', name: '神秘', icon: '🔮', desc: 'DIM',  color: '#a78bfa' },
  { id: 'romantic',   name: '浪漫', icon: '🌹', desc: 'MAJ7', color: '#ff6b9d' },
  { id: 'energetic',  name: '活力', icon: '⚡', desc: 'MIX',  color: '#ff8c42' }
]

export default function Step3Mood() {
  const { state, dispatch } = useJazzBar()

  const selectedMood = MOODS.find(m => m.id === state.mixingParams.mood)
  const intensity = state.mixingParams.mood_intensity
  const fillPct = ((intensity - 1) / 4) * 100

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <h2 className="section-title">03 · MOOD</h2>
        <span style={{ fontFamily: "'Press Start 2P', cursive", fontSize: '9px', color: selectedMood?.color || 'rgba(160,160,160,0.4)' }}>
          LV.{intensity}
        </span>
      </div>

      {/* Mood cards — compact */}
      <div className="grid grid-cols-5 gap-1.5 mb-3">
        {MOODS.map(mood => {
          const isSelected = state.mixingParams.mood === mood.id
          return (
            <button
              key={mood.id}
              onClick={() => dispatch({ type: 'SET_MOOD', mood: mood.id, intensity })}
              className={`option-card text-center ${isSelected ? 'selected' : ''}`}
              style={{ padding: '8px 4px' }}
            >
              <div className="text-xl mb-0.5 relative z-10">{mood.icon}</div>
              <div className="text-xs relative z-10" style={{ fontFamily: "'Noto Serif SC', serif", fontWeight: 500, color: isSelected ? mood.color : 'rgba(245,245,245,0.75)' }}>
                {mood.name}
              </div>
              <div className="relative z-10" style={{ fontFamily: "'Press Start 2P', cursive", fontSize: '7px', color: isSelected ? mood.color : 'rgba(160,160,160,0.3)' }}>
                {mood.desc}
              </div>
            </button>
          )
        })}
      </div>

      {/* 强度滑块 */}
      <div className="px-1">
        <input
          type="range"
          min="1" max="5" step="1"
          value={intensity}
          onChange={e => dispatch({ type: 'SET_MOOD', mood: state.mixingParams.mood || '', intensity: parseInt(e.target.value) })}
          className="mood-slider"
          style={{ '--value': `${fillPct}%` } as React.CSSProperties}
        />
        <div className="flex justify-between mt-1">
          <span style={{ fontFamily: "'Press Start 2P', cursive", fontSize: '7px', color: 'rgba(160,160,160,0.35)' }}>SOFT</span>
          <div className="flex gap-3">
            {[1,2,3,4,5].map(n => (
              <span key={n} style={{ fontFamily: "'Press Start 2P', cursive", fontSize: '7px', color: n <= intensity ? (selectedMood?.color || 'var(--neon-purple)') : 'rgba(160,160,160,0.2)', textShadow: n <= intensity ? `0 0 4px ${selectedMood?.color || 'rgba(192,132,252,0.3)'}` : 'none' }}>
                {n}
              </span>
            ))}
          </div>
          <span style={{ fontFamily: "'Press Start 2P', cursive", fontSize: '7px', color: 'rgba(160,160,160,0.35)' }}>WILD</span>
        </div>
      </div>
    </div>
  )
}
