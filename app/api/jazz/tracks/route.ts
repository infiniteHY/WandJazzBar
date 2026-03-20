import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { buildJazzTrackId, validateMixingParams, type MixingParams } from '@/lib/jazz/utils'
import { generateWithMiniMax , getFallbackTrack } from '@/lib/jazz/generator'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const revalidate = 0

/**
 * GET /api/jazz/tracks
 *
 * 查询或生成音轨
 *
 * Query params:
 * - base_spirit: string
 * - ingredients: string[] (可多个)
 * - mood: string
 * - mood_intensity: number
 * - ice_level: string
 * - shake_level: string
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    // 解析参数
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

    // 验证参数
    if (!validateMixingParams(params)) {
      return NextResponse.json({
        error: '参数不完整或无效'
      }, { status: 400 })
    }

    // 构造唯一键
    const trackId = buildJazzTrackId(params)

    let track: any = null
    let isNew = false

    // 尝试从数据库查询缓存
    if (prisma) {
      try {
        track = await prisma.jazzTrack.findUnique({
          where: { id: trackId }
        })
        if (track) {
          console.log('[Jazz API] 命中缓存:', trackId)
        }
      } catch (dbError) {
        console.warn('[Jazz API] 数据库查询失败，跳过缓存:', dbError)
      }
    }

    // 如果不存在，生成新音轨
    if (!track) {
      isNew = true

      let generated
      try {
        console.log('[Jazz API] 生成新音轨:', trackId)
        generated = await generateWithMiniMax(params)
        console.log('[Jazz API] 音轨生成成功')
      } catch (error) {
        console.error('[Jazz API] MiniMax 生成失败，使用降级方案:', error)
        generated = getFallbackTrack(params)
        console.log('[Jazz API] 使用降级模板成功')
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

      // 尝试存入数据库，失败不影响返回
      if (prisma) {
        try {
          track = await prisma.jazzTrack.create({ data: trackData })
        } catch (dbError) {
          console.warn('[Jazz API] 数据库写入失败，直接返回:', dbError)
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
    console.error('[Jazz API] 错误:', error)
    return NextResponse.json({
      error: '服务器错误',
      message: error instanceof Error ? error.message : '未知错误'
    }, { status: 500 })
  }
}
