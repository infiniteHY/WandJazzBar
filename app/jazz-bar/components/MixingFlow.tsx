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
        x: cx,
        y: cy,
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

  if (state.currentStep === 'start') {
    return <StartScreen />
  }

  return (
    <div className="h-screen flex flex-col py-4 px-4 overflow-hidden">
      <div className="max-w-6xl mx-auto w-full flex flex-col flex-1">
        {/* Title */}
        <div className="text-center mb-4 fade-in-up flex-shrink-0">
          <h1 className="neon-sign-text text-3xl md:text-4xl mb-2">
            WAND JAZZ BAR
          </h1>
          <div className="neon-divider max-w-xs mx-auto mb-2" />
          <p className="text-base tracking-widest" style={{ fontFamily: "'Playfair Display', serif", fontStyle: 'italic', color: 'rgba(160, 160, 160, 0.6)' }}>
            Select your cocktail parameters
          </p>
        </div>

        {/* Main content grid - all in viewport */}
        <div className="flex-1 flex flex-col gap-3 min-h-0">
          {/* Row 1: Base spirit + Ingredients */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 flex-1">
            <div className="jazz-section fade-in-up stagger-1">
              <Step1BaseSpirit />
            </div>
            <div className="jazz-section fade-in-up stagger-2">
              <Step2Ingredients />
            </div>
          </div>

          {/* Row 2: Mood */}
          <div className="jazz-section fade-in-up stagger-3 flex-shrink-0">
            <Step3Mood />
          </div>

          {/* Row 3: Ice + Shake */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 flex-shrink-0">
            <div className="jazz-section fade-in-up stagger-4">
              <Step4IceLevel />
            </div>
            <div className="jazz-section fade-in-up stagger-5">
              <Step5Shake />
            </div>
          </div>

          {/* SHAKE button */}
          <div className="text-center py-2 fade-in-up flex-shrink-0" style={{ animationDelay: '0.3s' }}>
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
                    left: p.x,
                    top: p.y,
                    background: p.color,
                    boxShadow: `0 0 4px ${p.color}`,
                    '--tx': `${p.tx}px`,
                    '--ty': `${p.ty}px`,
                  } as React.CSSProperties}
                />
              ))}
            </div>

            {!isComplete && (
              <div className="mt-2 flex justify-center gap-4">
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
    </div>
  )
}

function StartScreen() {
  const { dispatch } = useJazzBar()
  const [entered, setEntered] = useState(false)

  const handleEnter = () => {
    setEntered(true)
    setTimeout(() => {
      dispatch({ type: 'SET_STEP', step: 'step1' })
    }, 500)
  }

  return (
    <div className="h-screen flex items-center justify-center relative overflow-hidden">
      {/* Ambient neon blobs */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute rounded-full opacity-20 animate-pulse"
          style={{
            width: 300,
            height: 300,
            left: '10%',
            bottom: '15%',
            background: 'radial-gradient(circle, rgba(255,140,66,0.3) 0%, transparent 70%)',
            filter: 'blur(60px)',
          }}
        />
        <div
          className="absolute rounded-full opacity-15 animate-pulse"
          style={{
            width: 250,
            height: 250,
            right: '15%',
            top: '20%',
            background: 'radial-gradient(circle, rgba(192,132,252,0.25) 0%, transparent 70%)',
            filter: 'blur(50px)',
            animationDelay: '1s',
          }}
        />
        <div
          className="absolute rounded-full opacity-10"
          style={{
            width: 200,
            height: 200,
            left: '50%',
            top: '60%',
            transform: 'translateX(-50%)',
            background: 'radial-gradient(circle, rgba(56,189,248,0.2) 0%, transparent 70%)',
            filter: 'blur(40px)',
          }}
        />
      </div>

      <div
        className={`text-center relative z-10 transition-all duration-500 max-w-2xl px-6 ${entered ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}
      >
        {/* Neon sign title */}
        <div className="neon-sign mb-6 fade-in-up">
          <h1 className="neon-sign-text text-4xl md:text-6xl leading-relaxed">
            WAND JAZZ BAR
          </h1>
        </div>

        {/* Subtitle */}
        <p
          className="subtitle-glow text-sm md:text-base mb-8 fade-in-up"
          style={{ animationDelay: '0.2s', fontFamily: "'Press Start 2P', cursive" }}
        >
          COCKTAIL x JAZZ
        </p>

        {/* Eichendorff poem */}
        <div className="mb-8 fade-in-up" style={{ animationDelay: '0.3s' }}>
          <p
            className="leading-loose text-base md:text-lg"
            style={{
              fontFamily: "'Noto Serif SC', serif",
              color: 'rgba(245, 245, 245, 0.45)',
              fontWeight: 300,
            }}
          >
            乐曲催着万事万物入眠，梦境无限蔓延；
            <br />
            世界的歌声开始起舞翩翩，你将会感受音乐的法力无边。
          </p>
          <p
            className="mt-3 text-sm"
            style={{
              fontFamily: "'Playfair Display', serif",
              fontStyle: 'italic',
              color: 'rgba(192, 132, 252, 0.4)',
              letterSpacing: '0.15em',
            }}
          >
            — Eichendorff
          </p>
        </div>

        {/* Decorative line */}
        <div className="neon-divider max-w-[200px] mx-auto mb-8 fade-in-up" style={{ animationDelay: '0.4s' }} />

        {/* Enter button */}
        <div className="fade-in-up" style={{ animationDelay: '0.5s' }}>
          <button
            onClick={handleEnter}
            className="enter-button"
          >
            ENTER BAR
          </button>
        </div>
      </div>
    </div>
  )
}
