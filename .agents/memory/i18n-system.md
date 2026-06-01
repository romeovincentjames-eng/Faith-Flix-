---
name: Faith Flix i18n system
description: How internationalization (multi-language) is wired through the single-file app
---

## Architecture
- Translations live in `src/i18n.ts` — exports `LANGUAGES`, `LangCode` (union type), `TRANSLATIONS` dict, and `translate(lang, key)` function
- 11 languages: en, el (Greek), es, fr, de, it, pt, nl, pl, sv, ro
- ~180 translation keys covering all UI strings per language

## Wiring
- `lang` state in `App()` via `useStoredState<LangCode>("faithflix-lang", "en")` (persists across sessions)
- `t = React.useCallback((key) => translate(lang, key), [lang])` — memoized translate function
- Both `lang`, `setLang`, `t` are in `buildContextShape()` type AND the context value object
- Every component destructures `t` from `useApp()` — added via Python regex to all `const { ... } = useApp();` patterns

## Language Picker UI
- `LanguagePicker` component in main.tsx — 3-column grid of flag + name buttons
- Placed in `ProfileScreen` above `<MyUploads />`
- CSS classes: `.lang-picker-section`, `.lang-grid`, `.lang-option`, `.lang-option-active`, `.lang-flag`, `.lang-name`

**Why:** useCallback memoization is critical — without it, every render recreates `t`, causing cascading re-renders.
**How to apply:** When adding new UI strings, add the key to ALL 11 languages in src/i18n.ts, then use t("key") in the component.
