import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./__tests__/setup.ts"],
    include: ["__tests__/**/*.test.ts", "__tests__/**/*.test.tsx"],
    coverage: {
      provider: "v8",
      include: ["src/lib/**", "src/app/api/**"],
      exclude: ["src/lib/db.ts", "src/lib/cloudinary.ts"],
    },
    testTimeout: 10000,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
});
