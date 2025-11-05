/**
 * MSW Initialization - runs FIRST before any test files load
 * This file is included in setupFiles FIRST to ensure MSW is ready
 * 
 * CRITICAL: This file just marks that MSW setup should happen
 * The actual MSW server startup happens in setup.ts beforeAll hook
 * which Vitest properly waits for before running tests
 */

console.log('[MSW Init] Module loaded - MSW initialization will happen in setup.ts beforeAll hook')
