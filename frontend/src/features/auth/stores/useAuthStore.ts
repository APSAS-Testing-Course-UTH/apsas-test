import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type {
  AuthState,
  AuthActions,
  AuthStore,
  User,
  AuthResponse
} from '@/types/auth.types';
import { ROLE_PERMISSIONS, ROLE_HIERARCHY } from '@/constants/roles';

// Zustand Auth Store cho APSAS Frontend

/**
 * Custom storage cho auth data
 * Sử dụng localStorage với JSON serialization
 */
// ============= Helper Functions untuk Token Storage =============

/**
 * Menyimpan token ke localStorage
 * @param token - Token untuk disimpan (null untuk dihapus)
 */
const setTokenStorage = (token: string | null | undefined): void => {
  if (typeof window !== 'undefined') {
    if (token) {
      localStorage.setItem('apsas_token', token);
    } else {
      localStorage.removeItem('apsas_token');
    }
  }
};

/**
 * Menghapus token dari localStorage
 */
const removeTokenStorage = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('apsas_token');
  }
};

const authStorage = createJSONStorage<{ user: User | null; token: string | null; isAuthenticated: boolean }>(() => localStorage, {
  replacer: (_key, value) => {
    // Don't persist sensitive data like tokens in some cases
    // For now, we'll persist everything but can be customized later
    return value;
  },
  reviver: (_key, value) => {
    // Parse sang dates and values khác nếu cần
    return value;
  },
});


export const useAuthStore = create<AuthStore>()(
  persist(
    (set, _get) => ({
      // state
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // actions

      /**
       * Login user với auth response
       */
      login: (authResponse: AuthResponse) => {
        const { user, token } = authResponse;

        // Create full user object with computed properties
        const fullUser: User = {
          ...user,
          fullName: `${user.firstName} ${user.lastName}`.trim(),
          displayName: user.lastName || user.email || 'Unknown User',
        };

        // Update state
        set({
          user: fullUser,
          token: token,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });

        // Store token in localStorage using centralized helper
        setTokenStorage(token);
      },

      /**
       * Logout user hiện tại
       */
      logout: () => {
        // Clear state
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });

        // Clear token from localStorage using centralized helper
        removeTokenStorage();

        // Optional: Clear other auth-related data
        // localStorage.removeItem('apsas_refresh_token');
        // sessionStorage.clear();
      },

      /**
       * Cập nhật data user hiện tại
       */
      setUser: (user: User) => {
        set((_state) => ({
          user: {
            ...user,
            fullName: `${user.firstName} ${user.lastName}`.trim(),
            displayName: user.lastName || user.email || 'Unknown User',
          },
        }));
      },

      /**
       * Set trạng thái loading
       */
      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      /**
       * Set lỗi authentication
       */
      setError: (error: string | null) => {
        set({ error, isLoading: false });
      },

      /**
       * Clear lỗi authentication
       */
      clearError: () => {
        set({ error: null });
      },
    }),
    {
     
      // CẤU HÌNH PERSIST

      name: 'apsas-auth-storage', // localStorage key
      storage: authStorage,
      partialize: (state) => ({
        // Chỉ persist các field này
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        // Không persist: isLoading, error (trạng thái tạm thời)
      }),
      // Optional: Thêm version để support migration
      version: 1,
      // Optional: Handle migration giữa các versions
      migrate: (persistedState: unknown, version: number) => {
        if (version === 0) {
          // Migration logic for version 0 to 1
          // Example: transform old state structure to new one
        }
        return persistedState as AuthState;
      },
    }
  )
);;


/**
 * Auth store selectors cho các giá trị thường dùng
 */
export const authSelectors = {
  /**
   * Lấy user hiện tại
   */
  get user(): User | null {
    return useAuthStore.getState().user;
  },

  /**
   * Lấy token hiện tại
   */
  get token(): string | null {
    return useAuthStore.getState().token;
  },

  /**
   * Kiểm tra user đã authenticated
   */
  get isAuthenticated(): boolean {
    return useAuthStore.getState().isAuthenticated;
  },

  /**
   * Kiểm tra auth đang loading
   */
  get isLoading(): boolean {
    return useAuthStore.getState().isLoading;
  },

  /**
   * Lấy error hiện tại
   */
  get error(): string | null {
    return useAuthStore.getState().error;
  },

  /**
   * Lấy role của user
   */
  get userRole(): string | null {
    return useAuthStore.getState().user?.role || null;
  },

  /**
   * Lấy permissions của user (computed từ role)
   */
  get userPermissions() {
    const { user } = useAuthStore.getState();
    if (!user || !user.role) return null;

    return ROLE_PERMISSIONS[user.role];
  },

  /**
   * Kiểm tra user có permission cụ thể
   */
  hasPermission: (permission: string): boolean => {
    const permissions = authSelectors.userPermissions;
    return permissions ? permissions[permission as keyof typeof permissions] : false;
  },

  /**
   * Kiểm tra user có role level cần thiết
   */
  hasRoleLevel: (requiredRole: string): boolean => {
    const { user } = useAuthStore.getState();
    if (!user || !user.role) return false;

    const userLevel = ROLE_HIERARCHY[user.role];
    const requiredLevel = ROLE_HIERARCHY[requiredRole as keyof typeof ROLE_HIERARCHY];

    return userLevel >= requiredLevel;
  },
};


