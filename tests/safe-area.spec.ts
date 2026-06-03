/**
 * Safe-area spacing regression tests
 *
 * Verifies that the three fixed-position bars (.comm-fab, .tt-new-list-bar,
 * .now-playing-bar) always sit above the bottom-nav pill's top edge, even when
 * a 34 px iOS home-indicator inset is in play.
 *
 * How it works:
 *  - Loads a minimal HTML page that includes only the CSS rules under test.
 *  - Overrides `--sat` (test-only alias for env(safe-area-inset-bottom)) on
 *    :root so the arithmetic can be exercised in any browser.
 *  - Reads `getComputedStyle(el).bottom` for each element and for the nav pill,
 *    then asserts that every bar's bottom edge ≥ nav-pill top edge.
 *
 * Viewports tested:
 *  - iPhone 14 (390 × 844) — notched, --sat = 34 px
 *  - iPhone SE 3rd gen (375 × 667) — no notch, --sat = 0 px
 *  - iPad Air (820 × 1180) — wide viewport, --keyboard-inset wired up via base rule
 */

import { test, expect, Page } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const STYLES_CSS = fs.readFileSync(
  path.resolve(__dirname, '../src/styles.css'),
  'utf8',
);

async function buildPage(page: Page, sat: number, viewport: { width: number; height: number }) {
  await page.setViewportSize(viewport);

  await page.setContent(`<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<style>
${STYLES_CSS}
:root { --sat: ${sat}px; }
</style>
</head>
<body>
  <nav class="bottom-nav"></nav>
  <button class="comm-fab"></button>
  <div class="tt-new-list-bar"></div>
  <div class="now-playing-bar"></div>
</body>
</html>`);
}

/**
 * Returns { bottom, height } for an element, both in px.
 * `bottom` is the CSS computed-style value (distance from viewport bottom edge).
 */
async function getGeometry(page: Page, selector: string) {
  return page.evaluate((sel) => {
    const el = document.querySelector(sel) as HTMLElement;
    const style = window.getComputedStyle(el);
    return {
      bottom: parseFloat(style.bottom),
      height: parseFloat(style.height),
    };
  }, selector);
}

/**
 * Returns the top edge of the nav pill (distance from viewport bottom).
 * top-edge = pill.bottom + pill.height
 */
async function navPillTopEdge(page: Page): Promise<number> {
  const { bottom, height } = await getGeometry(page, '.bottom-nav');
  return bottom + height;
}

// ── Notched iPhone (iPhone 14, safe-area = 34 px) ────────────────────────────

test.describe('Notched iPhone — safe-area 34 px', () => {
  const IPHONE_14 = { width: 390, height: 844 };

  test('.comm-fab bottom clears nav pill top edge', async ({ page }) => {
    await buildPage(page, 34, IPHONE_14);
    const pillTop = await navPillTopEdge(page);
    const { bottom } = await getGeometry(page, '.comm-fab');
    expect(bottom).toBeGreaterThanOrEqual(pillTop);
  });

  test('.tt-new-list-bar bottom clears nav pill top edge', async ({ page }) => {
    await buildPage(page, 34, IPHONE_14);
    const pillTop = await navPillTopEdge(page);
    const { bottom } = await getGeometry(page, '.tt-new-list-bar');
    expect(bottom).toBeGreaterThanOrEqual(pillTop);
  });

  test('.now-playing-bar top is at or below the top bar (clears top safe area)', async ({ page }) => {
    await buildPage(page, 34, IPHONE_14);
    // now-playing-bar moved to top: calc(var(--topbar-h) + env(safe-area-inset-top))
    // --topbar-h is 56 px; env(safe-area-inset-top) is 0 in non-iOS browsers
    const top = await page.evaluate(() => {
      const el = document.querySelector('.now-playing-bar') as HTMLElement;
      return parseFloat(window.getComputedStyle(el).top);
    });
    expect(top).toBeGreaterThanOrEqual(56);
  });

  test('nav pill itself clears the home indicator zone (bottom ≥ sat)', async ({ page }) => {
    await buildPage(page, 34, IPHONE_14);
    const { bottom } = await getGeometry(page, '.bottom-nav');
    // At iPhone widths (< 560 px) the responsive rule applies:
    // max(12px, sat + 8px) = max(12, 42) = 42 px — still above the 34 px home indicator
    expect(bottom).toBeGreaterThanOrEqual(34);
  });
});

