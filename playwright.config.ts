import { defineConfig, devices } from '@playwright/test';
import { execSync } from 'child_process';

function findSystemChromium(): string | undefined {
  if (process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH) {
    return process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH;
  }
  try {
    const path = execSync('which chromium 2>/dev/null || which chromium-browser 2>/dev/null', {
      encoding: 'utf8',
    }).trim();
    return path || undefined;
  } catch {
    return undefined;
  }
}

const systemChromium = findSystemChromium();

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  expect: {
    toHaveScreenshot: {
      maxDiffPixelRatio: 0.001,
    },
  },
  use: {
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        ...(systemChromium
          ? {
              launchOptions: {
                executablePath: systemChromium,
                args: ['--no-sandbox', '--disable-setuid-sandbox'],
              },
            }
          : {}),
      },
    },
  ],
});
