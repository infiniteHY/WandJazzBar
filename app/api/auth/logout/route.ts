import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  cookies().delete('sm_token')
  cookies().delete('sm_refresh_token')
  cookies().delete('sm_user_name')

  return NextResponse.json({ success: true })
}
