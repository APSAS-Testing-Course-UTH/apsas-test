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
      autoCodeSplitting: true,
      quoteStyle: "double",
      semicolons: false,
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
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    globals: true,
  },
})
