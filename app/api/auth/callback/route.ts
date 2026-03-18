import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { exchangeCodeForToken, getSecondMeUser } from '@/lib/secondme'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('code')

  if (!code) {
    return NextResponse.redirect(new URL('/?error=no_code', request.url))
  }

  try {
    // 交换授权码获取 Token
    const tokenData = await exchangeCodeForToken(
      code,
      process.env.SECONDME_CALLBACK_URL!
    )

    // 获取用户信息
    const userData = await getSecondMeUser(tokenData.accessToken)

    // 计算 Token 过期时间
    const expiresAt = tokenData.expiresIn
      ? new Date(Date.now() + tokenData.expiresIn * 1000)
      : null

    // 使用 route 或 email 作为用户唯一标识
    const userId = userData.route || userData.email || userData.name

    // 保存或更新用户信息到数据库
    const user = await prisma.user.upsert({
      where: { secondme_id: userId },
      update: {
        access_token: tokenData.accessToken,
        refresh_token: tokenData.refreshToken,
        token_expires_at: expiresAt,
        nickname: userData.name,
        avatar: userData.avatarUrl,
        bio: undefined,
      },
      create: {
        secondme_id: userId,
        access_token: tokenData.accessToken,
        refresh_token: tokenData.refreshToken,
        token_expires_at: expiresAt,
        nickname: userData.name,
        avatar: userData.avatarUrl,
        bio: undefined,
      },
    })

    // 设置会话 Cookie
    cookies().set('user_id', user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    })

    // 重定向到首页
    return NextResponse.redirect(new URL('/profile', request.url))
  } catch (error) {
    console.error('OAuth callback error:', error)
    return NextResponse.redirect(new URL('/?error=auth_failed', request.url))
  }
}
