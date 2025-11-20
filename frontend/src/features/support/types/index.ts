// Import and re-export generated types from API
import type {
  SupportServiceSupportSessionResponse,
  SupportServiceSupportMessageResponse,
  SupportServiceCreateSupportSessionRequest,
  SupportServiceSendMessageRequest,
  SupportServicePageResponseSupportSessionResponse,
} from '@/api/types.gen'

// Local type aliases for convenience
export type SupportSession = SupportServiceSupportSessionResponse
export type SupportMessage = SupportServiceSupportMessageResponse
export type CreateSupportSessionInput = SupportServiceCreateSupportSessionRequest
export type SendMessageInput = SupportServiceSendMessageRequest
export type SupportSessionsPage = SupportServicePageResponseSupportSessionResponse

