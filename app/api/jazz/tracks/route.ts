import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { buildJazzTrackId, validateMixingParams, type MixingParams } from '@/lib/jazz/utils'
import { generateWithVectrust } from '@/lib/jazz/generator'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const revalidate = 0

function hasChineseText(value: string | null | undefined): boolean {
  return /[\u3400-\u9fff]/.test(value || '')
}

/**
 * GET /api/jazz/tracks
 *
 * Query or generate a jazz track.
 *
 * Query params:
 * - base_spirit: string
 * - ingredients: string[]
 * - mood: string
 * - mood_intensity: number
 * - ice_level: string
 * - shake_level: string
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    // Parse parameters.
    const params: Partial<MixingParams> = {
      base_spirit: searchParams.get('base_spirit') || undefined,
      ingredients: searchParams.getAll('ingredients'),
      mood: searchParams.get('mood') || undefined,
      mood_intensity: searchParams.get('mood_intensity')
        ? parseInt(searchParams.get('mood_intensity')!)
        : undefined,
      ice_level: searchParams.get('ice_level') || undefined,
      shake_level: searchParams.get('shake_level') || undefined
    }

    // Validate parameters.
    if (!validateMixingParams(params)) {
      return NextResponse.json({
        error: 'Missing or invalid parameters'
      }, { status: 400 })
    }

    // Build the cache key.
    const trackId = buildJazzTrackId(params)
    const forceGenerate = searchParams.get('force') === 'true' || searchParams.get('force') === '1'

    let track: any = null
    let isNew = false
    let shouldRefreshCachedTrack = false

    // Try the database cache first.
    if (prisma && !forceGenerate) {
      try {
        track = await prisma.jazzTrack.findUnique({
          where: { id: trackId }
        })
        if (track) {
          console.log('[Jazz API] Cache hit:', trackId)
          if (!hasChineseText(track.track_name_zh) || !hasChineseText(track.poem_zh)) {
            console.log('[Jazz API] Cached bilingual fields are stale; regenerating:', trackId)
            shouldRefreshCachedTrack = true
            track = null
          }
        }
      } catch (dbError) {
        console.warn('[Jazz API] Database query failed; skipping cache:', dbError)
      }
    }

    // Generate a new track on cache miss.
    if (!track) {
      isNew = true
      shouldRefreshCachedTrack = shouldRefreshCachedTrack || forceGenerate

      let generated
      try {
        console.log('[Jazz API] Generating track:', trackId)
        console.log('[Jazz API] ENV check:', {
          baseUrl: process.env.VECTRUST_BASE_URL || '(missing)',
          model: process.env.VECTRUST_MODEL || '(missing)',
          keyPrefix: (process.env.VECTRUST_API_KEY || '').slice(0, 8) + '...',
        })
        generated = await generateWithVectrust(params)
        console.log('[Jazz API] Track generated')
      } catch (error) {
        console.error('[Jazz API] Vectrust generation failed:', error)
        const errDetail = error instanceof Error ? { message: error.message, name: error.name, stack: error.stack?.slice(0, 500) } : error
        console.error('[Jazz API] Error detail:', JSON.stringify(errDetail))
        return NextResponse.json({
          success: false,
          error: 'Track generation failed',
          message: error instanceof Error ? `${error.name}: ${error.message}` : 'Unknown generation error'
        }, { status: 502 })
      }

      const trackData = {
        id: trackId,
        base_spirit: params.base_spirit,
        ingredients: JSON.stringify(params.ingredients),
        mood: params.mood,
        mood_intensity: params.mood_intensity,
        ice_level: params.ice_level,
        shake_level: params.shake_level,
        track_name_en: generated.music.track_name_en,
        track_name_zh: generated.music.track_name_zh,
        poem_en: JSON.stringify(generated.music.poem_en),
        poem_zh: JSON.stringify(generated.music.poem_zh),
        bpm: generated.music.bpm,
        key: generated.music.key,
        mode: generated.music.mode,
        time_signature: generated.music.time_signature,
        style: generated.music.style,
        chord_progression: JSON.stringify(generated.music.chord_progression),
        melody: JSON.stringify(generated.music.melody),
        instruments: JSON.stringify(generated.music.instruments)
      }

      // Best-effort database write; response should still succeed if it fails.
      if (prisma) {
        try {
          track = shouldRefreshCachedTrack
            ? await prisma.jazzTrack.upsert({
                where: { id: trackId },
                create: trackData,
                update: trackData,
              })
            : await prisma.jazzTrack.create({ data: trackData })
        } catch (dbError) {
          console.warn('[Jazz API] Database write failed; returning directly:', dbError)
          track = { ...trackData, play_count: 0, created_at: new Date(), updated_at: new Date() }
        }
      } else {
        track = { ...trackData, play_count: 0, created_at: new Date(), updated_at: new Date() }
      }
    }

    return NextResponse.json({
      success: true,
      track,
      isNew
    })

  } catch (error) {
    console.error('[Jazz API] Error:', error)
    return NextResponse.json({
      error: 'Server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
