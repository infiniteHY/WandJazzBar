// Music-theory engine.
//
// The LLM is good at taste (key, mood, chord direction, titles, poems) but
// unreliable at writing individual notes that actually fit the harmony. So we
// let the model choose the high-level plan and synthesise the real melody and
// chord voicings here, guaranteeing every note is a chord tone or a scale tone.

export type MelodyEvent = { note: string; duration: string; time: number }

const SEMITONE: Record<string, number> = {
  C: 0, 'C#': 1, Db: 1, D: 2, 'D#': 3, Eb: 3, E: 4, F: 5,
  'F#': 6, Gb: 6, G: 7, 'G#': 8, Ab: 8, A: 9, 'A#': 10, Bb: 10, B: 11,
}
const SHARP_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

export function noteToMidi(name: string): number {
  const m = name.match(/^([A-Ga-g][#b]?)(-?\d+)$/)
  if (!m) return 60
  const pc = SEMITONE[m[1][0].toUpperCase() + (m[1][1] || '')]
  return (parseInt(m[2], 10) + 1) * 12 + (pc ?? 0)
}

export function midiToNote(midi: number): string {
  const pc = ((midi % 12) + 12) % 12
  const octave = Math.floor(midi / 12) - 1
  return SHARP_NAMES[pc] + octave
}

// ── Chord parsing: symbol → interval set (semitones above the root) ──
function chordIntervals(quality: string): number[] {
  const q = quality.trim()
  const has = (s: string) => q.includes(s)
  const isMaj7 = /maj7|Maj7|M7|Δ/.test(q)
  const isMinMaj = /m\(?maj7\)?|mM7/.test(q)

  if (isMinMaj) return [0, 3, 7, 11]
  if (/m7b5|ø|min7b5/.test(q)) return [0, 3, 6, 10]
  if (/dim7|°7|o7/.test(q)) return [0, 3, 6, 9]
  if (/dim|°/.test(q)) return [0, 3, 6]
  if (/maj9|M9/.test(q)) return [0, 4, 11, 14]
  if (/(^|[^a])m9/.test(q)) return [0, 3, 10, 14]
  if (has('9')) return [0, 4, 10, 14]
  if (isMaj7) return [0, 4, 7, 11]
  if (/m6|min6/.test(q)) return [0, 3, 7, 9]
  if (/(^|[^a])6/.test(q)) return [0, 4, 7, 9]
  if (/m7|min7/.test(q)) return [0, 3, 7, 10]
  if (/(^|[^a])7/.test(q)) return [0, 4, 7, 10] // dominant 7
  if (/sus2/.test(q)) return [0, 2, 7]
  if (/sus4|sus/.test(q)) return [0, 5, 7]
  if (/aug|\+/.test(q)) return [0, 4, 8]
  if (/m|min/.test(q) && !/maj/.test(q)) return [0, 3, 7]
  return [0, 4, 7] // major triad
}

export function parseChord(symbol: string): { rootPc: number; intervals: number[] } {
  const clean = symbol.split('/')[0].trim() // drop slash-bass
  const m = clean.match(/^([A-Ga-g][#b]?)(.*)$/)
  if (!m) return { rootPc: 0, intervals: [0, 4, 7] }
  const root = m[1][0].toUpperCase() + (m[1][1] || '')
  const rootPc = SEMITONE[root] ?? 0
  return { rootPc, intervals: chordIntervals(m[2]) }
}

// Pitch classes contained in a chord (for melody chord-tone checks).
export function chordPitchClasses(symbol: string): number[] {
  const { rootPc, intervals } = parseChord(symbol)
  return intervals.map(i => (rootPc + i) % 12)
}

// A 4-note voicing for the harmony pad, centred near the given octave.
export function chordVoicing(symbol: string, octave = 3): string[] {
  const { rootPc, intervals } = parseChord(symbol)
  // Keep at most four voices: for 5-note extensions drop the fifth.
  let chosen = intervals
  if (intervals.length > 4) chosen = [intervals[0], intervals[1], intervals[3], intervals[4]]
  const rootMidi = (octave + 1) * 12 + rootPc
  return chosen.map(i => midiToNote(rootMidi + i))
}

// ── Scales ──
const MAJOR = [0, 2, 4, 5, 7, 9, 11]
const NAT_MINOR = [0, 2, 3, 5, 7, 8, 10]

function scaleForKey(key: string): { tonicPc: number; pcs: number[] } {
  const m = (key || 'C Major').match(/^([A-Ga-g][#b]?)\s*(.*)$/)
  const rootName = m ? m[1][0].toUpperCase() + (m[1][1] || '') : 'C'
  const tonicPc = SEMITONE[rootName] ?? 0
  const isMinor = /min/i.test(key || '')
  const intervals = isMinor ? NAT_MINOR : MAJOR
  return { tonicPc, pcs: intervals.map(i => (tonicPc + i) % 12) }
}

// ── Deterministic RNG so the same cocktail always yields the same tune ──
function seededRng(seed: string): () => number {
  let h = 1779033703 ^ seed.length
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 3432918353)
    h = (h << 13) | (h >>> 19)
  }
  return () => {
    h = Math.imul(h ^ (h >>> 16), 2246822507)
    h = Math.imul(h ^ (h >>> 13), 3266489909)
    h = (h ^ (h >>> 16)) >>> 0
    return h / 4294967296
  }
}

export type ComposeOptions = {
  key: string
  chords: string[]
  moodIntensity: number
  ingredients: string[]
  seed: string
}

// Build the melody: strong beats land on chord tones, weak beats use scale
// passing tones near the previous note — so it is always consonant and singable.
export function composeMelody(opts: ComposeOptions): MelodyEvent[] {
  const rng = seededRng(opts.seed)
  const { pcs: scalePcs } = scaleForKey(opts.key)

  // Register: smoke lowers, lemon/soda brighten, honey stays warm/mid.
  let center = 67 // G4
  const ing = opts.ingredients
  if (ing.includes('smoke')) center -= 7
  if (ing.includes('lemon') || ing.includes('soda')) center += 4
  if (ing.includes('honey')) center -= 2

  // Candidate scale pitches within a comfortable window around the centre.
  const low = center - 7
  const high = center + 9
  const candidates: number[] = []
  for (let midi = low; midi <= high; midi++) {
    if (scalePcs.includes(((midi % 12) + 12) % 12)) candidates.push(midi)
  }

  // Melodic-leap budget grows with mood intensity.
  const intensity = opts.moodIntensity || 3
  const maxStep = intensity <= 2 ? 2 : intensity === 3 ? 3 : 5

  const nearestIndex = (midi: number) => {
    let best = 0, bestD = Infinity
    candidates.forEach((c, i) => {
      const d = Math.abs(c - midi)
      if (d < bestD) { bestD = d; best = i }
    })
    return best
  }

  let idx = nearestIndex(center)
  const events: MelodyEvent[] = []
  const offsets = [0, 0.5, 1.0, 1.5] // seconds within each 2s chord window
  const chords = opts.chords.slice(0, 4)

  chords.forEach((chord, ci) => {
    const chordPcs = chordPitchClasses(chord)
    offsets.forEach((off, k) => {
      const strong = k === 0 || k === 2
      let target: number

      if (strong) {
        // Pick a chord tone within reach of the current pitch.
        const reachable = candidates
          .map((c, i) => ({ c, i }))
          .filter(({ c, i }) =>
            chordPcs.includes(((c % 12) + 12) % 12) &&
            Math.abs(i - idx) <= maxStep + 2)
        if (reachable.length === 0) {
          target = idx
        } else {
          // Bias toward small motion but allow leaps at higher intensity.
          const sorted = reachable.sort((a, b) => Math.abs(a.i - idx) - Math.abs(b.i - idx))
          const pickRange = Math.max(1, Math.round(rng() * Math.min(sorted.length, intensity)))
          target = sorted[Math.floor(rng() * pickRange)].i
        }
      } else {
        // Weak beat: stepwise passing tone (±1 or ±2 scale degrees).
        const step = (rng() < 0.5 ? -1 : 1) * (rng() < 0.7 ? 1 : 2)
        target = Math.min(candidates.length - 1, Math.max(0, idx + step))
      }

      idx = target
      events.push({
        note: midiToNote(candidates[idx]),
        duration: strong ? '4n' : '8n',
        time: ci * 2 + off,
      })
    })
  })

  return events
}

// Choose instruments that the audio engine actually renders, so the on-screen
// instrument cards always match what is heard.
export function chooseInstruments(style: string, moodIntensity: number): string[] {
  const insts = ['piano', 'chord', 'bass']
  const lively = moodIntensity >= 3 || ['swing', 'latin', 'experimental'].includes(style)
  if (lively) insts.push('saxophone')
  return insts
}
