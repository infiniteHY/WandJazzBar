'use client'

import { useJazzBar } from '../context/JazzBarContext'

const ICE_LEVELS = [
  { id: 'none',  name: '无冰', icon: '♨️', desc: 'LEGATO', color: '#ff8c42' },
  { id: 'light', name: '少冰', icon: '🧊', desc: 'PAUSE',  color: '#38bdf8' },
  { id: 'heavy', name: '多冰', icon: '❄️', desc: 'SYNC',   color: '#c084fc' }
]

export default function Step4IceLevel({ compact = false, expanded = false }: { compact?: boolean; expanded?: boolean }) {
  const { state, dispatch } = useJazzBar()

  return (
    <div className={expanded ? 'flex flex-col flex-1' : ''}>
      <h2 className={`section-title ${expanded ? 'mb-1.5' : 'mb-2'}`}>04 · ICE</h2>
      <div className={`grid grid-cols-3 ${compact ? 'gap-1' : 'gap-1.5'} ${expanded ? 'flex-1' : ''}`}>
        {ICE_LEVELS.map(ice => {
          const isSelected = state.mixingParams.ice_level === ice.id
          return (
            <button
              key={ice.id}
              onClick={() => dispatch({ type: 'SET_ICE_LEVEL', level: ice.id })}
              className={`option-card text-center ${isSelected ? 'selected' : ''} ${expanded ? 'flex flex-col items-center justify-center' : ''}`}
              style={compact ? { padding: '8px 4px' } : expanded ? { padding: '8px 4px' } : undefined}
            >
              <div className={`${compact ? 'text-xl' : 'text-xl'} mb-0.5 relative z-10`}>{ice.icon}</div>
              <div className="relative z-10" style={{ fontFamily: "'Noto Serif SC', serif", fontSize: '12px', fontWeight: 500, color: isSelected ? ice.color : 'rgba(245,245,245,0.85)' }}>
                {ice.name}
              </div>
              <div className="relative z-10" style={{ fontFamily: "'Press Start 2P', cursive", fontSize: '7px', color: isSelected ? ice.color : 'rgba(160,160,160,0.4)', textShadow: isSelected ? `0 0 5px ${ice.color}30` : 'none' }}>
                {ice.desc}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
