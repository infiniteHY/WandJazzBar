'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'checking' | 'idle' | 'error'>('checking')
  const [error, setError] = useState('')

  useEffect(() => {
    const errParam = searchParams.get('error')
    if (errParam) {
      setError(decodeURIComponent(errParam))
      setStatus('error')
      return
    }

    fetch('/api/auth/check')
      .then(r => r.json())
      .then(d => {
        if (d.authenticated) router.replace('/jazz-bar')
        else setStatus('idle')
      })
      .catch(() => setStatus('idle'))
  }, [router, searchParams])

  if (status === 'checking') {
    return (
      <div style={{ minHeight: '100vh', background: '#0d0d0d', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 64, marginBottom: 20 }}>🎷</div>
          <p style={{ fontFamily: "'Press Start 2P', cursive", fontSize: 14, color: 'rgba(255,140,66,0.6)', letterSpacing: 2 }}>
            LOADING...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh', background: '#0d0d0d',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 16px'
    }}>
      <div style={{ width: '100%', maxWidth: 460 }}>

        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{ fontSize: 72, marginBottom: 18 }}>🎷</div>
          <h1 style={{
            fontFamily: "'Press Start 2P', cursive", fontSize: 22,
            color: '#ff8c42', letterSpacing: 3, marginBottom: 14,
            textShadow: '0 0 24px rgba(255,140,66,0.5)'
          }}>
            WAND JAZZ BAR
          </h1>
          <p style={{ fontFamily: "'Noto Serif SC', serif", fontSize: 17, color: 'rgba(160,160,160,0.5)' }}>
            像素爵士酒吧 · 调一杯专属音乐
          </p>
        </div>

        <div style={{
          background: 'rgba(18,18,18,0.95)',
          border: '1px solid rgba(255,140,66,0.18)',
          borderRadius: 14, padding: '36px 32px',
          boxShadow: '0 0 40px rgba(255,140,66,0.05)'
        }}>
          {error && (
            <div style={{
              marginBottom: 22, padding: '12px 16px',
              background: 'rgba(255,80,80,0.08)', border: '1px solid rgba(255,80,80,0.25)',
              borderRadius: 8, color: '#ff6b6b', fontSize: 15, lineHeight: 1.6
            }}>
              {error}
            </div>
          )}

          <p style={{
            fontFamily: "'Press Start 2P', cursive", fontSize: 12,
            color: 'rgba(255,140,66,0.4)', textAlign: 'center',
            marginBottom: 20, letterSpacing: 2
          }}>
            SIGN IN TO ENTER
          </p>
          <p style={{
            fontSize: 17, color: 'rgba(200,200,200,0.6)',
            textAlign: 'center', marginBottom: 32, lineHeight: 2,
            fontFamily: "'Noto Serif SC', serif"
          }}>
            使用 SecondMe 账号登录<br />
            完成授权后自动进入酒吧
          </p>

          <a
            href="/api/auth/login"
            style={{
              display: 'block', textAlign: 'center', textDecoration: 'none',
              padding: '16px 28px', borderRadius: 8,
              background: '#ff8c42', color: '#0d0d0d',
              fontFamily: "'Press Start 2P', cursive", fontSize: 13,
              letterSpacing: 1, boxShadow: '0 0 20px rgba(255,140,66,0.35)'
            }}
          >
            使用 SecondMe 登录 →
          </a>
        </div>

        <p style={{
          textAlign: 'center', marginTop: 28,
          fontFamily: "'Press Start 2P', cursive", fontSize: 10,
          color: 'rgba(160,160,160,0.15)', letterSpacing: 1
        }}>
          POWERED BY SECONDME
        </p>
      </div>
    </div>
  )
}

export default function Home() {
  return (
    <Suspense>
      <LoginPage />
    </Suspense>
  )
}
