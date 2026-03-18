# AI Jazz Bar — 需求说明书
> 像素爵士酒吧 · 沉浸式情绪音乐生成系统

---

# Part 1：系统整体实现方案

---

## 1. 产品概述

### 1.1 产品定位
AI Jazz Bar 是一个像素风沉浸式网页应用，用户通过"调酒"的隐喻方式表达情绪，系统将其映射为一段爵士乐，并展示酒名、四行诗与可播放音乐。

### 1.2 核心用户流程
```
进入酒吧 → 点击吧台 → 选择基酒 → 添加配料 → 选择情绪 → 选择冰量
        → 按下 SHAKE → 查询数据库匹配 → 展示：酒名 + 四行诗 + 乐谱可视化
        → 点击播放 / 暂停
```

### 1.3 实现策略（两阶段）
| 阶段 | 内容 |
|------|------|
| 阶段一 | 离线预生成：用 AI 将所有参数组合批量生成结构化乐曲 JSON，存入数据库 |
| 阶段二 | 前端交互：用户调酒 → 前端构建查询键 → 查库取曲 → Tone.js 播放 |

---

## 2. 功能模块说明

### 2.1 主界面（像素酒吧场景）
- 背景：暗色系像素爵士酒吧场景（`#1a1a1a` / `#2b2b2b`）
- 霓虹灯元素（橙/紫/蓝）、CRT 扫描线效果
- 可点击区域：
  - **吧台** → 进入调酒流程
  - **舞台** → 展示当前播放乐曲

---

### 2.2 Step 1：选择基酒（Base Spirit）

| 选项 | 映射音乐风格 |
|------|------------|
| 🥃 Whiskey（威士忌） | Blues / Slow Jazz |
| 🍸 Gin（金酒） | Light Swing |
| 🍹 Rum（朗姆） | Latin Jazz |
| 🌵 Tequila（龙舌兰） | Experimental / Fast |

- UI：四瓶酒图标卡片，点击选中，高亮像素边框

---

### 2.3 Step 2：选择配料（Ingredients）

- 最多选 3～5 种，点击切换选中状态

| 配料 | 音乐映射 |
|------|---------|
| 🍋 柠檬 | 清爽 / staccato 断奏 |
| 🌿 薄荷 | 轻快 / swing 韵律 |
| ☕ 咖啡 | 复杂和弦 / tension |
| 🔥 烟熏 | 低音 / blues 色彩 |
| 🍯 蜂蜜 | 柔和 / major 感 |

---

### 2.4 Step 3：选择情绪（Mood）

- 单选 + 强度滑杆（1～5）

| 情绪 | 调式映射 |
|------|---------|
| 😌 Calm | Major |
| 😢 Sad | Minor |
| 😈 Mysterious | Diminished |
| ❤️ Romantic | Major 7th |
| 🔥 Energetic | Mixolydian |

---

### 2.5 Step 4：选择冰量（Ice Level）

| 冰量 | 节奏映射 |
|------|---------|
| 无冰 | 连贯 Legato |
| 少冰 | 适度停顿 |
| 多冰 | 节奏切分 / Break |

- UI：冰块数量图标，点击选择

---

### 2.6 Step 5：SHAKE 交互（核心亮点）

- 点击/按住 SHAKE 按钮，触发摇酒动画
- 酒杯晃动 + 冰块碰撞音效
- Shake 强度通过按住时间判定（可选）

| Shake 强度 | 音乐变化 |
|------------|---------|
| 弱（<1s） | 平稳节奏 |
| 中（1～2s） | Swing 增强 |
| 强（>2s） | Syncopation / 节奏复杂化 |

---

### 2.7 结果展示页

Shake 完成后展示：

1. **酒名（= 乐曲名）**
   - 英文：古典爵士风，如 *Nocturne in Citrus*, *Reverie of Smoke*
   - 中文：2～6字，诗意表达

2. **四行诗**
   - 中英各一组，文艺爵士风格，不可直译

3. **乐谱可视化**
   - Piano Roll 风格（推荐）或简化五线谱
   - 展示和弦进行 + 旋律走向

4. **播放器**
   - 播放 / 暂停按钮
   - 使用 Tone.js 播放 melody + chords

---

## 3. 数据库设计

### 3.1 乐曲记录表 `jazz_tracks`