// ── Non-notched iPhone (iPhone SE 3rd gen, safe-area = 0 px) ─────────────────

test.describe('Non-notched iPhone — safe-area 0 px', () => {
  const IPHONE_SE = { width: 375, height: 667 };

  test('.comm-fab bottom clears nav pill top edge', async ({ page }) => {
    await buildPage(page, 0, IPHONE_SE);
    const pillTop = await navPillTopEdge(page);
    const { bottom } = await getGeometry(page, '.comm-fab');
    expect(bottom).toBeGreaterThanOrEqual(pillTop);
  });

  test('.tt-new-list-bar bottom clears nav pill top edge', async ({ page }) => {
    await buildPage(page, 0, IPHONE_SE);
    const pillTop = await navPillTopEdge(page);
    const { bottom } = await getGeometry(page, '.tt-new-list-bar');
    expect(bottom).toBeGreaterThanOrEqual(pillTop);
  });

  test('.now-playing-bar top is at or below the top bar (clears top safe area)', async ({ page }) => {
    await buildPage(page, 0, IPHONE_SE);
    const top = await page.evaluate(() => {
      const el = document.querySelector('.now-playing-bar') as HTMLElement;
      return parseFloat(window.getComputedStyle(el).top);
    });
    expect(top).toBeGreaterThanOrEqual(56);
  });

  test('nav pill bottom is at least 12 px when safe-area is 0', async ({ page }) => {
    await buildPage(page, 0, IPHONE_SE);
    const { bottom } = await getGeometry(page, '.bottom-nav');
    // At iPhone widths (< 560 px) the responsive rule applies:
    // max(12px, 0+8px) = 12 px — pill is never flush with the screen edge
    expect(bottom).toBeGreaterThanOrEqual(12);
  });
});

// ── Keyboard-open state (notched iPhone, keyboard-inset = 300 px) ─────────────
//
// Simulates the soft keyboard being open by setting --keyboard-inset and then
// mirroring what the app's ResizeObserver + updateNavH callback does at runtime:
// --nav-h = Math.ceil(innerHeight - nav.getBoundingClientRect().top).
// This ensures the test exercises the same CSS arithmetic the browser will use.

const KEYBOARD_INSET = 300; // realistic iOS / Android soft-keyboard height in px

async function buildPageWithKeyboard(
  page: Page,
  sat: number,
  viewport: { width: number; height: number },
  keyboardInset: number,
) {
  await page.setViewportSize(viewport);

  await page.setContent(`<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<style>
${STYLES_CSS}
:root { --sat: ${sat}px; --keyboard-inset: ${keyboardInset}px; }
</style>
</head>
<body>
  <nav class="bottom-nav"></nav>
  <button class="comm-fab"></button>
  <div class="tt-new-list-bar"></div>
  <div class="now-playing-bar"></div>
</body>
</html>`);

  // Mirror what the app's ResizeObserver + updateNavH does:
  // --nav-h = Math.ceil(viewH - nav.getBoundingClientRect().top)
  await page.evaluate(() => {
    const nav = document.querySelector('.bottom-nav') as HTMLElement;
    const viewH = window.innerHeight;
    const rect = nav.getBoundingClientRect();
    document.documentElement.style.setProperty(
      '--nav-h',
      `${Math.ceil(Math.max(0, viewH - rect.top))}px`,
    );
  });
}

