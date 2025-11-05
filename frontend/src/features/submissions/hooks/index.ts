/**
 * Submissions Feature - Hooks
 * ============================
 * Custom hooks for submissions feature
 */

export { useFormAutoSave, AUTO_SAVE_LABELS } from './useFormAutoSave';
export type { DraftData, UseFormAutoSaveParams, UseFormAutoSaveReturn } from './useFormAutoSave';

export { useSubmissionPolling } from './useSubmissionPolling';
export type { UseSubmissionPollingOptions, UseSubmissionPollingResult } from './useSubmissionPolling';

export { useWebSocket } from './useWebSocket';
export type {
  WebSocketMessage,
  WebSocketMessageType,
  UseWebSocketOptions,
  UseWebSocketReturn,
} from './useWebSocket';
