import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    // CRITICAL: jsdom environment with globals enabled
    environment: 'jsdom',
    globals: true,
    
    // Setup files - run in order AFTER jsdom is initialized
    setupFiles: [
      './src/test/env-setup.ts',      // Load jest-dom matchers
      './src/test/msw-init.ts',       // Initialize MSW
      './src/test/setup.ts',          // Main setup (DOM mocks, etc.)
    ],
    
    // File patterns
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    exclude: ['node_modules', 'dist', '**/*.gen.ts'],
    
    // Timeouts
    testTimeout: 10000,
    hookTimeout: 30000,
    
    // Environment variables
    env: {
      VITE_API_BASE_URL: 'http://localhost:3000',
    },
    
    // Coverage settings
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      include: ['src/**/*.tsx', 'src/**/*.ts'],
      exclude: [
        'node_modules',
        'dist',
        '**/*.test.tsx',
        '**/*.test.ts',
        '**/*.spec.tsx',
        '**/*.spec.ts',
        '**/*.gen.ts',
        '**/mocks/**',
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

