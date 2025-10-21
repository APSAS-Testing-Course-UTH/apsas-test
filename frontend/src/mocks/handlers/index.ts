// Export all MSW handlers
import { identityHandlers } from './identityHandlers'
import { submissionHandlers } from './submissionHandlers'
import { evaluationHandlers } from './evaluationHandlers'
import { contentHandlers } from './contentHandlers'
import { supportHandlers } from './supportHandlers'

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
]