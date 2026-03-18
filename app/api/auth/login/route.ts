import { NextResponse } from 'next/server'

export async function GET() {
  const authEndpoint = process.env.SECONDME_AUTH_ENDPOINT!
  const clientId = process.env.SECONDME_CLIENT_ID!
  const callbackUrl = process.env.SECONDME_CALLBACK_URL!
  const scopes = process.env.SECONDME_SCOPES!

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: callbackUrl,
    response_type: 'code',
  })

  // 注意：根据文档，直接在 OAuth URL 后拼接参数即可
  const authUrl = `${authEndpoint}?${params.toString()}`

  return NextResponse.redirect(authUrl)
}
