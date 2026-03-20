'use client'

import { useJazzBar } from '../context/JazzBarContext'

const ICE_LEVELS = [
  { id: 'none',  name: '无冰', icon: '♨️', desc: 'LEGATO', color: '#ff8c42' },
  { id: 'light', name: '少冰', icon: '🧊', desc: 'PAUSE',  color: '#38bdf8' },
  { id: 'heavy', name: '多冰', icon: '❄️', desc: 'SYNC',   color: '#c084fc' }
]

export default function Step4IceLevel({ compact = false, inline = false }: { compact?: boolean; inline?: boolean }) {
  const { state, dispatch } = useJazzBar()

  if (inline) {
    return (
      <div className="flex items-center gap-4">
        <h2 className="section-title whitespace-nowrap flex-shrink-0">04 · ICE</h2>
        <div className="flex gap-2 flex-1">
          {ICE_LEVELS.map(ice => {
            const isSelected = state.mixingParams.ice_level === ice.id
            return (
              <button
                key={ice.id}
                onClick={() => dispatch({ type: 'SET_ICE_LEVEL', level: ice.id })}
                className={`option-card flex-1 flex items-center justify-center gap-2 ${isSelected ? 'selected' : ''}`}
                style={{ padding: '8px 12px' }}
              >
                <span className="text-lg relative z-10">{ice.icon}</span>
                <span className="relative z-10" style={{ fontFamily: "'Noto Serif SC', serif", fontSize: '13px', fontWeight: 500, color: isSelected ? ice.color : 'rgba(245,245,245,0.85)' }}>
                  {ice.name}
                </span>
                <span className="relative z-10" style={{ fontFamily: "'Press Start 2P', cursive", fontSize: '7px', color: isSelected ? ice.color : 'rgba(160,160,160,0.4)' }}>
                  {ice.desc}
                </span>
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div>
      <h2 className="section-title mb-2">04 · ICE</h2>
      <div className={`grid grid-cols-3 ${compact ? 'gap-1' : 'gap-2'}`}>
        {ICE_LEVELS.map(ice => {
          const isSelected = state.mixingParams.ice_level === ice.id
          return (
            <button
              key={ice.id}
              onClick={() => dispatch({ type: 'SET_ICE_LEVEL', level: ice.id })}
              className={`option-card text-center ${isSelected ? 'selected' : ''}`}
              style={compact ? { padding: '8px 4px' } : undefined}
            >
              <div className={`${compact ? 'text-xl' : 'text-3xl'} mb-0.5 relative z-10`}>{ice.icon}</div>
              <div className="relative z-10" style={{ fontFamily: "'Noto Serif SC', serif", fontSize: compact ? '11px' : '14px', fontWeight: 500, color: isSelected ? ice.color : 'rgba(245,245,245,0.85)' }}>
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
