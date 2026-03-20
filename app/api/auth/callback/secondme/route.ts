import { NextRequest, NextResponse } from 'next/server'
import { exchangeCodeForToken, getSecondMeUser } from '@/lib/secondme'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code')

  if (!code) {
    return NextResponse.redirect(new URL('/?error=no_code', request.url))
  }

  try {
    // 用授权码换取 token（授权码前缀 lba_ac_，有效期 5 分钟）
    const tokenData = await exchangeCodeForToken(code)

    // 存储 access_token
    cookies().set('sm_token', tokenData.accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: tokenData.expiresIn || 7200,
      path: '/',
    })

    // 存储 refresh_token（30 天有效）
    if (tokenData.refreshToken) {
      cookies().set('sm_refresh_token', tokenData.refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30,
        path: '/',
      })
    }

    // 获取用户信息（不阻塞登录）
    let userName = ''
    try {
      const userData = await getSecondMeUser(tokenData.accessToken)
      userName = userData.name || ''
    } catch {
      // 用户信息获取失败不影响登录
    }

    cookies().set('sm_user_name', userName, {
      httpOnly: false,
      secure: true,
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
