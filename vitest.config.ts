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
    include: ["app/**/*.{test,spec}.{ts,tsx}", "lib/**/*.{test,spec}.{ts,tsx}"],
    exclude: ["node_modules", ".next", ".reference", "docs", "e2e", "tests/e2e"],
  },
  resolve: { alias: { "@": path.resolve(__dirname, ".") } },
});
