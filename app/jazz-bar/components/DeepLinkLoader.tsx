'use client'

import { useEffect, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { useJazzBar } from '../context/JazzBarContext'
import { decodeMix } from '@/lib/jazz/share'

// Reads a shared ?mix=<token> param and jumps straight to the result screen,
// reproducing whatever cocktail the shared link encoded. Renders nothing.
export default function DeepLinkLoader() {
  const { dispatch } = useJazzBar()
  const searchParams = useSearchParams()
  const handled = useRef(false)

  useEffect(() => {
    if (handled.current) return
    const mix = decodeMix(searchParams.get('mix'))
    if (!mix) return
    handled.current = true

    dispatch({ type: 'SET_BASE_SPIRIT', spirit: mix.base_spirit })
    mix.ingredients.forEach(ing =>
      dispatch({ type: 'TOGGLE_INGREDIENT', ingredient: ing })
    )
    dispatch({ type: 'SET_MOOD', mood: mix.mood, intensity: mix.mood_intensity })
    dispatch({ type: 'SET_ICE_LEVEL', level: mix.ice_level })
    dispatch({ type: 'SET_SHAKE_LEVEL', level: mix.shake_level })
    dispatch({ type: 'SET_STEP', step: 'result' })
  }, [searchParams, dispatch])

  return null
}
