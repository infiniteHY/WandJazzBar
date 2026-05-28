'use client'

import { useJazzBar } from '../context/JazzBarContext'

const INGREDIENTS = [
  { id: 'lemon', name: 'Lemon',  icon: '🍋', desc: 'HI',    color: '#ffdd57' },
  { id: 'smoke', name: 'Smoke',  icon: '🔥', desc: 'LO',    color: '#ff6b4a' },
  { id: 'honey', name: 'Honey',  icon: '🍯', desc: 'SOFT',  color: '#ffaa42' },
  { id: 'coffee',name: 'Coffee', icon: '☕', desc: 'CMPLX', color: '#c084fc' },
  { id: 'mint',  name: 'Mint',   icon: '🌿', desc: 'DECO',  color: '#34d399' },
  { id: 'soda',  name: 'Soda',   icon: '🫧', desc: 'AIR',   color: '#7dd3fc' },
]

export default function Step2Ingredients() {
  const { state, dispatch } = useJazzBar()

  return (
    <div className="flex flex-col flex-1">
      <div className="flex justify-between items-center mb-3 flex-shrink-0">
        <h2 className="section-title">02 · INGREDIENTS</h2>
        <span style={{ fontFamily: "'Press Start 2P', cursive", fontSize: '9px', color: state.mixingParams.ingredients.length > 0 ? 'var(--neon-orange)' : 'rgba(160,160,160,0.4)' }}>
          {state.mixingParams.ingredients.length}/6
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2 flex-1 content-start">
        {INGREDIENTS.map(ingredient => {
          const isSelected = state.mixingParams.ingredients.includes(ingredient.id)
          return (
            <button
              key={ingredient.id}
              onClick={() => dispatch({ type: 'TOGGLE_INGREDIENT', ingredient: ingredient.id })}
              className={`option-card text-center ${isSelected ? 'selected' : ''}`}
            >
              <div className="option-icon relative z-10">{ingredient.icon}</div>
              <div className="option-label relative z-10" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600, color: isSelected ? ingredient.color : 'rgba(245,245,245,0.8)' }}>
                {ingredient.name}
              </div>
              <div className="option-desc relative z-10" style={{ fontFamily: "'Press Start 2P', cursive", color: isSelected ? ingredient.color : 'rgba(160,160,160,0.35)', textShadow: isSelected ? `0 0 5px ${ingredient.color}30` : 'none' }}>
                {ingredient.desc}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
