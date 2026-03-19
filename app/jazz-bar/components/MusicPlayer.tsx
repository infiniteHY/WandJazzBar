'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import * as Tone from 'tone'

const CHORD_MAP: Record<string, string[]> = {
  'Cmaj7': ['C4','E4','G4','B4'], 'C7':    ['C4','E4','G4','Bb4'], 'Cm7':   ['C4','Eb4','G4','Bb4'],
  'Dmaj7': ['D4','F#4','A4','C#5'], 'D7':  ['D4','F#4','A4','C5'],  'Dm7':  ['D4','F4','A4','C5'],
  'Emaj7': ['E4','G#4','B4','D#5'], 'E7':  ['E4','G#4','B4','D5'],  'Em7':  ['E4','G4','B4','D5'],
  'Fmaj7': ['F4','A4','C5','E5'],   'F7':  ['F4','A4','C5','Eb5'],  'Fm7':  ['F4','Ab4','C5','Eb5'],
  'Gmaj7': ['G3','B3','D4','F#4'],  'G7':  ['G3','B3','D4','F4'],   'Gm7':  ['G3','Bb3','D4','F4'],
  'Amaj7': ['A3','C#4','E4','G#4'], 'A7':  ['A3','C#4','E4','G4'],  'Am7':  ['A3','C4','E4','G4'],
  'Bmaj7': ['B3','D#4','F#4','A#4'],'B7':  ['B3','D#4','F#4','A4'], 'Bm7':  ['B3','D4','F#4','A4'],
  'F#dim7':['F#3','A3','C4','Eb4'], 'Bdim7':['B3','D4','F4','Ab4'],
}

function chordToNotes(chord: string): string[] {
  if (CHORD_MAP[chord]) return CHORD_MAP[chord]
  const key = Object.keys(CHORD_MAP).find(k => chord.startsWith(k.slice(0, 2)))
  return key ? CHORD_MAP[key] : ['C4','E4','G4']
}

function bassNote(note: string): string {
  return note.replace(/(\d)$/, n => String(parseInt(n) - 1))
}

const INST_META: Record<string, { icon: string; label: string }> = {
  piano:     { icon: '🎹', label: 'Piano'  },
  chord:     { icon: '🎵', label: 'Chord'  },
  bass:      { icon: '🎸', label: 'Bass'   },
  saxophone: { icon: '🎷', label: 'Sax'    },
  drums:     { icon: '🥁', label: 'Drums'  },
}

type PlayerState = 'idle' | 'playing' | 'paused'

