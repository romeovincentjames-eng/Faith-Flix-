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
