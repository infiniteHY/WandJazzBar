import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { getSecondMeUser, refreshAccessToken } from '@/lib/secondme'

export async function GET(request: NextRequest) {
  const userId = cookies().get('user_id')?.value

  if (!userId) {
    return NextResponse.json({ error: '未登录' }, { status: 401 })
  }

  try {
    let user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      return NextResponse.json({ error: '用户不存在' }, { status: 404 })
    }

    // 检查 Token 是否过期
    if (user.token_expires_at && user.token_expires_at < new Date()) {
      // Token 过期，尝试刷新
      if (user.refresh_token) {
        const tokenData = await refreshAccessToken(user.refresh_token)
        const expiresAt = tokenData.expiresIn
          ? new Date(Date.now() + tokenData.expiresIn * 1000)
          : null

        user = await prisma.user.update({
          where: { id: userId },
          data: {
            access_token: tokenData.accessToken,
            refresh_token: tokenData.refreshToken,
            token_expires_at: expiresAt,
          },
        })
      } else {
        return NextResponse.json({ error: 'Token 已过期，请重新登录' }, { status: 401 })
      }
    }

    // 获取最新的用户信息
    const secondMeUser = await getSecondMeUser(user.access_token)

    // 更新数据库中的用户信息
    await prisma.user.update({
      where: { id: userId },
      data: {
        nickname: secondMeUser.name,
        avatar: secondMeUser.avatarUrl,
      },
    })

    return NextResponse.json({
      id: user.secondme_id,
      nickname: secondMeUser.name,
      avatar: secondMeUser.avatarUrl,
      email: secondMeUser.email,
    })
  } catch (error) {
    console.error('Get profile error:', error)
    return NextResponse.json({ error: '获取用户信息失败' }, { status: 500 })
  }
}
