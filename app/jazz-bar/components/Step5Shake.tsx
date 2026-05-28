'use client'

import { useJazzBar } from '../context/JazzBarContext'

const SHAKE_LEVELS = [
  { id: 'soft',   name: 'Soft', icon: '🌊', desc: 'SMOOTH', color: '#38bdf8' },
  { id: 'medium', name: 'Swing', icon: '🌀', desc: 'SWING',  color: '#ff8c42' },
  { id: 'hard',   name: 'Wild', icon: '💥', desc: 'WILD',   color: '#ff6b9d' }
]

export default function Step5Shake({ expanded }: { expanded?: boolean }) {
  const { state, dispatch } = useJazzBar()

  return (
    <div>
      <h2 className="section-title mb-2">05 · SHAKE</h2>
      <div className="grid grid-cols-3 gap-1.5">
        {SHAKE_LEVELS.map(shake => {
          const isSelected = state.mixingParams.shake_level === shake.id
          return (
            <button
              key={shake.id}
              onClick={() => dispatch({ type: 'SET_SHAKE_LEVEL', level: shake.id })}
              className={`option-card text-center ${isSelected ? 'selected' : ''} ${expanded ? 'flex flex-col items-center justify-center' : ''}`}
            >
              <div className="option-icon relative z-10">{shake.icon}</div>
              <div className="option-label relative z-10" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600, color: isSelected ? shake.color : 'rgba(245,245,245,0.85)' }}>
                {shake.name}
              </div>
              <div className="option-desc relative z-10" style={{ fontFamily: "'Press Start 2P', cursive", color: isSelected ? shake.color : 'rgba(160,160,160,0.4)', textShadow: isSelected ? `0 0 5px ${shake.color}30` : 'none' }}>
                {shake.desc}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