```sql
CREATE TABLE jazz_tracks (
  id           TEXT PRIMARY KEY,    -- 查询键（见下）
  base_spirit  TEXT,                -- whiskey | gin | rum | tequila
  ingredients  TEXT,                -- JSON 数组，如 ["lemon","mint"]
  mood         TEXT,                -- calm | sad | mysterious | romantic | energetic
  mood_intensity INT,               -- 1-5
  ice_level    TEXT,                -- none | light | heavy
  shake_level  TEXT,                -- soft | medium | hard

  track_name_en TEXT,               -- 英文酒名/曲名
  track_name_zh TEXT,               -- 中文曲名
  poem_en      TEXT,                -- 英文四行诗
  poem_zh      TEXT,                -- 中文四行诗

  bpm          INT,
  key          TEXT,                -- 调式，如 "C Major", "A Minor"
  mode         TEXT,                -- major | minor | diminished | major7 | mixolydian
  time_signature TEXT,              -- "4/4"
  style        TEXT,                -- blues | swing | latin | experimental

  chord_progression TEXT,           -- JSON 数组，如 ["Cmaj7","Am7","Dm7","G7"]
  melody        TEXT,               -- JSON 数组（MIDI note events）
  instruments   TEXT,               -- JSON 数组，如 ["piano","bass","drums"]

  created_at   TIMESTAMP DEFAULT NOW()
);
```

### 3.2 查询键构造规则

```
id = {base_spirit}_{sorted_ingredients}_{mood}_{mood_intensity}_{ice_level}_{shake_level}
```

示例：
```
whiskey_lemon+smoke_sad_3_heavy_medium
```

> `ingredients` 字母序排序后拼接，确保同组合唯一对应一条记录。

---

## 4. 前端技术栈

| 模块 | 技术选型 |
|------|---------|
| 框架 | React / 纯 HTML+JS 均可 |
| 音频播放 | Tone.js |
| 乐谱可视化 | Piano Roll（Canvas 自绘）或 VexFlow |
| 像素动画 | CSS animation + pixel art sprite |
| 数据库查询 | Supabase（推荐）或 Firebase / JSON 本地文件 |

---

## 5. 性能要求

| 指标 | 目标 |
|------|------|
| 音乐响应（查库+加载） | < 1 秒 |
| SHAKE 动画帧率 | ≥ 30 fps |
| 首屏加载 | < 3 秒 |
| 数据库查询 | < 500 ms |

---

## 6. 视觉风格规范

```
背景色：  #1a1a1a / #2b2b2b
霓虹橙：  #ff8c42
霓虹紫：  #c084fc
霓虹蓝：  #38bdf8
文字白：  #f5f5f5
像素字体：Press Start 2P / Silkscreen
CRT 效果：CSS scanline overlay（透明条纹遮罩）
```

---

---

# Part 2：AI 生成结构化乐曲的提示词方案

---

## 概述

本部分设计一套用于批量预生成乐曲 JSON 的 AI 提示词。目标是让 GPT / Claude 根据输入的调酒参数，输出一段可直接存入数据库、由 Tone.js 播放的结构化 JSON。

---

## 提示词模板（System Prompt）

```
你是一位精通爵士乐作曲的 AI 作曲家，同时具备深厚的鸡尾酒调配美学品味。
你的任务是：根据用户提供的调酒参数，生成一段完整的爵士乐曲结构，并以严格的 JSON 格式输出，不包含任何解释文字。

【输出格式要求】
必须输出一个合法的 JSON 对象，字段如下：

{
  "track_name_en": "英文曲名（古典爵士风，如 Nocturne in Citrus）",
  "track_name_zh": "中文曲名（2-6字，诗意）",
  "poem_en": ["第一行", "第二行", "第三行", "第四行"],
  "poem_zh": ["第一行", "第二行", "第三行", "第四行"],
  "bpm": 数字（60-160之间），
  "key": "如 C Major 或 A Minor",
  "mode": "major | minor | diminished | major7 | mixolydian 之一",
  "time_signature": "4/4",
  "style": "blues | swing | latin | experimental 之一",
  "chord_progression": ["和弦1", "和弦2", "和弦3", "和弦4"],
  "melody": [
    { "note": "C4", "duration": "4n", "time": 0 },
    { "note": "E4", "duration": "8n", "time": 0.5 },
    ...共16-24个音符
  ],
  "instruments": ["piano", "bass", "drums", "saxophone"]
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
- 只输出 JSON，不含任何 Markdown 代码块标记（不要```json）
- JSON 必须合法，可直接 JSON.parse()
- melody 数组必须有 16-24 个元素
- chord_progression 必须有 4 个和弦
- instruments 必须包含 2-4 种乐器
```

---

## 用户侧输入格式（User Prompt）

```
请根据以下调酒参数生成爵士乐曲 JSON：

