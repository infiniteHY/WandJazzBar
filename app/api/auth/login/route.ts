import { NextResponse } from 'next/server'

export async function GET() {
  const base = process.env.NEXTAUTH_URL || 'http://localhost:3000'
  const callbackUrl = `${base}/api/auth/callback`
  const authUrl = `https://second-me.cn/third-party-agent/auth?redirect=${encodeURIComponent(callbackUrl)}`
  return NextResponse.redirect(authUrl)
}
