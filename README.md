# Wand Jazz Bar

Wand Jazz Bar is a Next.js app that turns cocktail-style choices into a generated jazz track. The experience now opens directly into the bar; there is no login gate.

## Features

- Direct entry to the jazz bar
- Cocktail parameter selection
- English and Chinese generated titles and poems
- Tone.js playback for generated melody and chords
- Pixel-neon visual style

## Tech Stack

- Framework: Next.js 14 with App Router
- Language: TypeScript
- Styling: Tailwind CSS
- Database: Prisma-backed relational database
- Audio: Tone.js

## Quick Start

```bash
npm install
npx prisma generate
npx prisma db push
npm run dev
```

The app runs at `http://localhost:3000` and redirects to `/jazz-bar`.

## Project Structure

```text
app/
  api/
    jazz/
  jazz-bar/
    components/
    context/
lib/
  jazz/
  prisma.ts
prisma/
  schema.prisma
```

## Notes

- `JazzTrack` stores cocktail parameters, generated metadata, bilingual poems, chord data, melody data, and instruments.
- Existing auth-related database fields may remain for compatibility with older data, but the current product flow does not require authentication.
