# AI Jazz Bar Requirements

AI Jazz Bar is a pixel-styled immersive web app where users express a mood through cocktail choices. The system maps those choices to a generated jazz track, then displays the track title, a short poem, music metadata, and a playable arrangement.

## Core Flow

1. Enter the bar.
2. Select a base spirit.
3. Choose ingredients.
4. Select a mood and intensity.
5. Choose an ice level.
6. Choose a shake level.
7. Press `SHAKE`.
8. Retrieve or generate a matching jazz track.
9. Display the title, poem, chord progression, and player.

## Parameter Mapping

| Parameter | Values | Musical Effect |
| --- | --- | --- |
| `base_spirit` | `whiskey`, `gin`, `rum`, `tequila` | Core jazz style and BPM range |
| `ingredients` | `lemon`, `mint`, `coffee`, `smoke`, `honey`, `soda` | Texture, register, articulation, and harmonic color |
| `mood` | `calm`, `sad`, `mysterious`, `romantic`, `energetic` | Mode and melodic direction |
| `mood_intensity` | `1` to `5` | Melodic range and dramatic contour |
| `ice_level` | `none`, `light`, `heavy` | Legato, rests, and syncopation |
| `shake_level` | `soft`, `medium`, `hard` | Rhythmic complexity |

## Data Shape

Generated tracks are stored as `JazzTrack` records with:

- Input parameters
- Style tags
- English title fields
- English poem fields
- BPM, key, mode, and time signature
- Four-chord progression
- Tone.js melody events
- Instrument list
- Generation metadata

The fields `track_name_en` and `poem_en` store English output. The fields `track_name_zh` and `poem_zh` store Chinese output.

## Visual Direction

- Dark pixel jazz bar atmosphere
- Neon orange, purple, and blue accents
- CRT scanline overlay
- Compact cards with stable responsive sizing
- German and Chinese poem copy on the home screen
- English and Chinese result poetry

## Performance Goals

- First screen load under 3 seconds
- Track lookup or generation response under 1 second when cached
- Shake animation at 30 fps or higher
- Smooth Tone.js playback after user interaction
