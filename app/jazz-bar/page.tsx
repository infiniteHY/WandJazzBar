'use client'

import { useEffect } from 'react'
import { JazzBarProvider } from './context/JazzBarContext'
import MixingFlow from './components/MixingFlow'
import ResultDisplay from './components/ResultDisplay'
import './styles.css'

export default function JazzBarPage() {
  useEffect(() => {
    if (!window.AudioContext && !(window as any).webkitAudioContext) {
      alert('您的浏览器不支持音频播放，请使用 Chrome 或 Firefox')
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
