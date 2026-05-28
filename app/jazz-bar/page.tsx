'use client'

import { useEffect } from 'react'
import { JazzBarProvider } from './context/JazzBarContext'
import MixingFlow from './components/MixingFlow'
import ResultDisplay from './components/ResultDisplay'
import './styles.css'

export default function JazzBarPage() {
  useEffect(() => {
    if (!window.AudioContext && !(window as any).webkitAudioContext) {
      alert('Your browser does not support audio playback. Please use Chrome or Firefox.')
    }
  }, [])

  return (
    <JazzBarProvider>
      <div className="jazz-bar-bg noise-texture">
        <div className="crt-overlay" />
        <div className="relative z-10">
          <MixingFlow />
          <ResultDisplay />
        </div>
      </div>
    </JazzBarProvider>
  )
}
