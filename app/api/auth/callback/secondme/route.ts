import { NextRequest, NextResponse } from 'next/server'
import { exchangeCodeForToken, getSecondMeUser } from '@/lib/secondme'

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

    // 必须在 NextResponse 对象上设置 cookie，不能用 cookies() API
    // 否则 redirect 响应不会携带 cookie
    const response = NextResponse.redirect(new URL('/jazz-bar', request.url))

    response.cookies.set('sm_token', tokenData.accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: tokenData.expiresIn || 7200,
      path: '/',
    })

    if (tokenData.refreshToken) {
      response.cookies.set('sm_refresh_token', tokenData.refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30,
        path: '/',
      })
    }

    response.cookies.set('sm_user_name', userName, {
      httpOnly: false,
      secure: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
    })

    return response
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'auth_failed'
    console.error('OAuth callback error:', msg)
    return NextResponse.redirect(new URL(`/?error=${encodeURIComponent(msg)}`, request.url))
  }
}
