import Anthropic from '@anthropic-ai/sdk'
import { MixingParams } from './utils'

const client = new Anthropic({
  apiKey: process.env.VECTRUST_API_KEY || '',
  baseURL: process.env.VECTRUST_BASE_URL || 'https://api.openai-next.com',
})

const MODEL = process.env.VECTRUST_MODEL || 'claude-opus-4-7'

export interface GeneratedTrack {
  id: string

  input_params: {
    base_spirit: string
    ingredients: string[]
    mood: string
    mood_intensity: number
    ice_level: string
    shake_level: string
  }

  tags: {
    style: string
    mode: string
    energy_level: string
    rhythm_complexity: string
    brightness: string
    texture: string[]
  }

  music: {
    track_name_en: string
    track_name_zh: string
    poem_en: string[]
    poem_zh: string[]
    bpm: number
    key: string
    mode: string
    time_signature: string
    style: string
    chord_progression: string[]
    melody: Array<{
      note: string
      duration: string
      time: number
    }>
    instruments: string[]
  }

  meta: {
    version: string
    generated_at: string
    generator: string
    valid: boolean
  }
}

/**
 * Build the system prompt.
 */
function buildSystemPrompt(): string {
  return `You are an expert jazz composer with strong cocktail aesthetics.
Create one complete jazz track from the supplied cocktail parameters.
Return strict JSON only. Do not include explanations, markdown fences, or extra text.

Output schema:

{
"id": "base_spirit_ingredient_mood_intensity_ice_shake",
"input_params": {
"base_spirit": "whiskey | gin | rum | tequila",
"ingredients": "lemon | mint | coffee | smoke | honey | soda",
"mood": "calm | sad | mysterious | romantic | energetic",
"mood_intensity": "integer from 1 to 5",
"ice_level": "none | light | heavy",
"shake_level": "soft | medium | hard"
},
"tags": {
"style": "blues | swing | latin | experimental",
"mode": "major | minor | diminished | major7 | mixolydian",
"energy_level": "low | medium | high, derived from bpm: below 80 low, 80-120 medium, above 120 high",
"rhythm_complexity": "low | medium | high, derived from shake_level",
"brightness": "bright | dark | warm | fresh, derived from ingredients",
"texture": ["staccato", "legato", "syncopation", "swing"]
},
"music": {
"track_name_en": "classic literary jazz title, e.g. Nocturne in ..., Reverie of ..., Serenade of ..., Ballad of ...; avoid modern words",
"track_name_zh": "Chinese title, 2-6 characters, poetic and concise",
"poem_en": [
"line one, 8-12 syllables, rhymed",
"line two, 8-12 syllables, rhymed",
"line three, 8-12 syllables, rhymed",
"line four, 8-12 syllables, rhymed"
],
"poem_zh": [
"Chinese line one, 5-8 characters",
"Chinese line two, 5-8 characters",
"Chinese line three, 5-8 characters",
"Chinese line four, 5-8 characters"
],
"bpm": "number from 60 to 160",
"key": "e.g. C Major or A Minor",
"mode": "major | minor | diminished | major7 | mixolydian",
"time_signature": "2/4 | 3/4 | 4/4",
"style": "blues | swing | latin | experimental",
"chord_progression": ["chord 1", "chord 2", "chord 3", "chord 4"],
"melody": [
{ "note": "C4", "duration": "4n", "time": 0 }
],
"instruments": ["2-4 instruments, e.g. piano, bass, drums, saxophone, guitar"]
},
"meta": {
"version": "v1",
"generated_at": "ISO timestamp, e.g. 2026-03-18T00:00:00Z",
"generator": "vectrust",
"valid": true
}
}

Composition rules:

1. Base spirit sets the core style.
   - whiskey -> Blues / Slow Jazz, BPM 60-80, strong blues scale color
   - gin -> Light Swing, BPM 100-130, airy and bouncing
   - rum -> Latin Jazz, BPM 100-140, syncopated pulse
   - tequila -> Experimental / Fast, BPM 130-160, irregular rhythm

2. Mood sets mode.
   - calm -> Major, peaceful movement
   - sad -> Minor, descending melodic gestures
   - mysterious -> Diminished, unstable harmony
   - romantic -> Major 7th, gentle tension
   - energetic -> Mixolydian, forward drive

3. Mood intensity controls melodic range.
   - 1-2: stable melody, small intervals of 2-3 degrees
   - 3: moderate contour, 3-5 degrees
   - 4-5: wider leaps, dramatic movement of 6-8 degrees

4. Ingredients add details.
   - lemon -> staccato, bright upper-register notes
   - mint -> swing feel and ornaments
   - coffee -> richer extended chords such as #11 or b9
   - smoke -> lower register emphasis and blues slides
   - honey -> legato and softer dynamics
   - soda -> lighter texture and open spacing

5. Ice level shapes rhythm.
   - none -> continuous legato with few pauses
   - light -> tasteful rests
   - heavy -> syncopation and small breaks

6. Shake level controls complexity.
   - soft -> smooth 4/4 and basic groove
   - medium -> stronger swing eighth notes
   - hard -> triplets, syncopation, irregular accents

Naming rules:
- Use literary classic jazz titles.
- Preferred patterns: Nocturne in [adjective], Reverie of [image], [adjective] Serenade, Ballad of [image].
- Avoid modern words such as Mix, Blend, Cool, or Vibe.
- track_name_en and poem_en must be English.
- track_name_zh and poem_zh must be Chinese.
- The English poem and Chinese poem should share the same mood, but the Chinese version should read like an independent short poem rather than a literal translation.

Poem rules:
- Four English lines.
- Each line should have 8-12 syllables and a jazz-night atmosphere.
- Use ABAB or AABB rhyme.
- Four Chinese lines.
- Each Chinese line should have 5-8 Chinese characters with compact imagery.

Melody format:
- note: standard pitch name such as C4, D#4, or Bb3.
- duration: Tone.js duration such as "4n", "8n", "2n", or "16n".
- time: numeric beat offset from the beginning.

Strict constraints:
- Output JSON only.
- JSON must be valid and directly parseable.
- melody must contain 16-24 events.
- chord_progression must contain exactly 4 chords.
- instruments must contain 2-4 instruments.

Example output:

{
  "id": "whiskey_lemon_sad_3_heavy_medium",

  "input_params": {
    "base_spirit": "whiskey",
    "ingredients": ["lemon"],
    "mood": "sad",
    "mood_intensity": 3,
    "ice_level": "heavy",
    "shake_level": "medium"
  },

  "tags": {
    "style": "blues",
    "mode": "minor",
    "energy_level": "low",
    "rhythm_complexity": "medium",
    "brightness": "bright",
    "texture": ["staccato", "syncopation"]
  },

  "music": {
    "track_name_en": "Nocturne in Bitter Citrus",
    "track_name_zh": "柠夜曲",

    "poem_en": [
      "A bitter note in silent air,",
      "The glass reflects a dim despair,",
      "Through fractured light the shadows bend,",
      "A lonely tune without an end."
    ],

    "poem_zh": [
      "柠影浮残夜",
      "孤杯映微凉",
      "风动旧时梦",
      "曲终人未央"
    ],

    "bpm": 68,
    "key": "A Minor",
    "mode": "minor",
    "time_signature": "4/4",
    "style": "blues",

    "chord_progression": ["Am7", "Dm7", "E7", "Am7"],

    "melody": [
      { "note": "A4", "duration": "4n", "time": 0 },
      { "note": "C5", "duration": "8n", "time": 1 },
      { "note": "E5", "duration": "8n", "time": 1.5 },
      { "note": "G5", "duration": "4n", "time": 2 },
      { "note": "E5", "duration": "4n", "time": 3 },
      { "note": "D5", "duration": "4n", "time": 4 },
      { "note": "C5", "duration": "8n", "time": 5 },
      { "note": "A4", "duration": "8n", "time": 5.5 },
      { "note": "G4", "duration": "4n", "time": 6 },
      { "note": "E4", "duration": "2n", "time": 7 },
      { "note": "A3", "duration": "4n", "time": 9 },
      { "note": "C4", "duration": "8n", "time": 10 },
      { "note": "D4", "duration": "8n", "time": 10.5 },
      { "note": "E4", "duration": "4n", "time": 11 },
      { "note": "G4", "duration": "4n", "time": 12 },
      { "note": "A4", "duration": "2n", "time": 13 }
    ],

    "instruments": ["piano", "bass", "drums", "saxophone"]
  },

  "meta": {
    "version": "v1",
    "generated_at": "2026-03-18T00:00:00Z",
    "generator": "vectrust",
    "valid": true
  }
}`
}

