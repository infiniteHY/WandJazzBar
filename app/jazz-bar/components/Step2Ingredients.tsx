'use client'

import { useJazzBar } from '../context/JazzBarContext'

const INGREDIENTS = [
  { id: 'lemon', name: '柠檬',  icon: '🍋', desc: 'HI',    color: '#ffdd57' },
  { id: 'smoke', name: '烟熏',  icon: '🔥', desc: 'LO',    color: '#ff6b4a' },
  { id: 'honey', name: '蜂蜜',  icon: '🍯', desc: 'SOFT',  color: '#ffaa42' },
  { id: 'coffee',name: '咖啡',  icon: '☕', desc: 'CMPLX', color: '#c084fc' },
  { id: 'mint',  name: '薄荷',  icon: '🌿', desc: 'DECO',  color: '#34d399' },
  { id: 'soda',  name: '苏打水',icon: '🫧', desc: 'AIR',   color: '#7dd3fc' },
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

      {/* flex-1 让卡片网格撑满剩余高度，与01对齐 */}
      <div className="grid grid-cols-3 gap-2 flex-1 content-start">
        {INGREDIENTS.map(ingredient => {
          const isSelected = state.mixingParams.ingredients.includes(ingredient.id)
          return (
            <button
              key={ingredient.id}
              onClick={() => dispatch({ type: 'TOGGLE_INGREDIENT', ingredient: ingredient.id })}
              className={`option-card text-center ${isSelected ? 'selected' : ''}`}
              style={{ padding: '8px 4px' }}
            >
              <div className="text-xl mb-0.5 relative z-10">{ingredient.icon}</div>
              <div className="relative z-10 mb-0.5" style={{ fontFamily: "'Noto Serif SC', serif", fontSize: '12px', fontWeight: 500, color: isSelected ? ingredient.color : 'rgba(245,245,245,0.8)' }}>
                {ingredient.name}
              </div>
              <div className="relative z-10" style={{ fontFamily: "'Press Start 2P', cursive", fontSize: '7px', color: isSelected ? ingredient.color : 'rgba(160,160,160,0.35)', textShadow: isSelected ? `0 0 5px ${ingredient.color}30` : 'none' }}>
                {ingredient.desc}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
