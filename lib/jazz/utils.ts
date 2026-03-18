export interface MixingParams {
  base_spirit: string
  ingredients: string[]
  mood: string
  mood_intensity: number
  ice_level: string
  shake_level: string
}

/**
 * 构造 JazzTrack 唯一键
 *
 * 规则：{base_spirit}_{sorted_ingredients}_{mood}_{mood_intensity}_{ice_level}_{shake_level}
 *
 * 示例：whiskey_lemon+smoke_sad_3_heavy_medium
 */
export function buildJazzTrackId(params: MixingParams): string {
  const sortedIngredients = [...params.ingredients].sort().join('+')
  return `${params.base_spirit}_${sortedIngredients}_${params.mood}_${params.mood_intensity}_${params.ice_level}_${params.shake_level}`
}

/**
 * 验证调酒参数有效性
 */
export function validateMixingParams(params: Partial<MixingParams>): params is MixingParams {
  return !!(
    params.base_spirit &&
    params.ingredients &&
    params.ingredients.length > 0 &&
    params.mood &&
    params.mood_intensity &&
    params.mood_intensity >= 1 &&
    params.mood_intensity <= 5 &&
    params.ice_level &&
    params.shake_level
  )
}
