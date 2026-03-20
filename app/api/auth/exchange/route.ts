import { NextRequest, NextResponse } from 'next/server'
import { exchangeCodeForToken, getSecondMeUser } from '@/lib/secondme'

export async function POST(request: NextRequest) {
  const { code } = await request.json()

  if (!code) {
    return NextResponse.json({ error: '授权码不能为空' }, { status: 400 })
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

    const response = NextResponse.json({ success: true, name: userName })

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
    console.error('Code exchange error:', error)
    return NextResponse.json({ error: '授权码无效或已过期，请重新获取' }, { status: 401 })
  }
}
