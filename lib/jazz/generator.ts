import Anthropic from "@anthropic-ai/sdk"
import { MixingParams } from './utils'

/**
 * ⚠️ 填你的 key
 */
const client = new Anthropic({
  apiKey: "sk-api-KtLO9hIGqO_Hq4CV-C1_t7E7hAyjbO9t8u96fE-8JDEdnqJCdUCp30F3U4L3P5IfmocCt4EK8T1C2LmXc53oMZOdSGEqSfIW7UW2LDlzrPIyAeKPO1sazeM", // ← 填
  baseURL: "https://api.minimax.io/anthropic"
})

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
 * 构造系统提示词
 */
function buildSystemPrompt(): string {
  return `你是一位精通爵士乐作曲的 AI 作曲家，同时具备深厚的鸡尾酒调配美学品味。
你的任务是：根据用户提供的调酒参数，生成一段完整的爵士乐曲结构，并以严格的 JSON 格式输出，不包含任何解释文字。

【输出格式要求】
必须输出一个合法的 JSON 对象，字段如下：

{
"id": "base_spirit_ingredient_mood_intensity_ice_shake",
"input_params": {
"base_spirit": "whiskey | gin | rum | tequila",
"ingredients": "lemon | mint | coffee | smoke | honey | soda",
"mood": "calm | sad | mysterious | romantic | energetic",
"mood_intensity": "1-5整数",
"ice_level": "none | light | heavy",
"shake_level": "soft | medium | hard"
},
"tags": {
"style": "blues | swing | latin | experimental",
"mode": "major | minor | diminished | major7 | mixolydian",
"energy_level": "low | medium | high（由bpm决定：<80 low，80-120 medium，>120 high）",
"rhythm_complexity": "low | medium | high（由shake_level决定）",
"brightness": "bright | dark | warm | fresh（由ingredient决定）",
"texture": ["staccato", "legato", "syncopation", "swing"]
},
"music": {
"track_name_en": "英文曲名（古典爵士风，如 Nocturne in ... / Reverie of ... / Serenade of ... / Ballad of ...，禁止现代词汇）",
"track_name_zh": "中文曲名（2-6字，诗意表达）",
"poem_en": [
"第一行（8-12音节，押韵）",
"第二行（8-12音节，押韵）",
"第三行（8-12音节，押韵）",
"第四行（8-12音节，押韵）"
],
"poem_zh": [
"第一行（5-7字）",
"第二行（5-7字）",
"第三行（5-7字）",
"第四行（5-7字）"
],
"bpm": "60-160之间的数字",
"key": "如 C Major 或 A Minor",
"mode": "major | minor | diminished | major7 | mixolydian",
"time_signature": "2/4 | 3/4 | 4/4",
"style": "blues | swing | latin | experimental",
"chord_progression": ["和弦1", "和弦2", "和弦3", "和弦4"],
"melody": [
{ "note": "C4", "duration": "4n", "time": 0 }
],
"instruments": ["2-4种乐器，如 piano, bass, drums, saxophone, guitar"]
},
"meta": {
"version": "v1",
"generated_at": "ISO时间格式（如 2026-03-18T00:00:00Z）",
"generator": "minimax",
"valid": true
}
}


【作曲规则】

1. 基酒 → 风格基调
   - whiskey → Blues / Slow Jazz，BPM 60-80，大量蓝调音阶
   - gin → Light Swing，BPM 100-130，轻盈跳跃
   - rum → Latin Jazz，BPM 100-140，切分节奏
   - tequila → Experimental / Fast，BPM 130-160，不规则节奏

2. 情绪 → 调式选择
   - calm → Major，平和进行
   - sad → Minor，下行旋律
   - mysterious → Diminished，不稳定和弦
   - romantic → Major 7th，温柔张力
   - energetic → Mixolydian，推进感

3. 情绪强度（1-5）→ 旋律起伏幅度
   - 1-2：旋律平稳，音程小（2-3度跳进）
   - 3：适中起伏（3-5度）
   - 4-5：大跳进，戏剧化（6-8度）

4. 配料 → 音乐细节
   - lemon（柠檬）→ staccato 断奏，明亮音符（高音区）
   - mint（薄荷）→ swing feel，加入装饰音
   - coffee（咖啡）→ 增加复杂和弦（如 #11, b9）
   - smoke（烟熏）→ 低音区强调，蓝调滑音
   - honey（蜂蜜）→ legato 连奏，柔和力度

5. 冰量 → 节奏处理
   - none（无冰）→ 连贯 legato，无明显停顿
   - light（少冰）→ 适度休止符
   - heavy（多冰）→ 切分节奏，syncopation，加入 break

6. Shake 强度 → 节奏复杂度
   - soft → 平稳 4/4，基础律动
   - medium → 加入 swing 八分音符
   - hard → 三连音、切分、不规则重音

【命名规则】

英文曲名：
- 必须有古典爵士/文学气质
- 模式参考：Nocturne in [形容词]，Reverie of [意象]，[形容词] Serenade，Ballad of [意象]
- 禁止使用现代感词汇（如 Mix, Blend, Cool, Vibe）

中文曲名：
- 2-6字，诗意
- 可参考：夜色、烟雨、弦断、微醺、月光等意象

四行诗规则：
- 英文：每行 8-12 音节，押韵（ABAB 或 AABB），爵士夜晚氛围
- 中文：每行 5-7 字，意象化，不可直译英文，独立成诗
- 两组诗必须均为4行

【melody 格式说明】
- note：标准 MIDI 音名，如 C4、D#4、Bb3
- duration：Tone.js 时值格式，如 "4n"（四分音符）、"8n"（八分音符）、"2n"（二分音符）、"16n"（十六分音符）
- time：相对于起始的时间偏移（单位：拍），数字类型

【严格约束】
- 只输出 JSON，不含任何 Markdown 代码块标记（不要json）
- JSON 必须合法，可直接 JSON.parse()
- melody 数组必须有 16-24 个元素
- chord_progression 必须有 4 个和弦
- instruments 必须包含 2-4 种乐器

- 示例输出 JSON

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
      "柠影浮残夜，",
      "孤杯映微凉，",
      "风动旧时梦，",
      "曲终人未央。"
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
    "generator": "minimax",
    "valid": true
  }
}`
}

