import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const token = request.cookies.get('sm_token')?.value
  return NextResponse.json({ authenticated: !!token })
}
