import * as Tone from 'tone'

export class JazzPlayer {
  private piano: Tone.PolySynth | null = null
  private chordSynth: Tone.PolySynth | null = null
  private isInitialized = false

  /**
   * 初始化 Tone.js 音频上下文
   * 必须在用户交互后调用
   */
  async init() {
    if (this.isInitialized) return

    await Tone.start()

    // 钢琴音色（旋律）
    this.piano = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'triangle' },
      envelope: {
        attack: 0.005,
        decay: 0.1,
        sustain: 0.3,
        release: 1
      }
    }).toDestination()

    // 和弦音色（背景）
    this.chordSynth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'sine' },
      envelope: {
        attack: 0.1,
        decay: 0.3,
        sustain: 0.6,
        release: 1
      }
    }).toDestination()

    this.chordSynth.volume.value = -12 // 和弦音量降低

    this.isInitialized = true
    console.log('[Tone.js] 初始化成功')
  }

  /**
   * 播放音轨
   */
  async play(track: any) {
    await this.init()

    // 设置 BPM
    Tone.Transport.bpm.value = track.bpm

    // 清除之前的调度
    Tone.Transport.cancel()

    // 解析并调度旋律
    const melody = JSON.parse(track.melody)
    melody.forEach(({ note, duration, time }: any) => {
      Tone.Transport.schedule((t) => {
        this.piano?.triggerAttackRelease(note, duration, t)
      }, time)
    })

    // 解析并调度和弦
    const chords = JSON.parse(track.chord_progression)
    chords.forEach((chord: string, i: number) => {
      const notes = this.chordToNotes(chord)
      Tone.Transport.schedule((t) => {
        this.chordSynth?.triggerAttackRelease(notes, '2n', t)
      }, i * 2) // 每个和弦持续 2 拍
    })

    // 启动播放
    Tone.Transport.start()
    console.log('[Tone.js] 开始播放:', track.track_name_zh)
  }

  /**
   * 停止播放
   */
  stop() {
    Tone.Transport.stop()
    Tone.Transport.cancel()
    console.log('[Tone.js] 停止播放')
  }

  /**
   * 和弦记号转音符数组
   * 简化实现，支持常见爵士和弦
   */
  private chordToNotes(chord: string): string[] {
    const chordMap: Record<string, string[]> = {
      // C 系列
      'Cmaj7': ['C3', 'E3', 'G3', 'B3'],
      'C7': ['C3', 'E3', 'G3', 'Bb3'],
      'Cm7': ['C3', 'Eb3', 'G3', 'Bb3'],

      // D 系列
      'Dmaj7': ['D3', 'F#3', 'A3', 'C#4'],
      'D7': ['D3', 'F#3', 'A3', 'C4'],
      'Dm7': ['D3', 'F3', 'A3', 'C4'],

      // E 系列
      'Emaj7': ['E3', 'G#3', 'B3', 'D#4'],
      'E7': ['E3', 'G#3', 'B3', 'D4'],
      'Em7': ['E3', 'G3', 'B3', 'D4'],

      // F 系列
      'Fmaj7': ['F3', 'A3', 'C4', 'E4'],
      'F7': ['F3', 'A3', 'C4', 'Eb4'],
      'Fm7': ['F3', 'Ab3', 'C4', 'Eb4'],

      // G 系列
      'Gmaj7': ['G2', 'B2', 'D3', 'F#3'],
      'G7': ['G2', 'B2', 'D3', 'F3'],
      'Gm7': ['G2', 'Bb2', 'D3', 'F3'],

      // A 系列
      'Amaj7': ['A2', 'C#3', 'E3', 'G#3'],
      'A7': ['A2', 'C#3', 'E3', 'G3'],
      'Am7': ['A2', 'C3', 'E3', 'G3'],

      // B 系列
      'Bmaj7': ['B2', 'D#3', 'F#3', 'A#3'],
      'B7': ['B2', 'D#3', 'F#3', 'A3'],
      'Bm7': ['B2', 'D3', 'F#3', 'A3'],

      // 减和弦
      'F#dim7': ['F#3', 'A3', 'C4', 'Eb4'],
      'Bdim7': ['B2', 'D3', 'F3', 'Ab3'],
    }

    // 如果找不到，返回根音和弦
    if (!chordMap[chord]) {
      console.warn(`[Tone.js] 未知和弦: ${chord}，使用默认`)
      return ['C3', 'E3', 'G3', 'B3']
    }

    return chordMap[chord]
  }

  /**
   * 检查浏览器是否支持 Web Audio
   */
  static isSupported(): boolean {
    return !!(window.AudioContext || (window as any).webkitAudioContext)
  }
}

// 导出单例
export const jazzPlayer = new JazzPlayer()
