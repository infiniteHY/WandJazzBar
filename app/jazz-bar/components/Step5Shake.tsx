'use client'

import { useJazzBar } from '../context/JazzBarContext'

const SHAKE_LEVELS = [
  { id: 'soft', name: '轻摇', icon: '🌊', desc: 'SMOOTH', color: '#38bdf8' },
  { id: 'medium', name: '中摇', icon: '🌀', desc: 'SWING', color: '#ff8c42' },
  { id: 'hard', name: '猛摇', icon: '💥', desc: 'WILD', color: '#ff6b9d' }
]

export default function Step5Shake() {
  const { state, dispatch } = useJazzBar()

  return (
    <div>
      <h2 className="section-title mb-3">
        05 · SHAKE
      </h2>

      <div className="grid grid-cols-3 gap-2">
        {SHAKE_LEVELS.map(shake => {
          const isSelected = state.mixingParams.shake_level === shake.id
          return (
            <button
              key={shake.id}
              onClick={() => dispatch({ type: 'SET_SHAKE_LEVEL', level: shake.id })}
              className={`option-card text-center ${isSelected ? 'selected' : ''}`}
            >
              <div className="text-4xl mb-1 relative z-10">{shake.icon}</div>
              <div
                className="text-base mb-0.5 relative z-10"
                style={{
                  fontFamily: "'Noto Serif SC', serif",
                  fontWeight: 500,
                  color: isSelected ? shake.color : 'rgba(245, 245, 245, 0.85)',
                }}
              >
                {shake.name}
              </div>
              <div
                className="relative z-10"
                style={{
                  fontFamily: "'Press Start 2P', cursive",
                  fontSize: '8px',
                  color: isSelected ? shake.color : 'rgba(160, 160, 160, 0.4)',
                  textShadow: isSelected ? `0 0 5px ${shake.color}30` : 'none',
                }}
              >
                {shake.desc}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