/**
 * 构造用户提示词
 */
function buildUserPrompt(params: MixingParams): string {
  return `请为以下调酒组合创作一首爵士乐：

base_spirit: ${params.base_spirit}
ingredients: ${JSON.stringify(params.ingredients)}
mood: ${params.mood}
mood_intensity: ${params.mood_intensity}/5
ice_level: ${params.ice_level}
shake_level: ${params.shake_level}

根据以上参数，遵循参数映射规则，生成符合意境的爵士乐曲。`
}

/**
 * 🧠 提取 JSON（关键：防止模型多说话）
 */
function extractJSON(text: string): string {
  const match = text.match(/\{[\s\S]*\}/)
  if (!match) throw new Error("未找到JSON")
  return match[0]
}

/**
 * 主函数（Anthropic接口）
 */
export async function generateWithMiniMax(
  params: MixingParams
): Promise<GeneratedTrack> {
  try {
    const response = await client.messages.create({
      model: "MiniMax-M2.5", // 推荐
      max_tokens: 2000,
      temperature: 0.4,

      system: buildSystemPrompt(),

      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: buildUserPrompt(params)
            }
          ]
        }
      ]
    })

    /**
     * ⚠️ Anthropic格式解析
     */
    let text = ""

    for (const block of response.content) {
      if (block.type === "text") {
        text += block.text
      }
    }

    if (!text) throw new Error("空响应")

    console.log("🧠 MiniMax raw:", text)

    /**
     * 提取 JSON
     */
    const jsonStr = extractJSON(text)
    const parsed = JSON.parse(jsonStr) as GeneratedTrack

    /**
     * 校验
     */
    if (
      !parsed.id ||
      !parsed.music ||
      !parsed.music.track_name_en ||
      !parsed.music.melody ||
      parsed.music.melody.length < 16
    ) {
      throw new Error("结构不完整")
    }

    return parsed
  } catch (err) {
    console.error("MiniMax error:", err)
    throw err
  }
}

/**
 * 降级方案：返回预设模板
 */
export function getFallbackTrack(params: MixingParams): GeneratedTrack {
  const bpmMap: Record<string, number> = {
    whiskey: 72,
    gin: 120,
    rum: 120,
    tequila: 140
  }

  const styleMap: Record<string, string> = {
    whiskey: 'blues',
    gin: 'swing',
    rum: 'latin',
    tequila: 'experimental'
  }

  const moodKey: Record<string, { key: string; mode: string }> = {
    calm: { key: 'C Major', mode: 'major' },
    sad: { key: 'A Minor', mode: 'minor' },
    mysterious: { key: 'F# Diminished', mode: 'diminished' },
    romantic: { key: 'F Major', mode: 'major7' },
    energetic: { key: 'G Mixolydian', mode: 'mixolydian' }
  }

  const { key, mode } = moodKey[params.mood] || { key: 'C Major', mode: 'major' }

  return {
    id: `${params.base_spirit}_${params.ingredients.join("+")}_${params.mood}_${params.mood_intensity}_${params.ice_level}_${params.shake_level}`,

    input_params: params,

    tags: {
      style: "swing",
      mode: "major",
      energy_level: "medium",
      rhythm_complexity: "medium",
      brightness: "bright",
      texture: ["legato", "swing"]
    },

    music: {
      track_name_en: "Nocturne in Silver Citrus",
      track_name_zh: "柠夜微醺",

      poem_en: [
        "Soft echoes drift through twilight's gentle air",
        "A silver glow dissolves in whispered light",
        "The rhythm sways with scents both bright and rare",
        "As shadows dance beneath the velvet night"
      ],

      poem_zh: [
        "柠香浮夜色",
        "微光落杯中",
        "弦影随风转",
        "心随酒意浓"
      ],

      bpm: 110,
      key: "C Major",
      mode: "major",
      time_signature: "4/4",
      style: "swing",

      chord_progression: ["Cmaj7", "Am7", "Dm7", "G7"],

      melody: [
        { note: "E4", duration: "8n", time: 0 },
        { note: "G4", duration: "8n", time: 0.5 },
        { note: "A4", duration: "4n", time: 1 },
        { note: "G4", duration: "8n", time: 2 },
        { note: "E4", duration: "8n", time: 2.5 },
        { note: "D4", duration: "4n", time: 3 },
        { note: "C4", duration: "2n", time: 4 }
      ],

      instruments: ["piano", "bass", "drums"]
    },

    meta: {
      version: "v1",
      generated_at: new Date().toISOString(),
      generator: "fallback",
      valid: true
    }
  }
}
