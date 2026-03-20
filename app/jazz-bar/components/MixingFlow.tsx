'use client'

import { useState, useCallback, useRef } from 'react'
import { useJazzBar } from '../context/JazzBarContext'
import Step1BaseSpirit from './Step1BaseSpirit'
import Step2Ingredients from './Step2Ingredients'
import Step3Mood from './Step3Mood'
import Step4IceLevel from './Step4IceLevel'
import Step5Shake from './Step5Shake'

export default function MixingFlow() {
  const { state, dispatch } = useJazzBar()
  const [isShaking, setIsShaking] = useState(false)
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; tx: number; ty: number; color: string }>>([])
  const buttonRef = useRef<HTMLButtonElement>(null)
  const particleId = useRef(0)

  const spawnParticles = useCallback(() => {
    if (!buttonRef.current) return
    const rect = buttonRef.current.getBoundingClientRect()
    const cx = rect.width / 2
    const cy = rect.height / 2
    const colors = ['#ff8c42', '#c084fc', '#38bdf8', '#ffaa66', '#ff6b9d']
    const newParticles = Array.from({ length: 8 }, () => {
      const angle = Math.random() * Math.PI * 2
      const dist = 40 + Math.random() * 60
      return {
        id: particleId.current++,
        x: cx, y: cy,
        tx: Math.cos(angle) * dist,
        ty: Math.sin(angle) * dist,
        color: colors[Math.floor(Math.random() * colors.length)]
      }
    })
    setParticles(prev => [...prev, ...newParticles])
    setTimeout(() => {
      setParticles(prev => prev.filter(p => !newParticles.find(np => np.id === p.id)))
    }, 800)
  }, [])

  if (state.currentStep === 'result') return null

  if (state.currentStep === 'start') return <StartScreen />

  const isComplete =
    state.mixingParams.base_spirit &&
    state.mixingParams.ingredients.length > 0 &&
    state.mixingParams.mood &&
    state.mixingParams.ice_level &&
    state.mixingParams.shake_level

  const handleGenerate = () => {
    if (!isComplete) return
    setIsShaking(true)
    spawnParticles()
    const shakeInterval = setInterval(spawnParticles, 200)
    setTimeout(() => {
      clearInterval(shakeInterval)
      setIsShaking(false)
      dispatch({ type: 'SET_STEP', step: 'result' })
    }, 1200)
  }

  return (
    <div className="jazz-mixing-container flex flex-col py-2 px-3 md:px-4">
      <div className="mixing-grid">

        {/* Title */}
        <div className="text-center fade-in-up">
          <h1 className="neon-sign-text text-lg md:text-2xl leading-tight">WAND JAZZ BAR</h1>
          <div className="neon-divider max-w-xs mx-auto my-1" />
          <p className="text-xs tracking-widest" style={{ fontFamily: "'Playfair Display', serif", fontStyle: 'italic', color: 'rgba(160,160,160,0.5)' }}>
            Select your cocktail parameters
          </p>
        </div>

        {/* Row 1: Step1 + Step2 — stacked on mobile, side-by-side on md+ */}
        <div className="flex flex-col gap-2 md:grid md:grid-cols-2 md:min-h-0">
          <div className="jazz-section fade-in-up stagger-1 flex flex-col md:overflow-hidden" style={{ padding: '10px 14px' }}>
            <Step1BaseSpirit />
          </div>
          <div className="jazz-section fade-in-up stagger-2 flex flex-col md:overflow-hidden" style={{ padding: '10px 14px' }}>
            <Step2Ingredients />
          </div>
        </div>

        {/* Row 2: Step3 full width */}
        <div className="jazz-section fade-in-up stagger-3" style={{ padding: '10px 14px' }}>
          <Step3Mood />
        </div>

        {/* Row 3: Step4 full width — 卡片风格同03 */}
        <div className="jazz-section fade-in-up stagger-4 flex flex-col" style={{ padding: '10px 14px' }}>
          <Step4IceLevel expanded />
        </div>

        {/* Row 4: Step5 full width — 卡片风格同03 */}
        <div className="jazz-section fade-in-up stagger-5 flex flex-col" style={{ padding: '10px 14px' }}>
          <Step5Shake expanded />
        </div>

        {/* SHAKE button */}
        <div className="text-center pb-1 fade-in-up" style={{ animationDelay: '0.3s' }}>
          <div className="relative inline-block">
            <button
              ref={buttonRef}
              onClick={handleGenerate}
              disabled={!isComplete || isShaking}
              className={`shake-button ${isShaking ? 'shaking' : ''}`}
            >
              {isShaking ? 'SHAKING...' : isComplete ? 'SHAKE' : 'INCOMPLETE'}
            </button>
            {particles.map(p => (
              <div
                key={p.id}
                className="particle"
                style={{
                  left: p.x, top: p.y,
                  background: p.color,
                  boxShadow: `0 0 4px ${p.color}`,
                  '--tx': `${p.tx}px`,
                  '--ty': `${p.ty}px`,
                } as React.CSSProperties}
              />
            ))}
          </div>
          {!isComplete && (
            <div className="mt-1 flex justify-center gap-3">
              {!state.mixingParams.base_spirit && <span className="missing-hint">base spirit</span>}
              {state.mixingParams.ingredients.length === 0 && <span className="missing-hint">ingredients</span>}
              {!state.mixingParams.mood && <span className="missing-hint">mood</span>}
              {!state.mixingParams.ice_level && <span className="missing-hint">ice</span>}
              {!state.mixingParams.shake_level && <span className="missing-hint">shake</span>}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}

function StartScreen() {
  const { dispatch } = useJazzBar()
  const [entered, setEntered] = useState(false)

  const handleEnter = () => {
    setEntered(true)
    setTimeout(() => dispatch({ type: 'SET_STEP', step: 'step1' }), 500)
  }

  return (
    <div className="flex items-center justify-center relative overflow-hidden" style={{ minHeight: '100dvh' }}>
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute rounded-full opacity-20 animate-pulse" style={{ width: 300, height: 300, left: '10%', bottom: '15%', background: 'radial-gradient(circle, rgba(255,140,66,0.3) 0%, transparent 70%)', filter: 'blur(60px)' }} />
        <div className="absolute rounded-full opacity-15 animate-pulse" style={{ width: 250, height: 250, right: '15%', top: '20%', background: 'radial-gradient(circle, rgba(192,132,252,0.25) 0%, transparent 70%)', filter: 'blur(50px)', animationDelay: '1s' }} />
      </div>
      <div className={`text-center relative z-10 transition-all duration-500 w-full max-w-2xl px-6 py-12 ${entered ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
        <div className="neon-sign mb-5 fade-in-up">
          <h1 className="neon-sign-text text-3xl sm:text-4xl md:text-6xl leading-relaxed">WAND JAZZ BAR</h1>
        </div>
        <p className="subtitle-glow text-xs sm:text-sm md:text-base mb-6 fade-in-up" style={{ animationDelay: '0.2s', fontFamily: "'Press Start 2P', cursive" }}>
          COCKTAIL x JAZZ
        </p>
        <div className="mb-6 fade-in-up" style={{ animationDelay: '0.3s' }}>
          <p className="leading-loose text-sm sm:text-base md:text-lg" style={{ fontFamily: "'Noto Serif SC', serif", color: 'rgba(245,245,245,0.45)', fontWeight: 300 }}>
            乐曲催着万事万物入眠，梦境无限蔓延；<br />
            世界的歌声开始起舞翩翩，你将会感受音乐的法力无边。
          </p>
          <p className="mt-3 text-sm" style={{ fontFamily: "'Playfair Display', serif", fontStyle: 'italic', color: 'rgba(192,132,252,0.4)', letterSpacing: '0.15em' }}>
            — Eichendorff
          </p>
        </div>
        <div className="neon-divider max-w-[200px] mx-auto mb-6 fade-in-up" style={{ animationDelay: '0.4s' }} />
        <div className="fade-in-up" style={{ animationDelay: '0.5s' }}>
          <button onClick={handleEnter} className="enter-button">ENTER BAR</button>
        </div>
      </div>
    </div>
  )
}
