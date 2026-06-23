import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    globals: true,
    passWithNoTests: true,
    include: [
      "app/**/*.{test,spec}.{ts,tsx}",
      "lib/**/*.{test,spec}.{ts,tsx}",
      "components/**/*.{test,spec}.{ts,tsx}",
      "tests/unit/**/*.{test,spec}.{ts,tsx}",
    ],
    exclude: ["node_modules", ".next", ".reference", "docs", "e2e", "tests/e2e", ".superpowers", ".serena"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
      // `server-only` throws unless resolved under the react-server condition,
      // which the test runner doesn't set. Map it to a repo-owned no-op stub so
      // resolution doesn't depend on the node_modules layout (pnpm/PnP-safe).
      "server-only": path.resolve(__dirname, "tests/stubs/server-only.ts"),
    },
  },
});
