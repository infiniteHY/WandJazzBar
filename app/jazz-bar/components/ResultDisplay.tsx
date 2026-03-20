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
      shake_level: state.mixingParams.shake_level!,
    })
    state.mixingParams.ingredients.forEach(ing => params.append('ingredients', ing))

    try {
      const res = await fetch(`/api/jazz/tracks?${params}`)
      const data = await res.json()
      if (data.success) {
        dispatch({ type: 'SET_TRACK', track: data.track })
      } else {
        alert('生成音轨失败：' + (data.error || '未知错误'))
      }
    } catch {
      alert('网络错误，请重试')
    } finally {
      dispatch({ type: 'SET_LOADING', loading: false })
    }
  }

  if (state.currentStep !== 'result') return null

  // Loading state
  if (state.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            {['🎵','🎶','🎵'].map((note, i) => (
              <span key={i} className="loading-note text-2xl" style={{ animationDelay: `${i * 0.3}s` }}>{note}</span>
            ))}
          </div>
          <p className="neon-text-orange text-xs" style={{ fontFamily: "'Press Start 2P', cursive", letterSpacing: '0.1em' }}>
            GENERATING...
          </p>
          <p className="mt-3 text-xs" style={{ fontFamily: "'Noto Serif SC', serif", color: 'rgba(160,160,160,0.4)' }}>
            正在生成您的专属爵士乐
          </p>
        </div>
      </div>
    )
  }

  if (!state.currentTrack) return null

  const track = state.currentTrack
  const poemZh: string[] = JSON.parse(track.poem_zh)
  const poemEn: string[] = JSON.parse(track.poem_en)

  return (
    <div className="min-h-screen flex items-center justify-center py-8 px-4">
      <div className="w-full max-w-2xl fade-in-up">

        {/* ── Card ── */}
        <div className="jazz-section" style={{ borderRadius: 16, padding: '1.25rem' }}>

          {/* ── Header ── */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-5">
            <div className="min-w-0">
              <h1 style={{
                fontFamily: "'Noto Serif SC', serif",
                fontSize: 'clamp(18px, 5vw, 26px)', fontWeight: 500,
                color: '#f5f5f5', letterSpacing: '0.04em', lineHeight: 1.2,
              }}>
                {track.track_name_zh}
              </h1>
              <p style={{
                fontFamily: "'Playfair Display', serif",
                fontStyle: 'italic', fontSize: 13,
                color: 'rgba(160,160,160,0.7)', marginTop: 5,
              }}>
                {track.track_name_en} · {track.key} · {track.style} · ♩= {track.bpm}
              </p>
            </div>
            <div className="flex gap-1.5 flex-wrap flex-shrink-0">
              <span className="chord-bubble" style={{ background: 'rgba(56,189,248,0.12)', borderColor: 'rgba(56,189,248,0.3)', color: '#38bdf8', fontSize: 11, padding: '3px 10px', borderRadius: 6 }}>
                {track.time_signature}
              </span>
              <span className="chord-bubble" style={{ fontSize: 11, padding: '3px 10px', borderRadius: 6 }}>
                {track.style}
              </span>
              <span className="chord-bubble" style={{ fontSize: 11, padding: '3px 10px', borderRadius: 6 }}>
                {track.mode}
              </span>
            </div>
          </div>

          {/* ── Poems ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
            {/* 中文 */}
            <div style={{ background: '#0d0d0d', border: '0.5px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: '14px 16px', borderLeft: '2px solid rgba(255,140,66,0.4)' }}>
              <div style={{ fontFamily: "'Press Start 2P', cursive", fontSize: '9px', color: 'rgba(255,140,66,0.5)', marginBottom: 10, letterSpacing: '0.05em' }}>诗 · 中文</div>
              <div style={{ fontFamily: "'Noto Serif SC', serif", fontSize: 14, color: 'rgba(245,245,245,0.75)', lineHeight: 2 }}>
                {poemZh.map((line, i) => <div key={i}>{line}</div>)}
              </div>
            </div>
            {/* English */}
            <div style={{ background: '#0d0d0d', border: '0.5px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: '14px 16px', borderLeft: '2px solid rgba(192,132,252,0.4)' }}>
              <div style={{ fontFamily: "'Press Start 2P', cursive", fontSize: '9px', color: 'rgba(192,132,252,0.5)', marginBottom: 10, letterSpacing: '0.05em' }}>Poem · EN</div>
              <div style={{ fontFamily: "'Playfair Display', serif", fontStyle: 'italic', fontSize: 12.5, color: 'rgba(200,200,200,0.65)', lineHeight: 1.9 }}>
                {poemEn.map((line, i) => <div key={i}>{line}</div>)}
              </div>
            </div>
          </div>

          {/* ── Player ── */}
          <div style={{ background: '#0d0d0d', border: '0.5px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '1.25rem' }}>
            <MusicPlayer track={track} />
          </div>
        </div>

        {/* ── Back button ── */}
        <div className="text-center mt-6">
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
