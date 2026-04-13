# Mobile Adaptation Progress

## Overview

Full mobile adaptation for WAND JAZZ BAR. All content (text, functionality, logic) is unchanged. Only layout and styling have been modified.

---

## PC/Mobile Isolation Strategy

Styles are divided into three clearly scoped zones:

| Zone | Selector | Purpose |
|---|---|---|
| Base styles | (no media query) | Shared defaults, mobile-first base |
| PC-only | `@media (min-width: 768px)` | Desktop-specific overrides |
| Mobile-only | `@media (max-width: 767px)` | Mobile-specific overrides |
| Tiny screens | `@media (max-width: 375px)` | Extra adjustments for ≤375px phones |

Changes in the PC zone have **zero effect** on mobile (≤767px), and vice versa.

---

## Changes Made

### 1. `app/layout.tsx` — Viewport Meta
**What**: Added `export const viewport: Viewport` with `width: device-width`, `initialScale: 1`, `viewportFit: cover`.
**Why**: Without a viewport meta tag, mobile browsers render the page at desktop width (~980px) and scale it down, making text tiny and interaction targets unusable.
**Scope**: Global (affects all pages).

---

### 2. `app/jazz-bar/styles.css` — PC Bug Fix

**Bug**: When the browser window is resized smaller (e.g., zoom in, short window height), the mixing page cards overlapped or disappeared.
**Root cause**: `.jazz-mixing-container` had `height: 100dvh; overflow: hidden` on desktop. Combined with `grid-template-rows: auto 3fr auto 1fr 1fr auto`, shrinking the viewport forced grid rows below their content minimum — the overflow was clipped, making sections appear to vanish or overlap.
**Fix**:
- Changed `overflow: hidden` → `overflow-y: auto` on `.jazz-mixing-container` at ≥768px.
- Changed `grid-template-rows` to use `minmax()`: `auto minmax(120px, 3fr) auto minmax(60px, 1fr) minmax(60px, 1fr) auto` so rows never collapse below a safe minimum.

---

### 3. `app/jazz-bar/styles.css` — Mobile-Only Section (max-width: 767px)

Added a clearly labeled `/* MOBILE-ONLY STYLES */` block. Specific rules:

| Rule | What it does |
|---|---|
| `.jazz-mixing-container` | Adds `padding-bottom: max(16px, env(safe-area-inset-bottom))` for iPhone home bar |
| `.jazz-section` | Reduces padding to `10px 12px` (from `16px`) for more card content space |
| `.option-card` | Sets `min-height: 60px` for adequate touch targets |
| `.shake-button` | `font-size: 10px`, `padding: 16px 32px`, `min-width: 160px` |
| `.enter-button` | `font-size: 10px`, `padding: 16px 32px`, `min-width: 140px` |
| `.back-button` | `font-size: 8px`, `padding: 14px 28px`, `min-width: 140px` |
| `.player-control` | `44px × 44px` (iOS HIG minimum touch target) |
| `.login-card` | Overridden in `globals.css` (see below) |
| `.section-title` | `font-size: 9px` |
| `.mixing-grid` | `gap: 6px` (slightly tighter) |
| `.subtitle-glow` | `letter-spacing: 0.08em` (less crowded on small screens) |

---

### 4. `app/jazz-bar/styles.css` — Tiny Screen Adjustments (max-width: 375px)

| Rule | What it does |
|---|---|
| `.neon-sign-text` | `clamp(13px, 5vw, 20px)` — fluid title scaling on 320px phones |
| `.option-card` | `min-height: 56px` |
| `.section-title` | `font-size: 8px` |

---

### 5. `app/globals.css` — Login Card Mobile Padding

**What**: Added `@media (max-width: 767px) { .login-card { padding: 28px 20px !important; } }`.
**Why**: The login page card has inline-style `padding: '36px 32px'` which is too wide on small phones (leaves ~16px per side). Reduced to `20px` horizontal on mobile.
**Why in globals.css**: The login page (`app/page.tsx`) does not import `jazz-bar/styles.css`, so the rule was placed in the globally-imported `globals.css`.

---

### 6. `app/page.tsx` — Added `login-card` class

**What**: Added `className="login-card"` to the inner card `<div>` in the login page.
**Why**: Required to allow the CSS rule in `globals.css` to target it. No content change.

---

## No Content Changed

- All text labels are identical
- All icons/emoji are identical
- All functionality (OAuth, cocktail mixing, music player) is unchanged
- All Tailwind layout classes on components are unchanged

---

## Status

| Task | Status |
|---|---|
| Viewport meta | ✅ Done |
| PC card overlap fix | ✅ Done |
| Mobile-only CSS section | ✅ Done |
| Tiny screen overrides | ✅ Done |
| Login card mobile padding | ✅ Done |
| PC/Mobile isolation | ✅ Done |
