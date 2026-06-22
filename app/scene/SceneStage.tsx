'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import * as Tone from 'tone'
import { chordVoicing } from '@/lib/jazz/theory'

const chordToNotes = (chord: string) => chordVoicing(chord, 3)
function bassNote(note: string): string {
  return note.replace(/(\d)$/, n => String(parseInt(n) - 1))
}

// ── Curated venue playlist: a calm rotation suited to a bar/cafe big screen ──
const PRESETS = [
  { base_spirit: 'whiskey', ingredients: ['smoke', 'honey'], mood: 'mysterious', mood_intensity: 2, ice_level: 'heavy', shake_level: 'soft' },
  { base_spirit: 'gin', ingredients: ['lemon', 'mint'], mood: 'calm', mood_intensity: 2, ice_level: 'light', shake_level: 'soft' },
  { base_spirit: 'rum', ingredients: ['coffee', 'honey'], mood: 'romantic', mood_intensity: 3, ice_level: 'light', shake_level: 'medium' },
  { base_spirit: 'whiskey', ingredients: ['coffee', 'smoke'], mood: 'sad', mood_intensity: 2, ice_level: 'heavy', shake_level: 'soft' },
  { base_spirit: 'tequila', ingredients: ['lemon', 'soda'], mood: 'calm', mood_intensity: 1, ice_level: 'light', shake_level: 'soft' },
]

const LOOPS_PER_TRACK = 2

type SceneState = 'idle' | 'loading' | 'playing'

async function fetchTrack(preset: typeof PRESETS[number]): Promise<any> {
  const params = new URLSearchParams({
    base_spirit: preset.base_spirit,
    mood: preset.mood,
    mood_intensity: String(preset.mood_intensity),
    ice_level: preset.ice_level,
    shake_level: preset.shake_level,
  })
  preset.ingredients.forEach(i => params.append('ingredients', i))
  const res = await fetch(`/api/jazz/tracks?${params}`)
  const data = await res.json()
  if (!data.success) throw new Error(data.error || 'fetch failed')
  return data.track
}

