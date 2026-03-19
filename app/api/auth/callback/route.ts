import { NextRequest, NextResponse } from 'next/server'
import { exchangeCodeForToken, getSecondMeUser } from '@/lib/secondme'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code')

  if (!code) {
    return NextResponse.redirect(new URL('/?error=no_code', request.url))
  }

  try {
    const tokenData = await exchangeCodeForToken(code)
    const userData = await getSecondMeUser(tokenData.accessToken)

    cookies().set('sm_token', tokenData.accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
    })

    cookies().set('sm_user_name', userData.name || '', {
      httpOnly: false,
      secure: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
    })

    return NextResponse.redirect(new URL('/jazz-bar', request.url))
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'auth_failed'
    console.error('OAuth callback error:', msg)
    return NextResponse.redirect(new URL(`/?error=${encodeURIComponent(msg)}`, request.url))
  }
}
