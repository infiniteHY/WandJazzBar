'use client'

import { useEffect } from 'react'

export default function AuthDone() {
  useEffect(() => {
    // 通知父窗口登录成功，然后关闭弹窗
    if (window.opener) {
      window.opener.postMessage({ type: 'secondme_auth_done' }, window.location.origin)
      window.close()
    }
  }, [])

  return (
    <div style={{ background: '#1a1a1a', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: '#ff8c42', textAlign: 'center' }}>
        <div style={{ fontSize: 36, marginBottom: 12 }}>🎷</div>
        <p style={{ color: '#aaa' }}>登录成功，窗口正在关闭...</p>
      </div>
    </div>
  )
}
