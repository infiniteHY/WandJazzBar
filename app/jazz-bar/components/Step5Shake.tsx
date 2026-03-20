'use client'

import { useJazzBar } from '../context/JazzBarContext'

const SHAKE_LEVELS = [
  { id: 'soft',   name: '轻摇', icon: '🌊', desc: 'SMOOTH', color: '#38bdf8' },
  { id: 'medium', name: '中摇', icon: '🌀', desc: 'SWING',  color: '#ff8c42' },
  { id: 'hard',   name: '猛摇', icon: '💥', desc: 'WILD',   color: '#ff6b9d' }
]

export default function Step5Shake({ compact = false, expanded = false }: { compact?: boolean; expanded?: boolean }) {
  const { state, dispatch } = useJazzBar()

  return (
    <div className={expanded ? 'flex flex-col flex-1' : ''}>
      <h2 className={`section-title ${expanded ? 'mb-1.5' : 'mb-2'}`}>05 · SHAKE</h2>
      <div className={`grid grid-cols-3 ${compact ? 'gap-1' : 'gap-1.5'} ${expanded ? 'flex-1' : ''}`}>
        {SHAKE_LEVELS.map(shake => {
          const isSelected = state.mixingParams.shake_level === shake.id
          return (
            <button
              key={shake.id}
              onClick={() => dispatch({ type: 'SET_SHAKE_LEVEL', level: shake.id })}
              className={`option-card text-center ${isSelected ? 'selected' : ''} ${expanded ? 'flex flex-col items-center justify-center' : ''}`}
              style={compact ? { padding: '8px 4px' } : expanded ? { padding: '8px 4px' } : undefined}
            >
              <div className={`${compact ? 'text-xl' : 'text-xl'} mb-0.5 relative z-10`}>{shake.icon}</div>
              <div className="relative z-10" style={{ fontFamily: "'Noto Serif SC', serif", fontSize: '12px', fontWeight: 500, color: isSelected ? shake.color : 'rgba(245,245,245,0.85)' }}>
                {shake.name}
              </div>
              <div className="relative z-10" style={{ fontFamily: "'Press Start 2P', cursive", fontSize: '7px', color: isSelected ? shake.color : 'rgba(160,160,160,0.4)', textShadow: isSelected ? `0 0 5px ${shake.color}30` : 'none' }}>
                {shake.desc}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