/**
 * Build the user prompt.
 */
function buildUserPrompt(params: MixingParams): string {
  return `Return only one valid JSON object. The first character must be "{" and the last character must be "}".
Do not output markdown, headings, commentary, tables, explanations, or code fences.
Do not write a prose composition brief. Generate the JSON data directly.

Compose one jazz track for this cocktail combination:

base_spirit: ${params.base_spirit}
ingredients: ${JSON.stringify(params.ingredients)}
mood: ${params.mood}
mood_intensity: ${params.mood_intensity}/5
ice_level: ${params.ice_level}
shake_level: ${params.shake_level}

Follow the parameter mapping rules and generate an atmospheric jazz track.

Again: return only valid JSON.`
}

/**
 * Extract JSON while ignoring any accidental surrounding text.
 */
function extractJSON(text: string): string {
  const start = text.indexOf('{')
  if (start === -1) throw new Error("JSON not found")

  let depth = 0
  let inString = false
  let escape = false

  for (let i = start; i < text.length; i++) {
    const ch = text[i]
    if (escape) { escape = false; continue }
    if (ch === '\\' && inString) { escape = true; continue }
    if (ch === '"' && !escape) { inString = !inString; continue }
    if (inString) continue
    if (ch === '{') depth++
    if (ch === '}') { depth--; if (depth === 0) return text.slice(start, i + 1) }
  }

  // Try to repair truncated JSON.
  if (depth > 0) {
    let truncated = text.slice(start)
    // Remove a trailing incomplete element, such as a truncated melody object.
    const lastComplete = truncated.lastIndexOf('}')
    if (lastComplete > 0) {
      truncated = truncated.slice(0, lastComplete + 1)
    }
    // Close missing arrays and objects.
    while (depth > 0) {
      if (truncated.lastIndexOf('[') > truncated.lastIndexOf(']')) {
        truncated += ']'
      }
      truncated += '}'
      depth--
    }
    return truncated
  }

  throw new Error("Complete JSON not found")
}

