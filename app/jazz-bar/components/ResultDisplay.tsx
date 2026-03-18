'use client'

import { useEffect } from 'react'
import { useJazzBar } from '../context/JazzBarContext'
import MusicPlayer from './MusicPlayer'

export default function ResultDisplay() {
  const { state, dispatch } = useJazzBar()

  useEffect(() => {
    if (state.currentStep === 'result' && !state.currentTrack && !state.isLoading) {
      fetchTrack()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.currentStep])

  const fetchTrack = async () => {
    dispatch({ type: 'SET_LOADING', loading: true })

    const params = new URLSearchParams({
      base_spirit: state.mixingParams.base_spirit!,
      mood: state.mixingParams.mood!,
      mood_intensity: state.mixingParams.mood_intensity.toString(),
      ice_level: state.mixingParams.ice_level!,
      shake_level: state.mixingParams.shake_level!
    })

    state.mixingParams.ingredients.forEach(ing => {
      params.append('ingredients', ing)
    })

    try {
      const response = await fetch(`/api/jazz/tracks?${params}`)
      const data = await response.json()

      if (data.success) {
        dispatch({ type: 'SET_TRACK', track: data.track })
      } else {
        alert('生成音轨失败：' + (data.error || '未知错误'))
      }
    } catch (error) {
      console.error('Fetch track error:', error)
      alert('网络错误，请重试')
    } finally {
      dispatch({ type: 'SET_LOADING', loading: false })
    }
  }

  if (state.currentStep !== 'result') return null

  if (state.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          {/* Animated loading notes */}
          <div className="flex items-center justify-center gap-3 mb-6">
            {['🎵', '🎶', '🎵'].map((note, i) => (
              <span
                key={i}
                className="loading-note text-2xl"
                style={{ animationDelay: `${i * 0.3}s` }}
              >
                {note}
              </span>
            ))}
          </div>
          <p
            className="neon-text-orange text-xs"
            style={{ fontFamily: "'Press Start 2P', cursive", letterSpacing: '0.1em' }}
          >
            GENERATING...
          </p>
          <p
            className="mt-3 text-xs"
            style={{
              fontFamily: "'Noto Serif SC', serif",
              color: 'rgba(160, 160, 160, 0.4)',
            }}
          >
            正在生成您的专属爵士乐
          </p>
        </div>
      </div>
    )
  }

  if (!state.currentTrack) return null

  const track = state.currentTrack
  const poemZh = JSON.parse(track.poem_zh)
  const poemEn = JSON.parse(track.poem_en)
  const chordProgression = JSON.parse(track.chord_progression)

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto">

        {/* Track title area */}
        <div className="mb-10 fade-in-up">
          {/* Chinese title */}
          <h1
            className="text-4xl md:text-5xl mb-3 neon-text-orange"
            style={{ fontFamily: "'Noto Serif SC', serif", fontWeight: 700 }}
          >
            {track.track_name_zh}
          </h1>

          {/* English subtitle + metadata */}
          <p
            className="text-lg mb-5"
            style={{
              fontFamily: "'Playfair Display', serif",
              fontStyle: 'italic',
              color: 'rgba(245, 245, 245, 0.5)',
            }}
          >
            {track.track_name_en}
          </p>

          {/* Metadata chips */}
          <div className="flex flex-wrap items-center gap-3">
            <span className="chord-bubble" style={{ borderColor: 'rgba(255, 140, 66, 0.25)', color: 'var(--neon-orange)', background: 'rgba(255, 140, 66, 0.06)' }}>
              {track.key}
            </span>
            <span className="chord-bubble" style={{ borderColor: 'rgba(192, 132, 252, 0.25)', color: 'var(--neon-purple)', background: 'rgba(192, 132, 252, 0.06)' }}>
              {track.style}
            </span>
            <span className="chord-bubble" style={{ borderColor: 'rgba(56, 189, 248, 0.25)', color: 'var(--neon-blue)', background: 'rgba(56, 189, 248, 0.06)' }}>
              BPM {track.bpm}
            </span>
          </div>
        </div>

        <div className="neon-divider mb-10 fade-in-up" style={{ animationDelay: '0.1s' }} />

        {/* Chord progression */}
        <div className="mb-8 fade-in-up" style={{ animationDelay: '0.15s' }}>
          <h3
            className="section-title mb-3"
            style={{ fontSize: '9px' }}
          >
            CHORD PROGRESSION
          </h3>
          <div className="flex flex-wrap gap-1">
            {chordProgression.map((chord: string, i: number) => (
              <span key={i} className="chord-bubble">
                {chord}
              </span>
            ))}
          </div>
        </div>

        {/* Poems */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          {/* Chinese poem */}
          <div className="poem-card zh p-6 fade-in-up" style={{ animationDelay: '0.2s' }}>
            <h3
              className="text-xs mb-4 neon-text-orange"
              style={{
                fontFamily: "'Press Start 2P', cursive",
                fontSize: '9px',
                letterSpacing: '0.1em',
              }}
            >
              诗
            </h3>
            <div className="space-y-3">
              {poemZh.map((line: string, i: number) => (
                <p
                  key={i}
                  className="leading-relaxed"
                  style={{
                    fontFamily: "'Noto Serif SC', serif",
                    fontSize: '15px',
                    color: 'rgba(245, 245, 245, 0.75)',
                  }}
                >
                  {line}
                </p>
              ))}
            </div>
          </div>

          {/* English poem */}
          <div className="poem-card en p-6 fade-in-up" style={{ animationDelay: '0.25s' }}>
            <h3
              className="text-xs mb-4 neon-text-purple"
              style={{
                fontFamily: "'Press Start 2P', cursive",
                fontSize: '9px',
                letterSpacing: '0.1em',
              }}
            >
              POEM
            </h3>
            <div className="space-y-3">
              {poemEn.map((line: string, i: number) => (
                <p
                  key={i}
                  className="leading-relaxed"
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    fontStyle: 'italic',
                    fontSize: '14px',
                    color: 'rgba(245, 245, 245, 0.6)',
                  }}
                >
                  {line}
                </p>
              ))}
            </div>
          </div>
        </div>

        {/* Player */}
        <div className="jazz-section mb-8 fade-in-up" style={{ animationDelay: '0.3s' }}>
          <MusicPlayer track={track} />
        </div>

        {/* Back button */}
        <div className="text-center fade-in-up" style={{ animationDelay: '0.35s' }}>
          <button
            onClick={() => dispatch({ type: 'RESET' })}
            className="back-button"
          >
            NEW MIX
          </button>
        </div>
      </div>
    </div>
  )
}
