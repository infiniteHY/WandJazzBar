import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { getNoteList, createNote, updateNote, deleteNote } from '@/lib/secondme'

// 获取笔记列表
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

    const noteList = await getNoteList(user.access_token)
    return NextResponse.json(noteList)
  } catch (error) {
    console.error('Get note list error:', error)
    return NextResponse.json({ error: '获取笔记列表失败' }, { status: 500 })
  }
}

// 创建笔记
export async function POST(request: NextRequest) {
  const userId = cookies().get('user_id')?.value

  if (!userId) {
    return NextResponse.json({ error: '未登录' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { title, content } = body

    if (!title || !content) {
      return NextResponse.json({ error: '标题和内容不能为空' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      return NextResponse.json({ error: '用户不存在' }, { status: 404 })
    }

    const note = await createNote(user.access_token, title, content)
    return NextResponse.json(note)
  } catch (error) {
    console.error('Create note error:', error)
    return NextResponse.json({ error: '创建笔记失败' }, { status: 500 })
  }
}

// 更新笔记
export async function PATCH(request: NextRequest) {
  const userId = cookies().get('user_id')?.value

  if (!userId) {
    return NextResponse.json({ error: '未登录' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { noteId, title, content } = body

    if (!noteId || !title || !content) {
      return NextResponse.json({ error: '参数缺失' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      return NextResponse.json({ error: '用户不存在' }, { status: 404 })
    }

    const note = await updateNote(user.access_token, noteId, title, content)
    return NextResponse.json(note)
  } catch (error) {
    console.error('Update note error:', error)
    return NextResponse.json({ error: '更新笔记失败' }, { status: 500 })
  }
}

// 删除笔记
export async function DELETE(request: NextRequest) {
  const userId = cookies().get('user_id')?.value

  if (!userId) {
    return NextResponse.json({ error: '未登录' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const noteId = searchParams.get('noteId')

    if (!noteId) {
      return NextResponse.json({ error: '笔记 ID 缺失' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      return NextResponse.json({ error: '用户不存在' }, { status: 404 })
    }

    await deleteNote(user.access_token, noteId)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete note error:', error)
    return NextResponse.json({ error: '删除笔记失败' }, { status: 500 })
  }
}
