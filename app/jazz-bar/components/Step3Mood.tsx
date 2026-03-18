'use client'

import { useJazzBar } from '../context/JazzBarContext'

const MOODS = [
  { id: 'calm', name: '平静', icon: '🌙', desc: 'MAJ', color: '#38bdf8' },
  { id: 'sad', name: '忧伤', icon: '🌧️', desc: 'MIN', color: '#c084fc' },
  { id: 'mysterious', name: '神秘', icon: '🔮', desc: 'DIM', color: '#a78bfa' },
  { id: 'romantic', name: '浪漫', icon: '🌹', desc: 'MAJ7', color: '#ff6b9d' },
  { id: 'energetic', name: '活力', icon: '⚡', desc: 'MIX', color: '#ff8c42' }
]

export default function Step3Mood() {
  const { state, dispatch } = useJazzBar()

  const handleMoodSelect = (moodId: string) => {
    dispatch({ type: 'SET_MOOD', mood: moodId, intensity: state.mixingParams.mood_intensity })
  }

  const handleIntensityChange = (intensity: number) => {
    if (state.mixingParams.mood) {
      dispatch({ type: 'SET_MOOD', mood: state.mixingParams.mood, intensity })
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-3">
        <h2 className="section-title">
          03 · MOOD
        </h2>
        <span
          className="neon-text-purple"
          style={{
            fontFamily: "'Press Start 2P', cursive",
            fontSize: '9px',
          }}
        >
          LV.{state.mixingParams.mood_intensity}
        </span>
      </div>

      <div className="grid grid-cols-5 gap-2 mb-4">
        {MOODS.map(mood => {
          const isSelected = state.mixingParams.mood === mood.id
          return (
            <button
              key={mood.id}
              onClick={() => handleMoodSelect(mood.id)}
              className={`option-card text-center ${isSelected ? 'selected' : ''}`}
            >
              <div className="text-3xl mb-1 relative z-10">{mood.icon}</div>
              <div
                className="text-sm mb-0.5 relative z-10"
                style={{
                  fontFamily: "'Noto Serif SC', serif",
                  fontWeight: 500,
                  color: isSelected ? mood.color : 'rgba(245, 245, 245, 0.8)',
                }}
              >
                {mood.name}
              </div>
              <div
                className="relative z-10"
                style={{
                  fontFamily: "'Press Start 2P', cursive",
                  fontSize: '8px',
                  color: isSelected ? mood.color : 'rgba(160, 160, 160, 0.35)',
                  textShadow: isSelected ? `0 0 5px ${mood.color}30` : 'none',
                }}
              >
                {mood.desc}
              </div>
            </button>
          )
        })}
      </div>

      <div className="px-1">
        <input
          type="range"
          min="1"
          max="5"
          value={state.mixingParams.mood_intensity}
          onChange={(e) => handleIntensityChange(parseInt(e.target.value))}
          className="mood-slider"
          style={{
            '--value': `${(state.mixingParams.mood_intensity - 1) * 25}%`
          } as React.CSSProperties}
        />
        <div className="flex justify-between mt-1">
          {[1, 2, 3, 4, 5].map(n => (
            <span
              key={n}
              style={{
                fontFamily: "'Press Start 2P', cursive",
                fontSize: '8px',
                color: n <= state.mixingParams.mood_intensity ? 'var(--neon-purple)' : 'rgba(160, 160, 160, 0.25)',
                textShadow: n <= state.mixingParams.mood_intensity ? '0 0 4px rgba(192, 132, 252, 0.3)' : 'none',
              }}
            >
              {n}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
