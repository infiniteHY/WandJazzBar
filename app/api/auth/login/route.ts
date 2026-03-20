import { NextResponse } from 'next/server'

const OAUTH_URL = 'https://go.second.me/oauth/'

export async function GET() {
  const params = new URLSearchParams({
    client_id: process.env.SECONDME_CLIENT_ID || '',
    redirect_uri: process.env.SECONDME_REDIRECT_URI || 'https://wandjazzbar.vercel.app/api/auth/callback/secondme',
    response_type: 'code',
  })

  const authUrl = `${OAUTH_URL}?${params.toString()}`
  return NextResponse.redirect(authUrl)
}
