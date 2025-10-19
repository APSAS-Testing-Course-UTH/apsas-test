import { QueryClient } from "@tanstack/react-query"
import axios from "axios"

// Tanstack querry client configured với các options optimal

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes - data được coi là fresh trong 5 phút
      gcTime: 1000 * 60 * 10, // 10 minutes - garbage collection time
      retry: (failureCount, error) => {
        // Không retry cho lỗi client (4xx) hoặc một số lỗi server đặc biệt
        if (axios.isAxiosError(error)) {
          const status = error.response?.status
          // Không retry cho client errors (4xx) hoặc specific server errors
          if (status && (status >= 400 && status < 500)) {
            return false
          }
          // Không retry cho các lỗi server không thể retry được
          if (status && (status === 401 || status === 403 || status === 404)) {
            return false
          }
        }
        // Retry tối đa 3 lần với exponential backoff cho các lỗi khác
        return failureCount < 3
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff, max 30s
      refetchOnWindowFocus: false, // Không refetch khi focus window để tránh spam requests
      refetchOnReconnect: true, // Refetch khi network reconnect
    },
    mutations: {
      retry: false, // Không retry mutations theo mặc định
      onError: (error) => {
        console.error('Mutation error:', error)
        // Global error handling cho mutations có thể tích hợp với notification system
      },
    },
  },
})
