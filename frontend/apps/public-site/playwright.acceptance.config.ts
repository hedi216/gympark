import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./acceptance",
  timeout: 120000,
  workers: 1,
  use: {
    actionTimeout: 10000,
    baseURL: "http://localhost:5190",
    channel: "chrome",
    headless: true,
    reducedMotion: "reduce",
  },
  webServer: [
    {
      command: "npm run dev -- --host 127.0.0.1 --port 5190",
      url: "http://localhost:5190",
      reuseExistingServer: false,
    },
    {
      command:
        "npm run dev -w ../admin-console -- --host 127.0.0.1 --port 5192",
      url: "http://localhost:5192",
      reuseExistingServer: false,
    },
  ],
  reporter: "list",
});
