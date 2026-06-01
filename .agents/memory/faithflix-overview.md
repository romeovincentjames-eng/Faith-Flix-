---
name: Faith Flix project overview
description: Core architecture decisions, quirks, and conventions for the Faith Flix app
---

## Stack
- React 19 + Vite 7 + TypeScript, single-file app (`src/main.tsx`, ~1700 lines)
- Supabase JS v2 (`src/lib/supabase.ts`) for auth, DB, storage
- Cloudflare Stream via `api/cloudflare-upload.js` for video uploads
- Workflow: `npm run dev -- --port 5000`

## Single-file app Vite HMR warning
`Could not Fast Refresh ("true" export is incompatible)` is expected and harmless — the single large file exports both constants and components, so Vite falls back to full page reloads. Not an error.

## Mock content seeding (important)
`MOCK_VIDEOS` (10), `MOCK_SERIES` (3), `MOCK_POSTS` (5), `MOCK_PRAYERS` (4) are defined as constants in `main.tsx`.
- `useStoredState` uses localStorage; if a user already has `faithflix-videos: []` in localStorage, the default won't kick in.
- A seeding effect runs on mount: `setVideos(current => current.length === 0 ? MOCK_VIDEOS : current)` etc.
- A cleanup effect filters out `starterVideoIds` (old placeholder IDs).
- Supabase video load only replaces videos when `data.length > 0` — prevents wiping mock data when Supabase table is empty.
- Mock video IDs start with `"mock-"` so they pass the starterVideoIds filter.

## CSS architecture
- All styles in `src/styles.css` (~1950 lines)
- Design: dark navy/midnight background, gold (`#f6d27b`) accent, `.content-panel` cards
- Bottom nav: `.bottom-nav.seven` (7 tabs), iOS safe-area aware
- Key component classes: `.thumb-wrap`, `.thumb-overlay`, `.thumb-play-btn`, `.thumb-info-row`, `.thumb-cat-tag`, `.thumb-dur`, `.video-card-body`, `.post-avatar`, `.post-header`, `.post-card`
- CSS added at end of file for all new overlay/animation styles (hover lift, fade-up, shimmer, etc.)
- DO NOT duplicate `.horizontal-video-row` / `.horizontal-series-row` — already defined at line ~1392 with grid layout

## Admin
- Admin email: `romeovgalasso@gmail.com` (line 130 of main.tsx)
- Admin detects by email match; opens Admin Studio tab automatically

## Unsplash thumbnails
Thumbnail URLs: `https://images.unsplash.com/photo-{ID}?w=500&q=80`

## GitHub remote
`https://github.com/romeovincentjames-eng/Faith-Flix-.git` (for Vercel deployment)
