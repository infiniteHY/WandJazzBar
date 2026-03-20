import { NextResponse } from 'next/server'
import crypto from 'crypto'

const OAUTH_URL = 'https://go.second.me/oauth/'

export async function GET() {
  const state = crypto.randomBytes(16).toString('hex')

  const params = new URLSearchParams({
    client_id: process.env.SECONDME_CLIENT_ID || '',
    redirect_uri: process.env.SECONDME_REDIRECT_URI || 'https://wandjazzbar.vercel.app/api/auth/callback/secondme',
    response_type: 'code',
    state,
  })

  // 官方文档：直接在 oauth_url 后拼接 ? 和查询参数
  const authUrl = `${OAUTH_URL}?${params.toString()}`
  return NextResponse.redirect(authUrl)
}