export default function MusicPlayer({ track }: { track: any }) {
  const [playerState, setPlayerState] = useState<PlayerState>('idle')
  const [isLoading, setIsLoading]     = useState(false)
  const [volume, setVolume]           = useState(-6)
  const [progress, setProgress]       = useState(0)
  const [activeChord, setActiveChord] = useState(-1)
  const [currentNote, setCurrentNote] = useState('')
  const [dotTick, setDotTick]         = useState(0)
  const [activeInst, setActiveInst]   = useState('')
  const [statusText, setStatusText]   = useState('准备就绪')

  // refs for real-time volume + pause/resume
  const masterVolRef = useRef<Tone.Volume | null>(null)
  const timerRef     = useRef<ReturnType<typeof setInterval> | null>(null)
  const pausedAtRef  = useRef(0)   // accumulated elapsed seconds at pause
  const wallAtRef    = useRef(0)   // wall clock ms when last started/resumed

  const chords: string[] = JSON.parse(track.chord_progression)
  const melody: Array<{ note: string; duration: string; time: number }> = JSON.parse(track.melody)
  const totalDuration = melody.length > 0 ? melody[melody.length - 1].time + 4 : 16

  const stopInterval = () => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null }
  }

  const startInterval = (alreadyElapsed: number) => {
    stopInterval()
    wallAtRef.current = Date.now()
    timerRef.current = setInterval(() => {
      const elapsed = alreadyElapsed + (Date.now() - wallAtRef.current) / 1000
      setProgress(Math.min((elapsed / totalDuration) * 100, 100))
    }, 80)
  }

  const fullStop = useCallback(() => {
    Tone.Transport.stop()
    Tone.Transport.cancel()
    stopInterval()
    pausedAtRef.current = 0
    masterVolRef.current = null
    setPlayerState('idle')
    setProgress(0)
    setActiveChord(-1)
    setCurrentNote('')
    setActiveInst('')
  }, [])

  useEffect(() => () => { fullStop() }, [fullStop])

  // Real-time volume control via master node
  const handleVolumeChange = (v: number) => {
    setVolume(v)
    if (masterVolRef.current) masterVolRef.current.volume.value = v
  }

  const handlePlay = async () => {
    try {
      setIsLoading(true)
      await Tone.start()
      Tone.Transport.stop()
      Tone.Transport.cancel()
      Tone.Transport.bpm.value = track.bpm

      // Master volume node — all synths route through this
      const master = new Tone.Volume(volume).toDestination()
      masterVolRef.current = master

      const piano = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'triangle8' },
        envelope: { attack: 0.02, decay: 0.35, sustain: 0.4, release: 1.4 },
      }).connect(master)

      const chordSynth = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'triangle' },
        envelope: { attack: 0.15, decay: 0.4, sustain: 0.55, release: 1.6 },
      }).connect(master)
      chordSynth.volume.value = -6

      const bassSynth = new Tone.Synth({
        oscillator: { type: 'sine' },
        envelope: { attack: 0.05, decay: 0.25, sustain: 0.5, release: 0.8 },
      }).connect(master)
      bassSynth.volume.value = -4

      const saxFilter = new Tone.Filter(1800, 'lowpass').connect(master)
      const saxSynth = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'sawtooth' },
        envelope: { attack: 0.08, decay: 0.2, sustain: 0.7, release: 0.9 },
      }).connect(saxFilter)
      saxSynth.volume.value = -3

      melody.forEach(({ note, duration, time }) => {
        Tone.Transport.schedule((t) => {
          piano.triggerAttackRelease(note, duration, t)
          setCurrentNote(note)
          setDotTick(p => p + 1)
          setActiveInst('piano')
        }, time)
      })

      const SAX_OFFSETS = [0.75, 0.75, 1.25, 1.25]
      chords.forEach((chord, i) => {
        const notes   = chordToNotes(chord)
        const bNote   = bassNote(notes[0])
        const saxNote = notes[1] || notes[0]

        Tone.Transport.schedule((t) => {
          chordSynth.triggerAttackRelease(notes, '2n', t)
          setActiveChord(i); setActiveInst('chord')
        }, i * 2)
        Tone.Transport.schedule((t) => {
          bassSynth.triggerAttackRelease(bNote, '4n', t)
          setActiveInst('bass')
        }, i * 2)
        Tone.Transport.schedule((t) => { bassSynth.triggerAttackRelease(bNote, '8n', t) }, i * 2 + 1)
        Tone.Transport.schedule((t) => {
          saxSynth.triggerAttackRelease([saxNote], '8n', t)
          setActiveInst('saxophone')
        }, i * 2 + SAX_OFFSETS[i % SAX_OFFSETS.length])
      })

      Tone.Transport.schedule(() => {
        fullStop()
        setStatusText('播放完毕 ✓')
      }, totalDuration)

      Tone.Transport.start()
      pausedAtRef.current = 0
      startInterval(0)
      setPlayerState('playing')
      setStatusText('正在播放')
    } catch (e: any) {
      setStatusText('播放出错')
      console.error(e)
    } finally {
      setIsLoading(false)
    }
  }

  const handlePause = () => {
    Tone.Transport.pause()
    pausedAtRef.current = pausedAtRef.current + (Date.now() - wallAtRef.current) / 1000
    stopInterval()
    setPlayerState('paused')
    setStatusText('已暂停')
    setActiveInst('')
  }

  const handleResume = () => {
    Tone.Transport.start()
    startInterval(pausedAtRef.current)
    setPlayerState('playing')
    setStatusText('正在播放')
  }

  const handleStop = () => {
    fullStop()
    setStatusText('已停止')
  }

  const isPlaying = playerState === 'playing'
  const isPaused  = playerState === 'paused'
  const isIdle    = playerState === 'idle'

  const displayInsts = ['piano', 'chord', 'bass', 'saxophone']

  return (
    <div>
      {/* ── Chord pills ── */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <span style={{ fontFamily: "'Press Start 2P', cursive", fontSize: '8px', color: 'rgba(160,160,160,0.4)', marginRight: 2 }}>CHORD</span>
        {chords.map((chord, i) => (
          <span key={i} className="chord-bubble" style={activeChord === i ? {
            background: 'rgba(56,189,248,0.2)', borderColor: 'rgba(56,189,248,0.6)',
            color: '#38bdf8', boxShadow: '0 0 10px rgba(56,189,248,0.25)', transition: 'all 0.2s',
          } : { transition: 'all 0.2s' }}>
            {chord}
          </span>
        ))}
      </div>

      {/* ── Controls + volume ── */}
      <div className="flex items-center gap-3 mb-3">
        {/* Play / Pause / Resume */}
        <button
          onClick={isPlaying ? handlePause : isPaused ? handleResume : handlePlay}
          disabled={isLoading}
          className="player-control"
        >
          {isLoading ? (
            <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeDasharray="32" strokeDashoffset="12" />
            </svg>
          ) : isPlaying ? (
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="4" width="4" height="16" rx="1" /><rect x="14" y="4" width="4" height="16" rx="1" />
            </svg>
          ) : (
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="6,4 20,12 6,20" />
            </svg>
          )}
        </button>

        {/* Stop */}
        <button onClick={handleStop} disabled={isIdle} className="player-control">
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <rect x="6" y="6" width="12" height="12" rx="1" />
          </svg>
        </button>

        {/* Volume */}
        <div className="flex items-center gap-2 ml-auto">
          <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="var(--neon-orange)" strokeWidth="1.5">
            <path d="M11 5L6 9H2v6h4l5 4V5z" />
            <path d="M15.54 8.46a5 5 0 010 7.07" strokeLinecap="round" />
          </svg>
          <input
            type="range" min="-20" max="0" value={volume} step="1"
            onChange={e => handleVolumeChange(parseInt(e.target.value))}
            className="w-20"
          />
          <span style={{ fontFamily: "'Press Start 2P', cursive", fontSize: '7px', color: 'rgba(160,160,160,0.5)', minWidth: 38, textAlign: 'right' }}>
            {volume}dB
          </span>
        </div>
      </div>

      {/* ── Progress bar ── */}
      <div className="progress-bar mb-3">
        <div className="progress-fill" style={{ width: `${progress}%` }} />
      </div>

      {/* ── Status + note dots ── */}
      <div className="flex justify-between items-center mb-4">
        <span style={{ fontFamily: "'Press Start 2P', cursive", fontSize: '8px', color: isPaused ? 'var(--neon-purple)' : 'rgba(160,160,160,0.35)' }}>
          {statusText}
        </span>
        <div className="flex items-center gap-1.5">
          {[0,1,2,3].map(i => (
            <div key={i} style={{
              width: 7, height: 7, borderRadius: '50%',
              background: isPlaying && dotTick % 4 === i ? 'var(--neon-orange)' : 'rgba(255,140,66,0.12)',
              boxShadow: isPlaying && dotTick % 4 === i ? '0 0 6px rgba(255,140,66,0.5)' : 'none',
              transition: 'background 0.1s, box-shadow 0.1s',
            }} />
          ))}
          <span style={{ fontFamily: "'Press Start 2P', cursive", fontSize: '9px', color: 'var(--neon-orange)', minWidth: 30, textAlign: 'right', textShadow: '0 0 6px rgba(255,140,66,0.4)' }}>
            {currentNote}
          </span>
        </div>
      </div>

      {/* ── Instrument cards ── */}
      <div className="grid grid-cols-4 gap-2" style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 12 }}>
        {displayInsts.map(inst => {
          const isActive = activeInst === inst && isPlaying
          const meta = INST_META[inst] || { icon: '🎵', label: inst }
          return (
            <div key={inst} style={{
              background: isActive ? 'rgba(255,140,66,0.08)' : '#0d0d0d',
              border: isActive ? '1px solid rgba(255,140,66,0.3)' : '1px solid rgba(255,255,255,0.06)',
              borderRadius: 8, padding: '8px 6px', textAlign: 'center',
              transition: 'all 0.15s ease',
            }}>
              <div style={{ fontSize: 16, marginBottom: 4 }}>{meta.icon}</div>
              <div style={{
                fontFamily: "'Press Start 2P', cursive", fontSize: '7px',
                color: isActive ? 'var(--neon-orange)' : 'rgba(160,160,160,0.3)',
                textShadow: isActive ? '0 0 4px rgba(255,140,66,0.4)' : 'none',
                transition: 'color 0.15s',
              }}>{meta.label}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
