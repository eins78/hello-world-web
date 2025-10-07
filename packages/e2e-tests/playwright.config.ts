import { defineConfig, devices } from "@playwright/test";
import { defineBddConfig } from "playwright-bdd";

const PORT = process.env.PORT || 9999;

const testDir = defineBddConfig({
  features: "features/**/*.feature",
  steps: "steps/**/*.ts",
});

// Choose server command based on Node.js version
const nodeVersion = process.version;
const [major, minor] = nodeVersion.slice(1).split(".").map(Number);
const hasExperimentalFlags = major > 22 || (major === 22 && minor >= 7);
const serverCommand = hasExperimentalFlags
  ? "cd ../../packages/app && node --experimental-strip-types --experimental-transform-types src/bin/www.ts"
  : "cd ../../packages/app && pnpm exec tsx src/bin/www.ts";

export default defineConfig({
  testDir,
  testMatch: "**/*.feature.spec.js",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },
    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
    },
  ],

  webServer: {
    command: serverCommand,
    port: Number(PORT),
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
    env: {
      DEBUG: "hello-world-web:*",
      NODE_ENV: "production",
    },
  },
});
