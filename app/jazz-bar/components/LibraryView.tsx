'use client'

import { useEffect, useState } from 'react'
import { useJazzBar } from '../context/JazzBarContext'

const SPIRIT_LABEL: Record<string, string> = {
  whiskey: '威士忌', gin: '金酒', rum: '朗姆', tequila: '龙舌兰',
}
const MOOD_LABEL: Record<string, string> = {
  calm: '平静', sad: '忧伤', mysterious: '神秘', romantic: '浪漫', energetic: '热烈',
}

export default function LibraryView() {
  const { dispatch } = useJazzBar()
  const [tracks, setTracks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        const res = await fetch('/api/jazz/tracks/list?limit=60')
        const data = await res.json()
        if (!alive) return
        if (data.success) setTracks(data.tracks)
        else setError(true)
      } catch {
        if (alive) setError(true)
      } finally {
        if (alive) setLoading(false)
      }
    })()
    return () => { alive = false }
  }, [])

  const play = (track: any) => dispatch({ type: 'LOAD_TRACK', track })

  return (
    <div className="library-wrap">
      <div className="library-head">
        <h2 className="library-title">曲库 · YOUR CELLAR</h2>
        <p className="library-sub">每一杯调出的爵士都封存在这里 · 点击即可回放</p>
      </div>

      {loading && <div className="library-empty">载入中…</div>}
      {!loading && error && <div className="library-empty">曲库读取失败，请稍后再试。</div>}
      {!loading && !error && tracks.length === 0 && (
        <div className="library-empty">还没有作品 — 去「调酒」摇一杯吧。</div>
      )}

      {!loading && tracks.length > 0 && (
        <div className="library-grid">
          {tracks.map(t => (
            <button key={t.id} className="library-card" onClick={() => play(t)}>
              <div className="library-card-top">
                <span className="library-card-zh">{t.track_name_zh}</span>
                <span className="library-card-play">▶</span>
              </div>
              <div className="library-card-en">{t.track_name_en}</div>
              <div className="library-card-meta">
                {t.key} · {t.style} · ♩={t.bpm}
              </div>
              <div className="library-card-tags">
                <span className="library-tag">{SPIRIT_LABEL[t.base_spirit] || t.base_spirit}</span>
                <span className="library-tag">{MOOD_LABEL[t.mood] || t.mood}</span>
                <span className="library-tag">强度 {t.mood_intensity}</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
