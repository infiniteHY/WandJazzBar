import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const response = NextResponse.json({ success: true })

  response.cookies.delete('sm_token')
  response.cookies.delete('sm_refresh_token')
  response.cookies.delete('sm_user_name')

  return response
}
