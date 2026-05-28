'use client'

import { useJazzBar } from '../context/JazzBarContext'

const SPIRITS = [
  { id: 'whiskey', name: 'Whiskey', icon: '🥃', desc: 'Blues', color: '#ff8c42' },
  { id: 'gin', name: 'Gin', icon: '🍸', desc: 'Swing', color: '#38bdf8' },
  { id: 'rum', name: 'Rum', icon: '🍹', desc: 'Latin', color: '#c084fc' },
  { id: 'tequila', name: 'Tequila', icon: '🌵', desc: 'Exp.', color: '#ff6b9d' }
]

export default function Step1BaseSpirit() {
  const { state, dispatch } = useJazzBar()

  return (
    <div>
      <h2 className="section-title mb-3">
        01 · BASE SPIRIT
      </h2>

      <div className="grid grid-cols-2 gap-2">
        {SPIRITS.map(spirit => {
          const isSelected = state.mixingParams.base_spirit === spirit.id
          return (
            <button
              key={spirit.id}
              onClick={() => dispatch({ type: 'SET_BASE_SPIRIT', spirit: spirit.id })}
              className={`option-card text-center ${isSelected ? 'selected' : ''}`}
            >
              <div className="option-icon relative z-10">{spirit.icon}</div>
              <div
                className="option-label relative z-10"
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontWeight: 500,
                  color: isSelected ? spirit.color : 'rgba(245, 245, 245, 0.85)',
                }}
              >
                {spirit.name}
              </div>
              <div
                className="option-desc relative z-10"
                style={{
                  fontFamily: "'Press Start 2P', cursive",
                  color: isSelected ? spirit.color : 'rgba(160, 160, 160, 0.4)',
                  textShadow: isSelected ? `0 0 6px ${spirit.color}40` : 'none',
                }}
              >
                {spirit.desc}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