export default function SceneStage() {
  const [sceneState, setSceneState] = useState<SceneState>('idle')
  const [track, setTrack] = useState<any>(null)
  const [activeChord, setActiveChord] = useState(-1)
  const [clock, setClock] = useState('')

  const masterRef = useRef<Tone.Volume | null>(null)
  const synthsRef = useRef<any[]>([])
  const presetIdxRef = useRef(0)
  const advanceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const runningRef = useRef(false)

  // Live clock for the venue overlay.
  useEffect(() => {
    const tick = () => {
      const d = new Date()
      setClock(d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }))
    }
    tick()
    const id = setInterval(tick, 1000 * 20)
    return () => clearInterval(id)
  }, [])

  const disposeSynths = () => {
    synthsRef.current.forEach(s => { try { s.dispose() } catch {} })
    synthsRef.current = []
  }

  // Schedule one track over the Transport, looping it for LOOPS_PER_TRACK passes.
  const scheduleTrack = useCallback((t: any) => {
    Tone.Transport.cancel()
    Tone.Transport.position = 0
    disposeSynths()

    const master = masterRef.current!
    Tone.Transport.bpm.value = t.bpm

    const piano = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'triangle8' },
      envelope: { attack: 0.02, decay: 0.35, sustain: 0.4, release: 1.6 },
    }).connect(master)
    const chordSynth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'triangle' },
      envelope: { attack: 0.2, decay: 0.4, sustain: 0.55, release: 2 },
    }).connect(master)
    chordSynth.volume.value = -7
    const bassSynth = new Tone.Synth({
      oscillator: { type: 'sine' },
      envelope: { attack: 0.05, decay: 0.25, sustain: 0.5, release: 1 },
    }).connect(master)
    bassSynth.volume.value = -5
    const saxFilter = new Tone.Filter(1600, 'lowpass').connect(master)
    const saxSynth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'sawtooth' },
      envelope: { attack: 0.1, decay: 0.2, sustain: 0.7, release: 1 },
    }).connect(saxFilter)
    saxSynth.volume.value = -5
    synthsRef.current = [piano, chordSynth, bassSynth, saxSynth]

    const melody: Array<{ note: string; duration: string; time: number }> = JSON.parse(t.melody)
    const chords: string[] = JSON.parse(t.chord_progression)
    const totalDuration = melody.length > 0 ? melody[melody.length - 1].time + 4 : 16

    melody.forEach(({ note, duration, time }) => {
      Tone.Transport.schedule(tt => { piano.triggerAttackRelease(note, duration, tt) }, time)
    })
    const SAX_OFFSETS = [0.75, 0.75, 1.25, 1.25]
    chords.forEach((chord, i) => {
      const notes = chordToNotes(chord)
      const bNote = bassNote(notes[0])
      const saxNote = notes[1] || notes[0]
      Tone.Transport.schedule(tt => {
        chordSynth.triggerAttackRelease(notes, '2n', tt)
        Tone.Draw.schedule(() => setActiveChord(i), tt)
      }, i * 2)
      Tone.Transport.schedule(tt => { bassSynth.triggerAttackRelease(bNote, '4n', tt) }, i * 2)
      Tone.Transport.schedule(tt => { bassSynth.triggerAttackRelease(bNote, '8n', tt) }, i * 2 + 1)
      Tone.Transport.schedule(tt => { saxSynth.triggerAttackRelease([saxNote], '8n', tt) }, i * 2 + SAX_OFFSETS[i % 4])
    })

    Tone.Transport.loop = true
    Tone.Transport.loopStart = 0
    Tone.Transport.loopEnd = totalDuration

    // Auto-advance to the next preset after a couple of loops.
    if (advanceTimerRef.current) clearTimeout(advanceTimerRef.current)
    advanceTimerRef.current = setTimeout(() => {
      if (runningRef.current) advance()
    }, totalDuration * LOOPS_PER_TRACK * 1000)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const advance = useCallback(async () => {
    presetIdxRef.current = (presetIdxRef.current + 1) % PRESETS.length
    try {
      const next = await fetchTrack(PRESETS[presetIdxRef.current])
      if (!runningRef.current) return
      setTrack(next)
      setActiveChord(-1)
      scheduleTrack(next)
    } catch (e) {
      console.error(e)
      // Retry the rotation after a short pause so the screen never dies.
      if (runningRef.current) {
        advanceTimerRef.current = setTimeout(() => runningRef.current && advance(), 4000)
      }
    }
  }, [scheduleTrack])

  const start = async () => {
    try {
      setSceneState('loading')
      await Tone.start()
      const master = new Tone.Volume(-8).toDestination()
      masterRef.current = master
      runningRef.current = true
      presetIdxRef.current = 0

      const first = await fetchTrack(PRESETS[0])
      setTrack(first)
      scheduleTrack(first)
      Tone.Transport.start()
      setSceneState('playing')

      // Hide the cursor for big-screen ambience.
      document.body.style.cursor = 'none'
    } catch (e) {
      console.error(e)
      alert('无法启动场景模式，请重试。')
      setSceneState('idle')
    }
  }

  const stop = useCallback(() => {
    runningRef.current = false
    if (advanceTimerRef.current) clearTimeout(advanceTimerRef.current)
    Tone.Transport.stop()
    Tone.Transport.cancel()
    Tone.Transport.loop = false
    disposeSynths()
    masterRef.current = null
    document.body.style.cursor = ''
    setSceneState('idle')
    setTrack(null)
  }, [])

  useEffect(() => () => { stop() }, [stop])

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen?.()
    else document.exitFullscreen?.()
  }

  // ── Idle gate (browser autoplay needs a gesture) ──
  if (sceneState !== 'playing') {
    return (
      <div className="scene-root scene-center">
        <div style={{ textAlign: 'center' }}>
          <div className="scene-brand">WAND JAZZ BAR</div>
          <div className="scene-venue-label">VENUE&nbsp;·&nbsp;场景模式</div>
          <p className="scene-tagline">无版权 · 不重复 · 为你的空间持续生成爵士氛围</p>
          <button onClick={start} disabled={sceneState === 'loading'} className="scene-start-btn">
            {sceneState === 'loading' ? '正在准备…' : '▶  START SESSION'}
          </button>
        </div>
      </div>
    )
  }

  const poemZh: string[] = track ? JSON.parse(track.poem_zh) : []
  const chords: string[] = track ? JSON.parse(track.chord_progression) : []

  return (
    <div className="scene-root" onDoubleClick={toggleFullscreen}>
      <div className="scene-topbar">
        <span className="scene-brand-sm">WAND JAZZ BAR</span>
        <span className="scene-clock">{clock}</span>
      </div>

      <div className="scene-center scene-content">
        <div className="scene-now">NOW POURING</div>
        <h1 className="scene-title">{track?.track_name_zh}</h1>
        <div className="scene-subtitle">
          {track?.track_name_en} · {track?.key} · {track?.style} · ♩={track?.bpm}
        </div>

        <div className="scene-poem">
          {poemZh.map((line, i) => <div key={i}>{line}</div>)}
        </div>

        <div className="scene-eq">
          {[0,1,2,3,4,5,6,7,8,9,10,11].map(i => (
            <span key={i} className="scene-eq-bar" style={{ animationDelay: `${(i % 6) * 0.12}s` }} />
          ))}
        </div>

        <div className="scene-chords">
          {chords.map((c, i) => (
            <span key={i} className={`scene-chord ${activeChord === i ? 'scene-chord-active' : ''}`}>{c}</span>
          ))}
        </div>
      </div>

      <button onClick={stop} className="scene-exit">EXIT</button>
    </div>
  )
}
