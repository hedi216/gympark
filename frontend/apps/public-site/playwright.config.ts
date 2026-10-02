import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests",
  timeout: 90000,
  use: {
    baseURL: "http://localhost:5180",
    channel: "chrome",
    headless: true,
    reducedMotion: "reduce",
  },
  webServer: {
    command: "npm run dev -- --host 127.0.0.1",
    url: "http://localhost:5180",
    reuseExistingServer: !process.env.CI,
  },
  reporter: "list",
});
