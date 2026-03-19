import { NextResponse } from 'next/server'

const PROD_URL = 'https://wandjazzbar.vercel.app'

function getBaseUrl() {
  if (process.env.NODE_ENV === 'production') return PROD_URL
  return process.env.NEXTAUTH_URL || 'http://localhost:3000'
}

export async function GET() {
  // SecondMe 授权成功后回调到根路径，带 ?code=smc-xxx
  const redirectUri = getBaseUrl()
  const authUrl = `https://second-me.cn/third-party-agent/auth?redirect=${encodeURIComponent(redirectUri)}`
  return NextResponse.redirect(authUrl)
}
