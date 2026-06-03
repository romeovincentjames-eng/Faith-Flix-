---
name: Faith Flix design system
description: Color tokens, layout decisions, and component patterns for the mobile-first redesign
---

## Color tokens (defined in :root CSS vars)
- `--bg: #080C18` — deep navy background (matches reference React Native app exactly)
- `--bg2: #0d1228` — slightly lighter surface
- `--gold: #D4A017` — primary gold (buttons, active states, badges)
- `--gold-dim: rgba(212,160,23,0.35)` — gold at reduced opacity
- `--gold-glow: rgba(212,160,23,0.18)` — gold for backgrounds/glows
- `--blue: #4A90D9` — blue accent
- `--topbar-h: 62px` — topbar height reference used by feed-screen positioning
- `--nav-h: 68px` — bottom nav height reference

## Layout
- Mobile-first; on desktop the vertical feed is constrained to `min(430px, 100%)` centered
- `.home-page` class added to `<main>` when on home — zeroes out padding/max-width so feed is edge-to-edge
- `.feed-screen` is `position: fixed` from `calc(topbar-h + safe-area-inset-top)` to `calc(nav-h + safe-area-inset-bottom)`

## Home feed (TikTok style)
- `FeedCard` component: thumbnail bg, cinematic gradient overlay, bottom-left info, right-side action bar
- `scroll-snap-type: y mandatory` on `.feed-screen`; each `.feed-card` is `scroll-snap-align: start; height: 100%`
- Action buttons: Heart (like), Bookmark (save), Share2 — right side, vertically stacked
- Admin videos shown as "✦ Official" gold badge; user videos as blue "Community" badge
- Search on home page shows grid results in `.home-search-screen` (falls back gracefully)

## Bottom nav
- `position: fixed; z-index: 30; backdrop-filter: blur(32px)`
- Active state: gold color + gold indicator line (`::after`) at top of button, 2px height, box-shadow glow
- Nav icon size: 22px; label font-size: 0.6rem
- 7 tabs: Home, Watch, Series, Community, Worship, Saved, Profile

## Primary button
- `linear-gradient(135deg, #e8b820, #C49010)` with `box-shadow` gold glow
- Text color: `#060a14` (very dark, good contrast on gold)

**Why:** User requested reference app style (React Native Faith Flix app). Reference used #080C18 + #D4A017 + #4A90D9. TikTok vertical feed on Home was explicitly chosen by user.