test.describe('Keyboard open — notched iPhone, safe-area 34 px, keyboard-inset 300 px', () => {
  const IPHONE_14 = { width: 390, height: 844 };

  test('.comm-fab bottom clears nav pill top edge when keyboard is open', async ({ page }) => {
    await buildPageWithKeyboard(page, 34, IPHONE_14, KEYBOARD_INSET);
    const pillTop = await navPillTopEdge(page);
    const { bottom } = await getGeometry(page, '.comm-fab');
    expect(bottom).toBeGreaterThanOrEqual(pillTop);
  });

  test('.tt-new-list-bar bottom clears nav pill top edge when keyboard is open', async ({ page }) => {
    await buildPageWithKeyboard(page, 34, IPHONE_14, KEYBOARD_INSET);
    const pillTop = await navPillTopEdge(page);
    const { bottom } = await getGeometry(page, '.tt-new-list-bar');
    expect(bottom).toBeGreaterThanOrEqual(pillTop);
  });

  test('.now-playing-bar does not overlap nav pill when keyboard is open', async ({ page }) => {
    await buildPageWithKeyboard(page, 34, IPHONE_14, KEYBOARD_INSET);
    const { nowPlayingBarBottom, navPillTop } = await page.evaluate(() => {
      const npBar = document.querySelector('.now-playing-bar') as HTMLElement;
      const navPill = document.querySelector('.bottom-nav') as HTMLElement;
      const npRect = npBar.getBoundingClientRect();
      const navRect = navPill.getBoundingClientRect();
      return { nowPlayingBarBottom: npRect.bottom, navPillTop: navRect.top };
    });
    // now-playing-bar is pinned to the top of the screen; its bottom edge must
    // sit above the top edge of the nav pill — no overlap, even with keyboard open.
    expect(nowPlayingBarBottom).toBeLessThanOrEqual(navPillTop);
  });

  test('nav pill rises when keyboard opens — narrow viewport (iPhone 14)', async ({ page }) => {
    // Baseline: no keyboard
    await buildPage(page, 34, IPHONE_14);
    const { bottom: bottomNoKeyboard } = await getGeometry(page, '.bottom-nav');

    // Keyboard open — narrow-viewport rule must now include var(--keyboard-inset, 0px)
    await buildPageWithKeyboard(page, 34, IPHONE_14, KEYBOARD_INSET);
    const { bottom: bottomWithKeyboard } = await getGeometry(page, '.bottom-nav');

    // With keyboard-inset = 300 px the pill must sit higher than the baseline
    expect(bottomWithKeyboard).toBeGreaterThan(bottomNoKeyboard);
  });

  test('nav pill rises when keyboard opens — narrow viewport (iPhone SE)', async ({ page }) => {
    const IPHONE_SE = { width: 375, height: 667 };

    // Baseline: no keyboard
    await buildPage(page, 0, IPHONE_SE);
    const { bottom: bottomNoKeyboard } = await getGeometry(page, '.bottom-nav');

    // Keyboard open — narrow-viewport rule must include var(--keyboard-inset, 0px)
    await buildPageWithKeyboard(page, 0, IPHONE_SE, KEYBOARD_INSET);
    const { bottom: bottomWithKeyboard } = await getGeometry(page, '.bottom-nav');

    // With keyboard-inset = 300 px the pill must sit higher than the baseline
    expect(bottomWithKeyboard).toBeGreaterThan(bottomNoKeyboard);
  });

});

// ── Keyboard open — iPad Air (wide viewport, keyboard-inset active) ──────────
//
// At widths > 560 px the @media (max-width: 560px) override does NOT apply,
// so the base rule:
//   bottom: calc(max(16px, …) + var(--keyboard-inset, 0px))
// is in effect and --keyboard-inset IS wired up.
// These tests verify that all bars clear the nav pill and that the pill
// physically rises when the keyboard opens, confirming the CSS arithmetic
// is correct on the wide-screen path.