/**
 * Main generation function using the Anthropic-compatible Vectrust API.
 */
export async function generateWithVectrust(
  params: MixingParams
): Promise<GeneratedTrack> {
  let lastError: unknown

  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 8192,
      temperature: 0.4,
      messages: [
        {
          role: "user",
          content: `${buildSystemPrompt()}\n\n${buildUserPrompt(params)}`
        }
      ]
    })

    let text = ""
    for (const block of response.content) {
      if (block.type === "text") {
        text += block.text
      }
    }
    if (!text) throw new Error("Empty response")

    console.log("[Vectrust] stop_reason:", response.stop_reason, "usage:", JSON.stringify(response.usage))
    console.log("[Vectrust] raw:", text.slice(0, 200), "...(length:", text.length, ")")

    /**
     * Extract JSON.
     */
    const jsonStr = extractJSON(text)
    let parsed: GeneratedTrack

    try {
      parsed = JSON.parse(jsonStr) as GeneratedTrack
    } catch (parseErr) {
      console.warn("JSON parse failed, attempting repair:", (parseErr as Error).message)
      let repaired = jsonStr

      // Add missing commas between adjacent strings.
      repaired = repaired.replace(/"(\s*\n\s*)"/g, '",\n"')
      // Add missing commas between adjacent objects.
      repaired = repaired.replace(/\}(\s*\n\s*)\{/g, '},\n{')
      // Remove trailing commas.
      repaired = repaired.replace(/,(\s*[\]\}])/g, '$1')
      // Remove a trailing incomplete object member.
      repaired = repaired.replace(/,\s*\{\s*"[^"]*"\s*:\s*"?[^}\]]*$/, '')

      // Close missing brackets.
      const opens = (repaired.match(/\[/g) || []).length - (repaired.match(/\]/g) || []).length
      const braces = (repaired.match(/\{/g) || []).length - (repaired.match(/\}/g) || []).length
      for (let i = 0; i < opens; i++) repaired += ']'
      for (let i = 0; i < braces; i++) repaired += '}'

      parsed = JSON.parse(repaired) as GeneratedTrack
    }

    /**
     * Validate the minimum structure.
     */
    if (
      !parsed.id ||
      !parsed.music ||
      !parsed.music.track_name_en ||
      !parsed.music.melody ||
      parsed.music.melody.length < 8
    ) {
      throw new Error("Incomplete structure")
    }

      return parsed
    } catch (err) {
      lastError = err
      console.error(`Vectrust error on attempt ${attempt}:`, err)
    }
  }

  throw lastError instanceof Error ? lastError : new Error("Vectrust generation failed")
}