/**
 * Khởi tạo auth state khi app startup
 * 
 * Đồng bộ token từ store vào localStorage nếu cần
 * Kiểm tra tính toàn vẹn của auth state (nếu có token thì phải có user data)
 * 
 * Gọi một lần trong App bootstrap (main.tsx hoặc app.tsx)
 * 
 * @returns {void}
 * 
 * @example
 * // Trong main.tsx hoặc app initialization
 * initializeAuth()
 * createRoot(document.getElementById('root')).render(<App />)
 */
export const initializeAuth = (): void => {
  const { user, token } = useAuthStore.getState();

  // Sync token vào localStorage nếu cần
  if (token) {
    setTokenStorage(token);
  }

  // Validate token khi startup (optional)
  // This could trigger a token refresh or logout if token is invalid
  if (token && !user) {
    // Có token nhưng không có user - có thể state bị corrupt
    console.warn('Auth state corrupted: token exists but no user data');
    // Optionally: validateToken(token).catch(() => useAuthStore.getState().logout());
  }
};

/**
 * Reset auth store về initial state
 * 
 * Xóa toàn bộ auth data từ store và localStorage
 * Hữu dụng cho testing, logout toàn bộ hoặc state recovery
 * 
 * @returns {void}
 * 
 * @example
 * // Trong component logout handler
 * resetAuthStore()
 * navigate({ to: '/login' })
 * 
 * // Hoặc trong test teardown
 * afterEach(() => {
 *   resetAuthStore()
 * })
 */
export const resetAuthStore = (): void => {
  useAuthStore.setState({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
  });

  if (typeof window !== 'undefined') {
    removeTokenStorage();
    localStorage.removeItem('apsas-auth-storage');
  }
};

/**
 * Lấy auth store state synchronously (non-reactive)
 * 
 * Trả về snapshot hiện tại của auth state mà không subscribe vào changes
 * Hữu dụng cho non-React contexts như interceptors, utilities, callbacks
 * 
 * @returns {AuthState} - Snapshot hiện tại của auth state
 *   - user: User | null
 *   - token: string | null
 *   - isAuthenticated: boolean
 *   - isLoading: boolean
 *   - error: string | null
 *
 * @example
 * // Trong interceptor
 * const token = getAuthState().token
 * 
 * // Trong utility function
 * export const hasPermission = (permission: string) => {
 *   return authSelectors.hasPermission(permission)
 * }
 * 
 * // Không dùng trong component React (dùng useAuthStore hook thay thế)
 */
export const getAuthState = (): AuthState => {
  return useAuthStore.getState();
};

/**
 * Subscribe để theo dõi auth state changes (non-reactive)
 * 
 * Cho phép listen vào auth state changes từ contexts bên ngoài React
 * Trả về unsubscribe function để cleanup
 * 
 * @param {Function} callback - Được gọi mỗi khi auth state thay đổi
 * @param {AuthState} callback.state - Snapshot auth state hiện tại
 * @returns {Function} - Unsubscribe function để ngừng listening
 *
 * @example
 * // Trong interceptor setup
 * const unsubscribe = subscribeToAuth((state) => {
 *   if (!state.isAuthenticated) {
 *     // Xóa stored token từ request headers
 *     axiosInstance.defaults.headers.common['Authorization'] = null
 *   } else {
 *     // Set token vào request headers
 *     axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${state.token}`
 *   }
 * })
 * 
 * // Cleanup
 * return () => unsubscribe()
 * 
 * // Không dùng trong component React (dùng useAuthStore hook thay thế)
 */
export const subscribeToAuth = (callback: (state: AuthState) => void) => {
  return useAuthStore.subscribe(callback);
};


export type { AuthState, AuthActions, AuthStore, User, AuthResponse };