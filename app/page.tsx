'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()
  const [status, setStatus] = useState<'idle' | 'waiting'>('idle')
  const [error, setError] = useState('')
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const popupRef = useRef<Window | null>(null)

  function stopPolling() {
    if (pollRef.current) {
      clearInterval(pollRef.current)
      pollRef.current = null
    }
  }

  function startPolling() {
    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch('/api/auth/check')
        const data = await res.json()
        if (data.authenticated) {
          stopPolling()
          router.push('/jazz-bar')
        }
      } catch {}

      // 弹窗被关闭但还没完成
      if (popupRef.current?.closed) {
        stopPolling()
        setStatus('idle')
        setError('登录窗口已关闭，请重试')
      }
    }, 1500)
  }

  function handleLogin() {
    setError('')
    const popup = window.open(
      '/api/auth/login',
      'secondme-login',
      'width=520,height=680,left=200,top=80'
    )

    if (!popup) {
      setError('弹窗被拦截，请允许弹窗后重试')
      return
    }

    popupRef.current = popup
    setStatus('waiting')
    startPolling()
  }

  // 监听 postMessage（弹窗回调成功时发出）
  useEffect(() => {
    function onMessage(event: MessageEvent) {
      if (event.origin !== window.location.origin) return
      if (event.data?.type === 'secondme_auth_done') {
        stopPolling()
        router.push('/jazz-bar')
      }
    }
    window.addEventListener('message', onMessage)
    return () => {
      window.removeEventListener('message', onMessage)
      stopPolling()
    }
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#1a1a1a' }}>
      <div className="px-8 py-10 rounded-2xl" style={{ background: '#2b2b2b', maxWidth: 420, width: '100%' }}>

        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🎷</div>
          <h1 className="text-2xl font-bold mb-1" style={{ color: '#ff8c42', fontFamily: 'serif', letterSpacing: 2 }}>
            Wand Jazz Bar
          </h1>
          <p className="text-sm" style={{ color: '#666' }}>像素爵士酒吧 · 调一杯专属音乐</p>
        </div>

        <div style={{ borderTop: '1px solid #3a3a3a', marginBottom: 28 }} />

        {error && (
          <div className="mb-4 px-3 py-2 rounded text-sm" style={{ background: '#3a1a1a', color: '#ff6b6b', border: '1px solid #5a2a2a' }}>
            {error}
          </div>
        )}

        {status === 'idle' ? (
          <>
            <p className="text-sm mb-6 text-center" style={{ color: '#aaa', lineHeight: 1.9 }}>
              使用 SecondMe 账号登录<br />
              登录完成后自动进入酒吧
            </p>
            <button
              onClick={handleLogin}
              className="block w-full py-3 px-6 rounded-lg font-semibold text-center"
              style={{ background: '#ff8c42', color: '#1a1a1a', cursor: 'pointer' }}
            >
              使用 SecondMe 登录
            </button>
          </>
        ) : (
          <div className="text-center py-4">
            <div className="mb-4" style={{ color: '#ff8c42', fontSize: 28 }}>⏳</div>
            <p className="text-sm mb-2" style={{ color: '#f5f5f5' }}>
              SecondMe 登录窗口已打开
            </p>
            <p className="text-xs mb-6" style={{ color: '#666' }}>
              在弹窗中完成登录后将自动跳转
            </p>
            <button
              onClick={() => { stopPolling(); popupRef.current?.close(); setStatus('idle') }}
              className="text-sm"
              style={{ color: '#555' }}
            >
              取消
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
