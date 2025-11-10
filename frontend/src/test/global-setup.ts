// Vitest global setup - runs once before ALL tests in Node context

export default async function globalSetup() {
  console.log('[Global Setup] Starting...')
  // We can't set up jsdom here since this runs in Node
  // But we can initialize things like MSW server
  // Actually, we should skip this and let setupFiles handle it
  return () => {
    console.log('[Global Setup] Cleanup')
  }
}
