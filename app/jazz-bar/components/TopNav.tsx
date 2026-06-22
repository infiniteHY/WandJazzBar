'use client'

import Link from 'next/link'
import { useJazzBar } from '../context/JazzBarContext'

export default function TopNav() {
  const { state, dispatch } = useJazzBar()

  return (
    <nav className="jazz-nav">
      <div className="jazz-nav-brand">WAND JAZZ BAR</div>
      <div className="jazz-nav-tabs">
        <button
          className={`jazz-nav-tab ${state.view === 'mix' ? 'is-active' : ''}`}
          onClick={() => dispatch({ type: 'SET_VIEW', view: 'mix' })}
        >
          调酒 · MIX
        </button>
        <button
          className={`jazz-nav-tab ${state.view === 'library' ? 'is-active' : ''}`}
          onClick={() => dispatch({ type: 'SET_VIEW', view: 'library' })}
        >
          曲库 · LIBRARY
        </button>
        <Link href="/scene" className="jazz-nav-tab jazz-nav-venue">
          大屏 · VENUE
        </Link>
      </div>
    </nav>
  )
}
