import { NextResponse } from 'next/server'

const SECONDME_AUTH_URL = 'https://second-me.cn/third-party-agent/auth'
const REDIRECT_URI = process.env.SECONDME_REDIRECT_URI || 'https://wandjazzbar.vercel.app/api/auth/callback/secondme'

export async function GET() {
  // SecondMe 授权页带 redirect 参数，授权成功后回调带 ?code=smc-xxx
  const authUrl = `${SECONDME_AUTH_URL}?redirect=${encodeURIComponent(REDIRECT_URI)}`
  return NextResponse.redirect(authUrl)
}
