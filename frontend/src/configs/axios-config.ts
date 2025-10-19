import axios, { AxiosError } from 'axios';
import type { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { env } from './env';

// Axios configuration cho APSAS Frontend

/**
 * API base URL từ environment variables
 */
const API_BASE_URL = env.VITE_API_BASE_URL;

/**
 * API timeout từ environment variables
 */
const API_TIMEOUT = env.VITE_API_TIMEOUT;

/**
 * Local storage key cho JWT token
 */
const TOKEN_STORAGE_KEY = 'apsas_token';


/**
 * Base axios instance với default configuration
 */
const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

/**
 * Request interceptor để attach JWT token vào requests
 */
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    // Get token from localStorage
    const token = localStorage.getItem(TOKEN_STORAGE_KEY);

    // Attach token to Authorization header if available
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add timestamp for debugging
    if (config.headers) {
      config.headers['X-Request-Time'] = new Date().toISOString();
    }

    return config;
  },
  (error: AxiosError): Promise<AxiosError> => {
    // Handle request setup errors
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

/**
 * Response interceptor để handle authentication errors và token refresh
 */
axiosInstance.interceptors.response.use(
  (response: AxiosResponse): AxiosResponse => {
    // Return successful responses as-is
    return response;
  },
  (error: AxiosError): Promise<AxiosError> => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Handle 401 Unauthorized errors
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Prevent infinite retry loop
      originalRequest._retry = true;

      // Clear invalid token
      localStorage.removeItem(TOKEN_STORAGE_KEY);

      // Redirect đến login page
      // Note: sử dụng window.location.href instead of router navigation
      // bởi vì interceptor này chạy ngoài context của React component
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }

      // Return a error message
      const authError: AxiosError = {
        ...error,
        message: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
        response: {
          ...error.response,
          data: {
            message: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
            code: 'AUTH_EXPIRED',
          },
        },
      } as AxiosError;

      return Promise.reject(authError);
    }

    // Handle network errors
    if (!error.response) {
      const networkError: AxiosError = {
        ...error,
        message: 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.',
        response: {
          ...(error.response || {}),
          data: {
            message: 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.',
            code: 'NETWORK_ERROR',
          },
        },
      } as AxiosError;

      return Promise.reject(networkError);
    }

    // Handle other HTTP errors với messages tiếng Việt
    if (error.response?.status) {
      let errorMessage = 'Có lỗi xảy ra từ máy chủ.';

      switch (error.response.status) {
        case 400:
          errorMessage = 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.';
          break;
        case 403:
          errorMessage = 'Bạn không có quyền truy cập tài nguyên này.';
          break;
        case 404:
          errorMessage = 'Không tìm thấy tài nguyên yêu cầu.';
          break;
        case 409:
          errorMessage = 'Dữ liệu đã tồn tại hoặc có xung đột.';
          break;
        case 422:
          errorMessage = 'Dữ liệu nhập không hợp lệ.';
          break;
        case 429:
          errorMessage = 'Quá nhiều yêu cầu. Vui lòng thử lại sau.';
          break;
        case 500:
          errorMessage = 'Lỗi máy chủ nội bộ. Vui lòng thử lại sau.';
          break;
        case 502:
        case 503:
        case 504:
          errorMessage = 'Máy chủ đang bảo trì. Vui lòng thử lại sau.';
          break;
        default:
          errorMessage = `Lỗi ${error.response.status}: ${error.response.statusText}`;
      }

      const httpError: AxiosError = {
        ...error,
        message: errorMessage,
        response: {
          ...error.response,
          data: {
            ...(error.response.data as object),
            message: errorMessage,
            code: `HTTP_${error.response.status}`,
          },
        },
      } as AxiosError;

      return Promise.reject(httpError);
    }

    // Return original error nếu không được handle
    return Promise.reject(error);
  }
);

/**
 * Set JWT token trong localStorage và axios headers
 */
export const setAuthToken = (token: string): void => {
  localStorage.setItem(TOKEN_STORAGE_KEY, token);
};

/**
 * Get JWT token từ localStorage
 */
export const getAuthToken = (): string | null => {
  return localStorage.getItem(TOKEN_STORAGE_KEY);
};

/**
 * Remove JWT token khỏi localStorage
 */
export const removeAuthToken = (): void => {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
};

/**
 * Kiểm tra user đã authenticated (có valid token)
 */
export const isAuthenticated = (): boolean => {
  const token = getAuthToken();
  return !!token;
};

/**
 * Tạo axios instance mới cho specific use cases
 */
export const createAxiosInstance = (config?: Partial<InternalAxiosRequestConfig>): AxiosInstance => {
  const instance = axios.create({
    ...axiosInstance.defaults,
    ...config,
  });

  // Copy interceptors từ main instance
  instance.interceptors.request = axiosInstance.interceptors.request;
  instance.interceptors.response = axiosInstance.interceptors.response;

  return instance;
};



export default axiosInstance;
export { axiosInstance as apiClient };