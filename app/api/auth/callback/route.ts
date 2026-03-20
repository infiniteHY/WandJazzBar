import { NextRequest, NextResponse } from 'next/server'

// 兼容旧回调路径，转发到新路径
export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code')
  const target = new URL('/api/auth/callback/secondme', request.url)
  if (code) target.searchParams.set('code', code)
  return NextResponse.redirect(target)
}