base_spirit: whiskey
ingredients: ["lemon", "smoke"]
mood: sad
mood_intensity: 3
ice_level: heavy
shake_level: medium
```

---

## 批量生成脚本逻辑

```javascript
// 生成所有参数组合的查询键清单，批量调用 AI API

const baseSpirits = ["whiskey", "gin", "rum", "tequila"];
const ingredientCombos = getAllCombinations(
  ["lemon", "mint", "coffee", "smoke", "honey"], 1, 3
);
const moods = ["calm", "sad", "mysterious", "romantic", "energetic"];
const moodIntensities = [1, 2, 3, 4, 5];
const iceLevels = ["none", "light", "heavy"];
const shakeLevels = ["soft", "medium", "hard"];

// 对每个组合生成 ID 并批量请求
for (const combo of allCombinations) {
  const id = buildId(combo); // 构造唯一键
  const json = await callGPT(systemPrompt, buildUserPrompt(combo));
  await db.insert("jazz_tracks", { id, ...combo, ...json });
}

function buildId({ base_spirit, ingredients, mood, mood_intensity, ice_level, shake_level }) {
  const sortedIngredients = [...ingredients].sort().join("+");
  return `${base_spirit}_${sortedIngredients}_${mood}_${mood_intensity}_${ice_level}_${shake_level}`;
}
```

---

## 示例输出 JSON

```json
{
  "track_name_en": "Nocturne in Citrus Smoke",
  "track_name_zh": "柑烟夜曲",
  "poem_en": [
    "The night hums low in citrus air,",
    "A smoky whisper lingers there,",
    "Between the glass and fading light,",
    "Your silence turns to song tonight."
  ],
  "poem_zh": [
    "柑香浮夜色，",
    "烟影落杯中，",
    "未语心先动，",
    "今宵化作歌。"
  ],
  "bpm": 72,
  "key": "A Minor",
  "mode": "minor",
  "time_signature": "4/4",
  "style": "blues",
  "chord_progression": ["Am7", "Dm7", "G7", "Cmaj7"],
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
```

---

## Tone.js 播放实现参考

```javascript
import * as Tone from "tone";

async function playTrack(track) {
  await Tone.start();
  Tone.Transport.bpm.value = track.bpm;

  // 旋律 - 钢琴
  const piano = new Tone.PolySynth(Tone.Synth).toDestination();
  track.melody.forEach(({ note, duration, time }) => {
    Tone.Transport.schedule((t) => {
      piano.triggerAttackRelease(note, duration, t);
    }, time);
  });

  // 和弦 - 每小节循环
  const chordSynth = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: "triangle" },
    envelope: { attack: 0.1, decay: 0.3, sustain: 0.6, release: 1 }
  }).toDestination();
  chordSynth.volume.value = -10;

  track.chord_progression.forEach((chord, i) => {
    const notes = chordToNotes(chord); // 自定义和弦音名解析
    Tone.Transport.schedule((t) => {
      chordSynth.triggerAttackRelease(notes, "2n", t);
    }, i * 2);
  });

  Tone.Transport.start();
}
```

---

## 附：参数映射速查表

| 参数 | 值 | 音乐影响 |
|------|----|---------|
| base_spirit | whiskey | Blues, BPM 60-80, 蓝调音阶 |
| base_spirit | gin | Light Swing, BPM 100-130 |
| base_spirit | rum | Latin Jazz, BPM 100-140 |
| base_spirit | tequila | Experimental, BPM 130-160 |
| mood | calm | Major，平和 |
| mood | sad | Minor，下行 |
| mood | mysterious | Diminished，不稳定 |
| mood | romantic | Major 7th，温柔 |
| mood | energetic | Mixolydian，推进 |
| ice | none | Legato 连奏 |
| ice | light | 适度停顿 |
| ice | heavy | Syncopation 切分 |
| shake | soft | 平稳律动 |
| shake | medium | Swing feel |
| shake | hard | 三连音/不规则重音 |
| lemon | - | 高音区 staccato |
| smoke | - | 低音区 blues 滑音 |
| honey | - | Legato 柔和 |
| coffee | - | 复杂延伸和弦 |
| mint | - | 装饰音 swing |

---

*文档版本：v1.0 · AI Jazz Bar 需求说明书*
 