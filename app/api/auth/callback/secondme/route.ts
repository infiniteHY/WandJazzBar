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

    let userName = ''
    try {
      const userData = await getSecondMeUser(tokenData.accessToken)
      userName = userData.name || ''
    } catch {
      // 用户信息获取失败不阻塞登录
    }

    cookies().set('sm_token', tokenData.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
    })

    cookies().set('sm_user_name', userName, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
    })

    // 授权成功，直接跳转到 jazz-bar
    return NextResponse.redirect(new URL('/jazz-bar', request.url))
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'auth_failed'
    console.error('OAuth callback error:', msg)
    return NextResponse.redirect(new URL(`/?error=${encodeURIComponent(msg)}`, request.url))
  }
}
