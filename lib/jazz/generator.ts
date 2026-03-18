import OpenAI from 'openai'
import { MixingParams } from './utils'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export interface GeneratedTrack {
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
  melody: Array<{ note: string; duration: string; time: number }>
  instruments: string[]
}

/**
 * 构造系统提示词
 */
function buildSystemPrompt(): string {
  return `你是一位精通爵士乐的作曲家和调酒师，专门为调酒创作对应的爵士音乐。

你的任务：根据用户提供的调酒参数（基酒、辅料、情绪等），生成一首完整的爵士乐曲，包括：
1. 曲名（中英文）
2. 四行诗（中英文，描述调酒与音乐的意境）
3. 音乐参数（BPM、调式、风格）
4. 和弦进行（4-8个爵士和弦）
5. 旋律（16-24个音符）

## 参数到音乐的映射规则

### 基酒 → 风格和BPM
- whiskey: Blues, BPM 60-80, 蓝调音阶
- gin: Light Swing, BPM 100-130
- rum: Latin Jazz, BPM 100-140
- tequila: Experimental, BPM 130-160

### 情绪 → 调式
- calm: Major, 平和和弦
- sad: Minor, 下行旋律
- mysterious: Diminished, 不稳定和弦
- romantic: Major 7th, 温柔延伸和弦
- energetic: Mixolydian, 推进感

### 情绪强度 → 力度和复杂度
- 1-2: 简单和弦，平稳旋律
- 3: 标准爵士进行
- 4-5: 复杂和弦，大跳旋律

### 冰块 → 律动
- none: Legato 连奏
- light: 适度停顿
- heavy: Syncopation 切分

### 摇晃 → 节奏感
- soft: 平稳律动
- medium: Swing feel
- hard: 三连音/不规则重音

### 辅料 → 音色特点
- lemon: 高音区 staccato
- smoke: 低音区 blues 滑音
- honey: Legato 柔和
- coffee: 复杂延伸和弦
- mint: 装饰音 swing

## 输出格式

必须返回有效的 JSON 对象，格式如下：

\`\`\`json
{
  "track_name_en": "Whiskey Blues in A Minor",
  "track_name_zh": "A小调威士忌蓝调",
  "poem_en": [
    "Line 1 in English",
    "Line 2 in English",
    "Line 3 in English",
    "Line 4 in English"
  ],
  "poem_zh": [
    "中文第一行",
    "中文第二行",
    "中文第三行",
    "中文第四行"
  ],
  "bpm": 72,
  "key": "A Minor",
  "mode": "minor",
  "time_signature": "4/4",
  "style": "blues",
  "chord_progression": ["Am7", "Dm7", "G7", "Cmaj7", "Am7", "F7", "E7", "Am7"],
  "melody": [
    { "note": "A4", "duration": "4n", "time": 0 },
    { "note": "G4", "duration": "8n", "time": 1 },
    { "note": "E4", "duration": "8n", "time": 1.5 },
    { "note": "F4", "duration": "4n", "time": 2 },
    { "note": "D4", "duration": "4n", "time": 3 },
    { "note": "E4", "duration": "4n", "time": 4 },
    { "note": "C4", "duration": "8n", "time": 5 },
    { "note": "D4", "duration": "8n", "time": 5.5 },
    { "note": "E4", "duration": "2n", "time": 6 },
    { "note": "A3", "duration": "4n", "time": 8 },
    { "note": "B3", "duration": "8n", "time": 9 },
    { "note": "C4", "duration": "8n", "time": 9.5 },
    { "note": "D4", "duration": "4n", "time": 10 },
    { "note": "E4", "duration": "4n", "time": 11 },
    { "note": "G4", "duration": "4n", "time": 12 },
    { "note": "A4", "duration": "2n", "time": 13 }
  ],
  "instruments": ["piano", "bass", "drums", "saxophone"]
}
\`\`\`

## 重要约束

1. 和弦必须是标准爵士和弦记号（如 Cmaj7, Am7, Dm7, G7, F#dim7 等）
2. 旋律音符范围：C2-C6
3. 音符时长：1n（全音符）, 2n（二分音符）, 4n（四分音符）, 8n（八分音符）
4. 时间轴（time）必须递增，单位为拍
5. 旋律应符合所选调式的音阶
6. 四行诗应有意境，避免直白描述`
}

/**
 * 构造用户提示词
 */
function buildUserPrompt(params: MixingParams): string {
  return `请为以下调酒组合创作一首爵士乐：

**基酒**: ${params.base_spirit}
**辅料**: ${params.ingredients.join(', ')}
**情绪**: ${params.mood}（强度 ${params.mood_intensity}/5）
**冰块**: ${params.ice_level}
**摇晃方式**: ${params.shake_level}

根据以上参数，遵循参数映射规则，生成符合意境的爵士乐曲。`
}

/**
 * 调用 GPT-4 生成音乐
 */
export async function generateWithGPT(params: MixingParams): Promise<GeneratedTrack> {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        { role: 'system', content: buildSystemPrompt() },
        { role: 'user', content: buildUserPrompt(params) }
      ],
      response_format: { type: 'json_object' },
    }, { timeout: 20000 })

    const content = response.choices[0].message.content
    if (!content) {
      throw new Error('GPT 返回空内容')
    }

    const generated = JSON.parse(content) as GeneratedTrack

    // 验证必填字段
    if (!generated.track_name_en || !generated.track_name_zh ||
        !generated.poem_en || !generated.poem_zh ||
        !generated.chord_progression || !generated.melody) {
      throw new Error('GPT 返回数据不完整')
    }

    return generated
  } catch (error) {
    console.error('GPT generation failed:', error)
    throw error
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
    track_name_en: `${params.base_spirit.charAt(0).toUpperCase() + params.base_spirit.slice(1)} ${params.mood.charAt(0).toUpperCase() + params.mood.slice(1)}`,
    track_name_zh: `${params.mood === 'sad' ? '忧伤' : params.mood === 'calm' ? '平静' : params.mood === 'mysterious' ? '神秘' : params.mood === 'romantic' ? '浪漫' : '活力'}之${params.base_spirit === 'whiskey' ? '威士忌' : params.base_spirit === 'gin' ? '金酒' : params.base_spirit === 'rum' ? '朗姆' : '龙舌兰'}`,
    poem_en: [
      'A glass of spirit, dark and deep',
      'Where memories and melodies meet',
      'The jazz notes dance, the ice cubes clink',
      'In every sip, a moment to think'
    ],
    poem_zh: [
      '杯中烈酒深且暗',
      '记忆旋律相交汇',
      '爵士音符舞翩翩',
      '每一口都值得品'
    ],
    bpm: bpmMap[params.base_spirit] || 100,
    key,
    mode,
    time_signature: '4/4',
    style: styleMap[params.base_spirit] || 'jazz',
    chord_progression: ['Cmaj7', 'Am7', 'Dm7', 'G7'],
    melody: [
      { note: 'C4', duration: '4n', time: 0 },
      { note: 'E4', duration: '4n', time: 1 },
      { note: 'G4', duration: '4n', time: 2 },
      { note: 'C5', duration: '4n', time: 3 },
      { note: 'B4', duration: '8n', time: 4 },
      { note: 'A4', duration: '8n', time: 4.5 },
      { note: 'G4', duration: '4n', time: 5 },
      { note: 'E4', duration: '4n', time: 6 },
      { note: 'D4', duration: '4n', time: 7 },
      { note: 'C4', duration: '2n', time: 8 }
    ],
    instruments: ['piano', 'bass', 'drums']
  }
}
