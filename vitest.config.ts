import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// Unit tests cover the pure logic in src/lib — allocation, validation, the
// 48-hour clock, CSV export. Nothing here touches Supabase, the network or the
// DOM, so the node environment is enough and the suite runs in about a second.
//
// Anything that needs the live system is deliberately out of scope: see
// .claude/skills/verify-live-state for how those claims get proven instead.
export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
