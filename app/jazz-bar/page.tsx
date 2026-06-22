'use client'

import { useEffect, Suspense } from 'react'
import { JazzBarProvider, useJazzBar } from './context/JazzBarContext'
import TopNav from './components/TopNav'
import MixingFlow from './components/MixingFlow'
import ResultDisplay from './components/ResultDisplay'
import LibraryView from './components/LibraryView'
import DeepLinkLoader from './components/DeepLinkLoader'
import './styles.css'

function JazzBarInner() {
  const { state } = useJazzBar()
  return (
    <>
      <TopNav />
      <div className="jazz-stage">
        {state.view === 'library' ? (
          <LibraryView />
        ) : (
          <>
            <MixingFlow />
            <ResultDisplay />
          </>
        )}
      </div>
    </>
  )
}

export default function JazzBarPage() {
  useEffect(() => {
    if (!window.AudioContext && !(window as any).webkitAudioContext) {
      alert('Your browser does not support audio playback. Please use Chrome or Firefox.')
    }
  }, [])

  return (
    <JazzBarProvider>
      <Suspense fallback={null}>
        <DeepLinkLoader />
      </Suspense>
      <div className="jazz-bar-bg noise-texture">
        <div className="crt-overlay" />
        <div className="relative z-10">
          <JazzBarInner />
        </div>
      </div>
    </JazzBarProvider>
  )
}
