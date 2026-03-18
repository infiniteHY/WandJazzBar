'use client'

import { useState, useEffect } from 'react'
import { jazzPlayer } from '@/lib/jazz/tonePlayer'

export default function MusicPlayer({ track }: { track: any }) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [volume, setVolume] = useState(70)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (isPlaying) {
      interval = setInterval(() => {
        setProgress(prev => (prev >= 100 ? 0 : prev + 1))
      }, 200)
    } else {
      setProgress(0)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isPlaying])

  const handlePlay = async () => {
    if (isPlaying) return

    setIsLoading(true)
    try {
      await jazzPlayer.play(track)
      setIsPlaying(true)
    } catch (error) {
      console.error('播放错误:', error)
      alert('音频播放失败，请刷新页面重试')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePause = () => {
    jazzPlayer.stop()
    setIsPlaying(false)
  }

  const handleStop = () => {
    jazzPlayer.stop()
    setIsPlaying(false)
    setProgress(0)
  }

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume)
    // TODO: 实际控制 Tone.js 音量
    // jazzPlayer.setVolume(newVolume)
  }

  const volumeDb = Math.round((volume - 70) / 5)
  const instruments = track.instruments ? JSON.parse(track.instruments) : ['piano', 'chord', 'bass']

  return (
    <div>
      {/* Controls row */}
      <div className="flex items-center gap-4 mb-5">
        {/* Play/Pause */}
        <button
          onClick={isPlaying ? handlePause : handlePlay}
          disabled={isLoading}
          className="player-control"
        >
          {isLoading ? (
            <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeDasharray="32" strokeDashoffset="12" />
            </svg>
          ) : isPlaying ? (
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="4" width="4" height="16" rx="1" />
              <rect x="14" y="4" width="4" height="16" rx="1" />
            </svg>
          ) : (
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="6,4 20,12 6,20" />
            </svg>
          )}
        </button>

        {/* Stop */}
        <button
          onClick={handleStop}
          disabled={!isPlaying}
          className="player-control"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <rect x="6" y="6" width="12" height="12" rx="1" />
          </svg>
        </button>

        {/* Status */}
        {isPlaying && (
          <span
            className="neon-text-orange"
            style={{
              fontFamily: "'Press Start 2P', cursive",
              fontSize: '8px',
              letterSpacing: '0.08em',
            }}
          >
            PLAYING
          </span>
        )}

        {/* Volume */}
        <div className="flex items-center gap-2 ml-auto">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="var(--neon-orange)" strokeWidth="1.5">
            <path d="M11 5L6 9H2v6h4l5 4V5z" />
            <path d="M15.54 8.46a5 5 0 010 7.07M19.07 4.93a10 10 0 010 14.14" strokeLinecap="round" />
          </svg>
          <input
            type="range"
            min="0"
            max="100"
            value={volume}
            onChange={(e) => handleVolumeChange(parseInt(e.target.value))}
            className="w-24"
          />
          <span
            className="w-10 text-right"
            style={{
              fontFamily: "'Press Start 2P', cursive",
              fontSize: '7px',
              color: 'rgba(160, 160, 160, 0.5)',
            }}
          >
            {volumeDb}dB
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-4">
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* Instrument labels */}
      <div className="flex items-center justify-end gap-3">
        {instruments.map((inst: string, i: number) => (
          <span
            key={i}
            style={{
              fontFamily: "'Press Start 2P', cursive",
              fontSize: '7px',
              color: isPlaying ? 'var(--neon-blue)' : 'rgba(160, 160, 160, 0.3)',
              textShadow: isPlaying ? '0 0 4px rgba(56, 189, 248, 0.3)' : 'none',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              transition: 'all 0.3s ease',
            }}
          >
            {inst}
          </span>
        ))}
      </div>
    </div>
  )
}