test.describe('Keyboard open — iPad Air 820 × 1180, safe-area 0 px, keyboard-inset 300 px', () => {
  const IPAD_AIR = { width: 820, height: 1180 };

  test('.comm-fab bottom clears nav pill top edge when keyboard is open', async ({ page }) => {
    await buildPageWithKeyboard(page, 0, IPAD_AIR, KEYBOARD_INSET);
    const pillTop = await navPillTopEdge(page);
    const { bottom } = await getGeometry(page, '.comm-fab');
    expect(bottom).toBeGreaterThanOrEqual(pillTop);
  });

  test('.tt-new-list-bar bottom clears nav pill top edge when keyboard is open', async ({ page }) => {
    await buildPageWithKeyboard(page, 0, IPAD_AIR, KEYBOARD_INSET);
    const pillTop = await navPillTopEdge(page);
    const { bottom } = await getGeometry(page, '.tt-new-list-bar');
    expect(bottom).toBeGreaterThanOrEqual(pillTop);
  });

  test('.now-playing-bar does not overlap nav pill when keyboard is open', async ({ page }) => {
    await buildPageWithKeyboard(page, 0, IPAD_AIR, KEYBOARD_INSET);
    const { nowPlayingBarBottom, navPillTop } = await page.evaluate(() => {
      const npBar = document.querySelector('.now-playing-bar') as HTMLElement;
      const navPill = document.querySelector('.bottom-nav') as HTMLElement;
      const npRect = npBar.getBoundingClientRect();
      const navRect = navPill.getBoundingClientRect();
      return { nowPlayingBarBottom: npRect.bottom, navPillTop: navRect.top };
    });
    // now-playing-bar is pinned near the top; its bottom edge must sit above
    // the nav pill's top edge — no overlap, even with keyboard open.
    expect(nowPlayingBarBottom).toBeLessThanOrEqual(navPillTop);
  });

  test('nav pill rises when keyboard opens — --keyboard-inset is active at wide viewport', async ({ page }) => {
    // Baseline: no keyboard — wide viewport uses base CSS rule (no 560 px override)
    await buildPage(page, 0, IPAD_AIR);
    const { bottom: bottomNoKeyboard } = await getGeometry(page, '.bottom-nav');

    // Keyboard open — base rule adds var(--keyboard-inset, 0px) so pill must rise
    await buildPageWithKeyboard(page, 0, IPAD_AIR, KEYBOARD_INSET);
    const { bottom: bottomWithKeyboard } = await getGeometry(page, '.bottom-nav');

    // At > 560 px the base rule is: max(16px, sat+10px) + keyboard-inset
    // With keyboard-inset = 300 px the pill should be ~300 px higher than baseline
    expect(bottomWithKeyboard).toBeGreaterThan(bottomNoKeyboard);
  });
});

// ── Visual snapshot tests (image diff) ───────────────────────────────────────
//
// These tests capture full-page screenshots of the safe-area layout and compare
// them against committed baseline images.  Any unintended visual shift — e.g. a
// bar widening and overlapping the nav pill — will cause a pixel diff failure
// even when the arithmetic-based tests above still pass.
//
// To regenerate baselines after an intentional change run:
//   npx playwright test --update-snapshots

test.describe('Visual snapshots — safe-area layout', () => {
  test('iPhone 14 layout with --sat 34 px matches snapshot', async ({ page }) => {
    await buildPage(page, 34, { width: 390, height: 844 });
    await expect(page).toHaveScreenshot('iphone14-sat34.png', { fullPage: true });
  });

  test('iPhone SE layout with --sat 0 px matches snapshot', async ({ page }) => {
    await buildPage(page, 0, { width: 375, height: 667 });
    await expect(page).toHaveScreenshot('iphone-se-sat0.png', { fullPage: true });
  });

  test('iPhone 14 layout with keyboard open matches snapshot', async ({ page }) => {
    await buildPageWithKeyboard(page, 34, { width: 390, height: 844 }, KEYBOARD_INSET);
    await expect(page).toHaveScreenshot('iphone14-sat34-keyboard.png', { fullPage: true });
  });

  test('iPhone SE layout with keyboard open matches snapshot', async ({ page }) => {
    await buildPageWithKeyboard(page, 0, { width: 375, height: 667 }, KEYBOARD_INSET);
    await expect(page).toHaveScreenshot('iphone-se-sat0-keyboard.png', { fullPage: true });
  });
});

// ── --nav-h invariant guard ───────────────────────────────────────────────────

test('--nav-h must be greater than 74 px (required by safe-area invariant)', async ({ page }) => {
  await buildPage(page, 34, { width: 390, height: 844 });
  const navH = await page.evaluate(() => {
    const raw = getComputedStyle(document.documentElement)
      .getPropertyValue('--nav-h')
      .trim();
    return parseFloat(raw);
  });
  // Invariant: --nav-h > 74 px (= pill height 64 px + 10 px bottom margin)
  // Any change to --nav-h that violates this will cause overlaps on all notched iPhones.
  expect(navH).toBeGreaterThan(74);
});
