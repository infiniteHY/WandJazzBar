import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('sm_token')?.value
  const { pathname } = request.nextUrl

  // 保护 /jazz-bar 路由
  if (pathname.startsWith('/jazz-bar') && !token) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/jazz-bar/:path*'],
}
