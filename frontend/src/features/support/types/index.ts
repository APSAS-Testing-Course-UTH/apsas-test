// Import and re-export generated types from API
import type {
  SupportServiceSupportSessionDto,
  SupportServiceSupportMessageDto,
  SupportServiceCreateSupportSessionRequest,
  SupportServicePageResponseSupportSessionDto,
} from '@/api/types.gen'

// Local type aliases for convenience
export type SupportSession = SupportServiceSupportSessionDto
export type SupportMessage = SupportServiceSupportMessageDto
export type CreateSupportSessionInput = SupportServiceCreateSupportSessionRequest
export type SupportSessionsPage = SupportServicePageResponseSupportSessionDto

