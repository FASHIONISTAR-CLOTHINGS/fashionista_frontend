import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./tests/setup/vitest.setup.ts"],
    include: [
      "tests/unit/**/*.test.ts",
      "tests/unit/**/*.test.tsx",
    ],
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "json", "json-summary"],
      reportsDirectory: "./tests/coverage",
      thresholds: {
        branches: 75,
        functions: 75,
        lines: 75,
        statements: 75,
      },
      include: [
        "src/core/api/**",
        "src/features/auth/**",
        "src/features/uploads/**",
        "src/lib/**",
      ],
      exclude: [
        "src/**/*.d.ts",
        "src/**/index.ts",
        "src/**/*.stories.tsx",
        "node_modules",
      ],
    },
    testTimeout: 10_000,
    hookTimeout: 10_000,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "@/core": path.resolve(__dirname, "src/core"),
      "@/features": path.resolve(__dirname, "src/features"),
      "@/components": path.resolve(__dirname, "src/components"),
      "@/lib": path.resolve(__dirname, "src/lib"),
    },
  },
});
