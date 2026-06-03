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

## Watch screen (TikTok style snap-scroll feed)
- `WatchFeedCard` component: actual video player with IntersectionObserver autoplay (threshold 0.65)
- `muted=true` by default (required for browser autoplay); Volume2/VolumeX toggle button on right side
- `scroll-snap-type: y mandatory` on `.watch-feed-screen` (position:fixed); each `.watch-feed-card` is `height:100%`
- IntersectionObserver plays video when card is ≥65% visible, pauses when scrolled away
- Right-side action bar: Heart (like), Bookmark (save), MessageCircle (→community), Share2, Volume toggle
- Admin videos shown as "✦ Official" gold badge; user videos as blue "Community" badge
- `selectedVideoId` used on mount to scroll to the right card via `scrollIntoView({ behavior: "instant" })`
- CSS class `.watch-page` on `<main>` removes padding so feed is edge-to-edge (like `.home-page`)
- Cloudflare Stream iframes shown as-is (no play/pause control possible)

## Home screen (featured content layout)
- `HomePosterCard`: 148px wide, aspect-ratio 9/14 (poster-style), routes to Watch screen
- Three sections: Featured (admin/featured videos), Series shelf (horizontal scroll cards), Recently Added
- `.home-featured-screen` resets padding:0; scrollable content area
- Hero at top: logo + "Faith Flix" gold title + tagline
- Series cards: landscape row cards with poster thumbnail + title + episode count + category
- Search results use `HomePosterCard` row + `home-series-shelf` (replaces old grid)

## Bottom nav
- `position: fixed; z-index: 30; backdrop-filter: blur(32px)`
- Active state: gold color + gold indicator line (`::after`) at top of button, 2px height, box-shadow glow
- Nav icon size: 22px; label font-size: 0.6rem
- 7 tabs: Home, Watch, Series, Community, Worship, Saved, Profile

## Primary button
- `linear-gradient(135deg, #e8b820, #C49010)` with `box-shadow` gold glow
- Text color: `#060a14` (very dark, good contrast on gold)

**Why:** User requested reference app style (React Native Faith Flix app). Reference used #080C18 + #D4A017 + #4A90D9. TikTok vertical feed on Home was explicitly chosen by user.
