// Export all MSW handlers
console.log('[Handlers] Loading handler modules...')

import { identityHandlers } from './identityHandlers'
console.log('[Handlers] ✅ Loaded identityHandlers:', identityHandlers?.length || 0)

import { submissionHandlers } from './submissionHandlers'
console.log('[Handlers] ✅ Loaded submissionHandlers:', submissionHandlers?.length || 0)

import { evaluationHandlers } from './evaluationHandlers'
console.log('[Handlers] ✅ Loaded evaluationHandlers:', evaluationHandlers?.length || 0)

import { contentHandlers } from './contentHandlers'
console.log('[Handlers] ✅ Loaded contentHandlers:', contentHandlers?.length || 0)

import { supportHandlers } from './supportHandlers'
console.log('[Handlers] ✅ Loaded supportHandlers:', supportHandlers?.length || 0)

import { notificationHandlers } from './notificationHandlers'
console.log('[Handlers] ✅ Loaded notificationHandlers:', notificationHandlers?.length || 0)

export const handlers = [
  // Identity Service handlers
  ...identityHandlers,

  // Submission Service handlers
  ...submissionHandlers,

  // Evaluation Service handlers
  ...evaluationHandlers,

  // Content Service handlers
  ...contentHandlers,

  // Support Service handlers
  ...supportHandlers,

  // Notification Service handlers
  ...notificationHandlers,
]

console.log('[Handlers] ✅ Total handlers exported:', handlers?.length || 0)