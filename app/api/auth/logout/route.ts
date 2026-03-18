import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  // 清除会话 Cookie
  cookies().delete('user_id')

  return NextResponse.json({ success: true })
}
