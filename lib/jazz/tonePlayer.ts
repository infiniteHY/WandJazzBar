import * as Tone from 'tone'

export class JazzPlayer {
  private piano: Tone.PolySynth | null = null
  private chordSynth: Tone.PolySynth | null = null
  private isInitialized = false

  /**
   * Initialize the Tone.js audio context after a user gesture.
   */
  async init() {
    if (this.isInitialized) return

    await Tone.start()

    // Piano voice for melody.
    this.piano = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'triangle' },
      envelope: {
        attack: 0.005,
        decay: 0.1,
        sustain: 0.3,
        release: 1
      }
    }).toDestination()

    // Background chord voice.
    this.chordSynth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'sine' },
      envelope: {
        attack: 0.1,
        decay: 0.3,
        sustain: 0.6,
        release: 1
      }
    }).toDestination()

    this.chordSynth.volume.value = -12

    this.isInitialized = true
    console.log('[Tone.js] Initialized')
  }

  /**
   * Play a track.
   */
  async play(track: any) {
    await this.init()

    // Set BPM.
    Tone.Transport.bpm.value = track.bpm

    // Clear previous scheduling.
    Tone.Transport.cancel()

    // Parse and schedule the melody.
    const melody = JSON.parse(track.melody)
    melody.forEach(({ note, duration, time }: any) => {
      Tone.Transport.schedule((t) => {
        this.piano?.triggerAttackRelease(note, duration, t)
      }, time)
    })

    // Parse and schedule chords.
    const chords = JSON.parse(track.chord_progression)
    chords.forEach((chord: string, i: number) => {
      const notes = this.chordToNotes(chord)
      Tone.Transport.schedule((t) => {
        this.chordSynth?.triggerAttackRelease(notes, '2n', t)
      }, i * 2)
    })

    // Start playback.
    Tone.Transport.start()
    console.log('[Tone.js] Playing:', track.track_name_en)
  }

  /**
   * Stop playback.
   */
  stop() {
    Tone.Transport.stop()
    Tone.Transport.cancel()
    console.log('[Tone.js] Stopped')
  }

  /**
   * Convert chord symbols to note arrays.
   */
  private chordToNotes(chord: string): string[] {
    const chordMap: Record<string, string[]> = {
      // C family
      'Cmaj7': ['C3', 'E3', 'G3', 'B3'],
      'C7': ['C3', 'E3', 'G3', 'Bb3'],
      'Cm7': ['C3', 'Eb3', 'G3', 'Bb3'],

      // D family
      'Dmaj7': ['D3', 'F#3', 'A3', 'C#4'],
      'D7': ['D3', 'F#3', 'A3', 'C4'],
      'Dm7': ['D3', 'F3', 'A3', 'C4'],

      // E family
      'Emaj7': ['E3', 'G#3', 'B3', 'D#4'],
      'E7': ['E3', 'G#3', 'B3', 'D4'],
      'Em7': ['E3', 'G3', 'B3', 'D4'],

      // F family
      'Fmaj7': ['F3', 'A3', 'C4', 'E4'],
      'F7': ['F3', 'A3', 'C4', 'Eb4'],
      'Fm7': ['F3', 'Ab3', 'C4', 'Eb4'],

      // G family
      'Gmaj7': ['G2', 'B2', 'D3', 'F#3'],
      'G7': ['G2', 'B2', 'D3', 'F3'],
      'Gm7': ['G2', 'Bb2', 'D3', 'F3'],

      // A family
      'Amaj7': ['A2', 'C#3', 'E3', 'G#3'],
      'A7': ['A2', 'C#3', 'E3', 'G3'],
      'Am7': ['A2', 'C3', 'E3', 'G3'],

      // B family
      'Bmaj7': ['B2', 'D#3', 'F#3', 'A#3'],
      'B7': ['B2', 'D#3', 'F#3', 'A3'],
      'Bm7': ['B2', 'D3', 'F#3', 'A3'],

      // Diminished chords
      'F#dim7': ['F#3', 'A3', 'C4', 'Eb4'],
      'Bdim7': ['B2', 'D3', 'F3', 'Ab3'],
    }

    if (!chordMap[chord]) {
      console.warn(`[Tone.js] Unknown chord: ${chord}; using default`)
      return ['C3', 'E3', 'G3', 'B3']
    }

    return chordMap[chord]
  }

  /**
   * Check whether the browser supports Web Audio.
   */
  static isSupported(): boolean {
    return !!(window.AudioContext || (window as any).webkitAudioContext)
  }
}

export const jazzPlayer = new JazzPlayer()
