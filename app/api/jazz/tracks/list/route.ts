import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const revalidate = 0

/**
 * GET /api/jazz/tracks/list
 *
 * Returns the most recently generated tracks for the saved library.
 * Query params:
 * - limit: max rows (default 60)
 */
export async function GET(request: NextRequest) {
  try {
    if (!prisma) {
      return NextResponse.json({ success: true, tracks: [] })
    }
    const { searchParams } = new URL(request.url)
    const limit = Math.min(parseInt(searchParams.get('limit') || '60', 10) || 60, 200)

    const tracks = await prisma.jazzTrack.findMany({
      orderBy: { created_at: 'desc' },
      take: limit,
    })

    return NextResponse.json({ success: true, tracks })
  } catch (error) {
    console.error('[Jazz API] list error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to load library' },
      { status: 500 }
    )
  }
}
