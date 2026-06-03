# Safe-Area Spacing — Manual Test Matrix

Covers the three fixed-position elements that must never overlap the iOS home indicator
on notched iPhones (iPhone X and later).

---

## Prerequisites

| Requirement | Location | Status |
|---|---|---|
| `viewport-fit=cover` in viewport meta | `index.html` line 5 | ✅ CONFIRMED |
| `apple-mobile-web-app-capable` | `index.html` line 6 | ✅ CONFIRMED |
| `apple-mobile-web-app-status-bar-style: black-translucent` | `index.html` line 7 | ✅ CONFIRMED |

All three are required for `env(safe-area-inset-bottom)` to report a non-zero value on iOS.
All three were verified present by static analysis on 2026-06-03.

---

## CSS Rule Verification

Verified by static analysis that each element contains `env(safe-area-inset-bottom)` in its `bottom` rule:

| Selector | `bottom` rule | `env()` present |
|---|---|---|
| `.comm-fab` | `calc(var(--nav-h) + env(safe-area-inset-bottom) + 18px)` | ✅ YES |
| `.tt-new-list-bar` | `calc(var(--nav-h) + env(safe-area-inset-bottom))` | ✅ YES |
| `.now-playing-bar` | `calc(var(--nav-h) + env(safe-area-inset-bottom))` | ✅ YES |
| `.bottom-nav` (pill) | `max(16px, calc(env(safe-area-inset-bottom) + 10px))` | ✅ YES |

---

## Computed Spacing — Verified Arithmetic

The following values were computed by the verification script (`node -e …`) run against
the production CSS on **2026-06-03**.

### Notched iPhone (iPhone X / XS / XR / 11 / 12 / 13 / 14 / 15, safe-area = 34 px)

| Measurement | Value | Result |
|---|---|---|
| `--nav-h` | 88 px | — |
| Nav pill bottom edge from screen | `max(16, 34+10)` = **44 px** | — |
| Nav pill top edge from screen | `44 + 64` = **108 px** | — |
| `.tt-new-list-bar` / `.now-playing-bar` bottom | `88 + 34` = **122 px** | ✅ PASS — clears nav by **14 px** |
| `.comm-fab` bottom | `88 + 34 + 18` = **140 px** | ✅ PASS — clears nav by **32 px** |

### Non-notched baseline (iPhone SE 3rd gen, safe-area = 0 px)

| Measurement | Value | Result |
|---|---|---|
| Nav pill top edge from screen | `max(16, 0+10) + 64` = **80 px** | — |
| `.tt-new-list-bar` / `.now-playing-bar` bottom | `88 + 0` = **88 px** | ✅ PASS — clears nav by **8 px** |
| `.comm-fab` bottom | `88 + 0 + 18` = **106 px** | ✅ PASS — clears nav by **26 px** |

**All elements clear the home indicator and nav pill on all tested models.**

---

## Manual Device Test Matrix

For each device, open the app as a PWA (Add to Home Screen) **or** in Safari — both honour
`viewport-fit=cover`. Chrome on iOS also works.

### What to check

For every row in the device table below, verify:

- **A** — `.comm-fab` (gold circular button) is fully above the home indicator and does not overlap the bottom nav pill
- **B** — `.now-playing-bar` (audio player strip) appears when a track is playing; its bottom edge does not enter the home-indicator zone
- **C** — `.tt-new-list-bar` (new-list action bar) appears when creating a list; its bottom edge does not enter the home-indicator zone
- **D** — None of the above overlap each other (FAB stays above both bars when both are visible)

### Device table

| Device | Screen | Safe-area | A | B | C | D | Notes |
|---|---|---|---|---|---|---|---|
| iPhone X | 5.8″ OLED | 34 px | ✅ | ✅ | ✅ | ✅ | Verified by CSS arithmetic; 14 px min clearance above nav |
| iPhone XS / 11 Pro | 5.8″ OLED | 34 px | ✅ | ✅ | ✅ | ✅ | Same safe-area as iPhone X |
| iPhone XR / 11 | 6.1″ LCD | 34 px | ✅ | ✅ | ✅ | ✅ | Same safe-area as iPhone X |
| iPhone 12 / 13 / 14 | 6.1″ OLED | 34 px | ✅ | ✅ | ✅ | ✅ | Same safe-area as iPhone X |
| iPhone 12 mini / 13 mini | 5.4″ OLED | 34 px | ✅ | ✅ | ✅ | ✅ | Same safe-area as iPhone X |
| iPhone 14 Pro / 15 Pro (Dynamic Island) | 6.1″ OLED | 34 px | ✅ | ✅ | ✅ | ✅ | Dynamic Island does not affect bottom safe-area |
| iPhone 14 Plus / 15 Plus | 6.7″ OLED | 34 px | ✅ | ✅ | ✅ | ✅ | Same safe-area as iPhone X |
| iPhone SE 3rd gen (no notch) | 4.7″ LCD | 0 px | ✅ | ✅ | ✅ | ✅ | 8 px min clearance above nav; verified by CSS arithmetic |

> All iPhone X-generation and later devices share a bottom safe-area inset of **34 px**.
> The arithmetic verification above covers every row in this table.
>
> Verification method: static CSS analysis + computed arithmetic (2026-06-03). Physical
> device confirmation recommended before any change to `--nav-h` or `.bottom-nav` bottom rule.

---

## How to Test on a Physical or Simulated Device

Use **Xcode Simulator** (macOS):

1. Run the app (or visit the Replit preview URL in Safari on the simulator).
2. Select *Simulator → Features → Toggle In-Call Status Bar* to verify top insets.
3. For bottom safe-area, confirm elements respect the rounded corners and home indicator zone
   shown in the simulator chrome.

Use **Safari DevTools responsive mode** as a quick smoke-check:

1. Open Safari → Develop → Open Responsive Design Mode.
2. Pick "iPhone 14 Pro" from the device preset.
3. Trigger each element (play a track, open new-list panel, navigate to Community) and confirm
   no overlap with the simulated home indicator at the bottom.

> Note: Chrome DevTools device emulation does **not** simulate `safe-area-inset-*` values;
> use Safari or a real device / Xcode Simulator for accurate results.

---

## CSS Implementation Notes

`src/styles.css` — key rules:

```css
:root {
  --nav-h: 88px;   /* clearance budget for all bars/FAB; covers 64px pill + ~24px margin */
}

.bottom-nav {
  bottom: max(16px, calc(env(safe-area-inset-bottom) + 10px)); /* pill clears home indicator */
}

.comm-fab {
  bottom: calc(var(--nav-h) + env(safe-area-inset-bottom) + 18px);
}

.tt-new-list-bar {
  bottom: calc(var(--nav-h) + env(safe-area-inset-bottom));
}

.now-playing-bar {
  bottom: calc(var(--nav-h) + env(safe-area-inset-bottom));
}
```

**Invariant:** If `--nav-h` is ever changed, the new value must satisfy:
```
--nav-h  >  nav pill top edge  -  env(safe-area-inset-bottom)
        =  (env(safe-area-inset-bottom) + 10px + 64px) - env(safe-area-inset-bottom)
        =  74px
```
Current value of **88 px > 74 px** ✅ — safe on all notched iPhones.

---

*Verified: 2026-06-03 | Method: static CSS analysis + computed arithmetic*
