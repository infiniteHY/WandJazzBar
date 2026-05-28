# Wand Jazz Bar Project

## Overview

This project is a Next.js application for the Wand Jazz Bar music-generation experience. Users enter directly, choose cocktail-style parameters, and receive a generated jazz track with bilingual title and poem output.

## Modules

### 1. jazz-bar

- Start screen with the German and Chinese `Wünschelrute / 魔杖` poem
- Cocktail parameter selection
- Shake animation and result transition
- Bilingual result display
- Tone.js music playback

### 2. jazz API

- Builds stable track keys from selected parameters
- Reads cached tracks from Prisma when available
- Regenerates stale cached tracks that do not include Chinese result fields
- Falls back to a local template when model generation fails

## Data Model Notes

- `JazzTrack` stores input parameters, generated metadata, English and Chinese poem fields, chord data, melody data, and instruments.
- Historical user/auth fields can remain in the schema for compatibility, but the current app flow has no login gate.
