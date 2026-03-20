import { NextRequest, NextResponse } from 'next/server'
import { exchangeCodeForToken, getSecondMeUser } from '@/lib/secondme'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  const { code } = await request.json()

  if (!code || !code.startsWith('smc-')) {
    return NextResponse.json({ error: '授权码格式不正确，应以 smc- 开头' }, { status: 400 })
  }

  try {
    const tokenData = await exchangeCodeForToken(code)
    const userData = await getSecondMeUser(tokenData.accessToken)

    cookies().set('sm_token', tokenData.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
    })

    cookies().set('sm_user_name', userData.name || '', {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
    })

    return NextResponse.json({ success: true, name: userData.name })
  } catch (error) {
    console.error('Code exchange error:', error)
    return NextResponse.json({ error: '授权码无效或已过期，请重新获取' }, { status: 401 })
  }
}
