import { PlaywrightTestConfig } from "@playwright/test";

const config: PlaywrightTestConfig = {
  testDir: "./e2e/specs",
  maxFailures: 1,
  forbidOnly: !!process.env.CI,
  testMatch: /.+\.spec\.ts/,
  workers: 1,
  timeout: 150_000,
};
export default config;
