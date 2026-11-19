import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// Unit tests for the pure logic in src/lib. Nothing here touches Supabase, the
// network or the DOM, so the node environment is enough and the suite needs no
// credentials. Anything that needs the live system is out of scope.

// Pin the clock's time zone to UTC, which is what Vercel runs in. Several
// modules read local time (documents.ts) or convert to Brisbane time
// (followUps.ts), and a suite that passes on a laptop in Brisbane but not on
// the server would be testing the wrong machine. Set here, before any worker
// starts, so every test file sees it.
process.env.TZ = "UTC";

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
