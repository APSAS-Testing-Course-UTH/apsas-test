import type { KnipConfig } from 'knip';

const config: KnipConfig = {
  // Entry points - main application files
  entry: [
    'src/main.tsx',
    'src/app.tsx',
    'src/router.ts',
    'src/query-client.ts',
    'vite.config.ts',
    'vitest.config.ts',
    'postcss.config.cjs',
    'eslint.config.js',
  ],

  // Project files to analyze
  project: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.test.{ts,tsx}',
    '!src/**/*.integration.test.{ts,tsx}',
  ],

  // Ignore patterns
  ignore: [
    // Generated files (DO NOT EDIT)
    'src/api/**/*.gen.ts',
    'src/routeTree.gen.ts',
    
    // Test files
    'src/**/*.test.{ts,tsx}',
    'src/**/*.integration.test.{ts,tsx}',
    'src/test/**/*',
    
    // Mock data (development only)
    'src/mocks/**/*',
    
    // Config files
    '**/*.config.{js,ts,cjs,mjs}',
    
    // Build output
    'dist/**/*',
  ],

  // Ignore dependencies that are used but not in obvious ways
  ignoreDependencies: [
    // Vite plugins
    '@vitejs/plugin-react',
    'vite-tsconfig-paths',
    
    // PostCSS plugins
    'postcss-preset-mantine',
    'postcss-simple-vars',
    
    // MSW (development only, used in browser.ts)
    'msw',
    
    // TypeScript and build tools
    'typescript',
    '@types/*',
    
    // Testing libraries
    'vitest',
    '@vitest/ui',
    '@testing-library/*',
    'jsdom',
    
    // Linting
    'eslint',
    '@eslint/*',
    'typescript-eslint',
  ],

  // Ignore unresolved imports (virtual modules, etc.)
  ignoreUnresolved: [
    // Virtual modules
    /^virtual:.*/,
    
    // Environment variables (Vite)
    /^~.*/,
  ],

  // Issue type configuration
  // Focus on exports, types, and dependencies
  // Ignore class/enum members as they can have valid reasons to exist
  rules: {
    files: 'warn',              // Unused files
    dependencies: 'error',      // Unused dependencies
    devDependencies: 'warn',    // Unused devDependencies
    unlisted: 'error',          // Unlisted dependencies
    binaries: 'warn',           // Unused binaries
    unresolved: 'error',        // Unresolved imports
    exports: 'warn',            // Unused exports (main focus)
    types: 'warn',              // Unused types
    nsExports: 'off',           // Namespace exports (can be intentional)
    nsTypes: 'off',             // Namespace types (can be intentional)
    enumMembers: 'off',         // Enum members (often intentional)
    classMembers: 'off',        // Class members (often intentional)
    duplicates: 'warn',         // Duplicate exports
  },

  // Ignore exports used within the same file
  // Set to false to catch all unused exports
  ignoreExportsUsedInFile: {
    interface: false,  // Report unused interfaces even if used in same file
    type: false,       // Report unused types even if used in same file
  },

  // Include entry exports in analysis
  // Useful for finding unused exports in main files
  includeEntryExports: false,  // Don't report exports in entry files (they're meant to be public)

  // Workspace configuration (monorepo support - not needed for single project)
  workspaces: {
    '.': {
      // Custom entry points can be added here if needed
    },
  },
};

export default config;
