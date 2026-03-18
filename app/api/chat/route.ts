import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { getChatList, sendMessage } from '@/lib/secondme'

// 获取聊天列表
export async function GET(request: NextRequest) {
  const userId = cookies().get('user_id')?.value

  if (!userId) {
    return NextResponse.json({ error: '未登录' }, { status: 401 })
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      return NextResponse.json({ error: '用户不存在' }, { status: 404 })
    }

    const chatList = await getChatList(user.access_token)
    return NextResponse.json(chatList)
  } catch (error) {
    console.error('Get chat list error:', error)
    return NextResponse.json({ error: '获取聊天列表失败' }, { status: 500 })
  }
}

// 发送消息
export async function POST(request: NextRequest) {
  const userId = cookies().get('user_id')?.value

  if (!userId) {
    return NextResponse.json({ error: '未登录' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { chatId, content } = body

    if (!chatId || !content) {
      return NextResponse.json({ error: '参数缺失' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      return NextResponse.json({ error: '用户不存在' }, { status: 404 })
    }

    const message = await sendMessage(user.access_token, chatId, content)
    return NextResponse.json(message)
  } catch (error) {
    console.error('Send message error:', error)
    return NextResponse.json({ error: '发送消息失败' }, { status: 500 })
  }
}
