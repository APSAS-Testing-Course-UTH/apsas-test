/// <reference types="vitest/config" />
import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import path from "path"
import { fileURLToPath } from "url"
import { tanstackRouter } from "@tanstack/router-plugin/vite"
import { visualizer } from "rollup-plugin-visualizer"

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [
    tanstackRouter({
      target: "react",
      autoCodeSplitting: false,  // Disable code splitting to fix module resolution issues
      quoteStyle: "double",
      semicolons: false,
      routesDirectory: "./src/routes",
      generatedRouteTree: "./src/routeTree.gen.ts",
      routeFileIgnorePattern: ".test.",
    }),
    react(),
    // Bundle analyzer - chỉ enable khi chạy với --mode analyze
    process.env.ANALYZE === 'true' && visualizer({
      filename: 'dist/bundle-analysis.html',
      open: true,
      gzipSize: true,
      brotliSize: true,
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@tabler/icons-react": "@tabler/icons-react/dist/esm/icons/index.mjs",
    },
  },
  define: {
    // Global constants injected vào toàn bộ codebase (build-time replacement)
    // Không cần import, dùng trực tiếp: console.log(__API_BASE_URL__)
    __API_BASE_URL__: JSON.stringify(process.env.VITE_API_BASE_URL), // API backend URL từ .env
    __API_TIMEOUT__: JSON.stringify(process.env.VITE_API_TIMEOUT),   // API timeout (ms) từ .env
    __APP_NAME__: JSON.stringify(process.env.VITE_APP_NAME),         // Tên app từ .env
    __APP_VERSION__: JSON.stringify(process.env.VITE_APP_VERSION),   // Version app từ .env
    global: 'globalThis', // Polyfill for global object (needed for sockjs-client and @stomp/stompjs)
  },
  test: {
    environment: "happy-dom",
    // Use globals to ensure describe/it/expect are available
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    hookTimeout: 30000,
    testTimeout: 30000,
    include: ["src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    exclude: ["node_modules", "dist"],
    // Set environment variables for tests
    env: {
      VITE_API_BASE_URL: "http://localhost:3000",
    },
    // Ensure jsdom is properly initialized before tests run
    environmentOptions: {
      jsdom: {
        beforeParse() {
          // jsdom will create window/document here
        },
      },
    },
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html", "lcov"],
      include: ["src/**/*.tsx", "src/**/*.ts"],
      exclude: [
        "node_modules",
        "dist",
        "**/*.test.tsx",
        "**/*.test.ts",
        "**/*.spec.tsx",
        "**/*.spec.ts",
      ],
      thresholds: {
        lines: 90,
        functions: 90,
        branches: 85,
        statements: 90,
      },
    },
  },
})
