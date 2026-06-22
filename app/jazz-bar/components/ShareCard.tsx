'use client'

import { useState } from 'react'
import { buildShareUrl, type ShareableMix } from '@/lib/jazz/share'

type Props = {
  track: any
  mix: ShareableMix
}

const SPIRIT_LABEL: Record<string, string> = {
  whiskey: '威士忌', gin: '金酒', rum: '朗姆', tequila: '龙舌兰',
}
const MOOD_LABEL: Record<string, string> = {
  calm: '平静', sad: '忧伤', mysterious: '神秘', romantic: '浪漫', energetic: '热烈',
}

// Draw the shareable poster onto a portrait canvas and return a PNG blob.
async function renderCard(track: any, mix: ShareableMix): Promise<Blob> {
  const W = 1080
  const H = 1350
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')!

  // Make sure web fonts are ready so the poster matches the app.
  try { await (document as any).fonts?.ready } catch {}

  // Background gradient + vignette.
  const bg = ctx.createLinearGradient(0, 0, W, H)
  bg.addColorStop(0, '#0a0a0f')
  bg.addColorStop(0.5, '#12101a')
  bg.addColorStop(1, '#08080c')
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, W, H)

  // Neon frame.
  ctx.strokeStyle = 'rgba(255,140,66,0.5)'
  ctx.lineWidth = 3
  ctx.strokeRect(48, 48, W - 96, H - 96)
  ctx.strokeStyle = 'rgba(192,132,252,0.25)'
  ctx.lineWidth = 1
  ctx.strokeRect(60, 60, W - 120, H - 120)

  const cx = W / 2

  // Brand line.
  ctx.textAlign = 'center'
  ctx.fillStyle = 'rgba(56,189,248,0.85)'
  ctx.font = "28px 'Press Start 2P', monospace"
  ctx.fillText('WAND  JAZZ  BAR', cx, 150)

  // Chinese title.
  ctx.fillStyle = '#f5f5f5'
  ctx.font = "64px 'Noto Serif SC', serif"
  ctx.shadowColor = 'rgba(255,140,66,0.4)'
  ctx.shadowBlur = 24
  ctx.fillText(track.track_name_zh, cx, 280)
  ctx.shadowBlur = 0

  // English title + meta.
  ctx.fillStyle = 'rgba(192,132,252,0.85)'
  ctx.font = "italic 32px 'Playfair Display', serif"
  ctx.fillText(track.track_name_en, cx, 335)
  ctx.fillStyle = 'rgba(160,160,160,0.7)'
  ctx.font = "24px 'Playfair Display', serif"
  ctx.fillText(`${track.key} · ${track.style} · ♩=${track.bpm}`, cx, 380)

  // Divider.
  ctx.strokeStyle = 'rgba(255,140,66,0.3)'
  ctx.lineWidth = 2
  ctx.beginPath(); ctx.moveTo(cx - 120, 425); ctx.lineTo(cx + 120, 425); ctx.stroke()

  // Chinese poem.
  let poemZh: string[] = []
  try { poemZh = JSON.parse(track.poem_zh) } catch {}
  ctx.fillStyle = 'rgba(245,245,245,0.82)'
  ctx.font = "40px 'Noto Serif SC', serif"
  let y = 530
  poemZh.slice(0, 4).forEach(line => { ctx.fillText(line, cx, y); y += 78 })

  // English poem (smaller, dimmer).
  let poemEn: string[] = []
  try { poemEn = JSON.parse(track.poem_en) } catch {}
  ctx.fillStyle = 'rgba(200,200,200,0.5)'
  ctx.font = "italic 26px 'Playfair Display', serif"
  y += 20
  poemEn.slice(0, 4).forEach(line => { ctx.fillText(line, cx, y); y += 46 })

  // Chord progression.
  let chords: string[] = []
  try { chords = JSON.parse(track.chord_progression) } catch {}
  ctx.fillStyle = 'rgba(56,189,248,0.9)'
  ctx.font = "30px 'Press Start 2P', monospace"
  ctx.fillText(chords.join('   '), cx, H - 220)

  // Cocktail recipe footer.
  ctx.fillStyle = 'rgba(255,140,66,0.85)'
  ctx.font = "22px 'Noto Serif SC', serif"
  const recipe = `${SPIRIT_LABEL[mix.base_spirit] || mix.base_spirit} · ${MOOD_LABEL[mix.mood] || mix.mood} · 强度 ${mix.mood_intensity}`
  ctx.fillText(recipe, cx, H - 150)

  ctx.fillStyle = 'rgba(160,160,160,0.55)'
  ctx.font = "20px 'Playfair Display', serif"
  ctx.fillText('扫一扫 · 调一杯属于你的爵士', cx, H - 110)

  return await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(b => (b ? resolve(b) : reject(new Error('toBlob failed'))), 'image/png')
  })
}

export default function ShareCard({ track, mix }: Props) {
  const [busy, setBusy] = useState(false)
  const [copied, setCopied] = useState(false)

  const fileName = `wand-jazz-${(track.track_name_en || 'mix').replace(/\s+/g, '-').toLowerCase()}.png`

  const handleDownload = async () => {
    try {
      setBusy(true)
      const blob = await renderCard(track, mix)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = fileName
      a.click()
      URL.revokeObjectURL(url)
    } catch (e) {
      console.error(e)
      alert('生成分享卡失败，请重试。')
    } finally {
      setBusy(false)
    }
  }

  const handleShare = async () => {
    try {
      setBusy(true)
      const url = buildShareUrl(mix)
      const blob = await renderCard(track, mix)
      const file = new File([blob], fileName, { type: 'image/png' })
      const nav: any = navigator
      if (nav.share && nav.canShare && nav.canShare({ files: [file] })) {
        await nav.share({
          title: track.track_name_zh,
          text: `${track.track_name_zh} — 我在 Wand Jazz Bar 调出的爵士`,
          url,
          files: [file],
        })
      } else if (nav.share) {
        await nav.share({ title: track.track_name_zh, text: track.track_name_zh, url })
      } else {
        await handleDownload()
      }
    } catch (e) {
      // User cancelling the share sheet throws — ignore those.
      if ((e as any)?.name !== 'AbortError') console.error(e)
    } finally {
      setBusy(false)
    }
  }

  const handleCopyLink = async () => {
    try {
      const url = buildShareUrl(mix)
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      alert('复制失败，请手动复制地址栏链接。')
    }
  }

  return (
    <div className="flex items-center justify-center gap-2 flex-wrap mt-5">
      <button onClick={handleShare} disabled={busy} className="share-btn share-btn-primary">
        {busy ? '生成中…' : '分享 SHARE'}
      </button>
      <button onClick={handleDownload} disabled={busy} className="share-btn">
        下载卡片
      </button>
      <button onClick={handleCopyLink} className="share-btn">
        {copied ? '已复制 ✓' : '复制链接'}
      </button>
    </div>
  )
}
