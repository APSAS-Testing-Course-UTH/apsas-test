// Import and re-export generated types from API
import type {
  IdentityServiceUserResponse,
  IdentityServiceUpdateProfileRequest,
  IdentityServiceChangePasswordRequest,
} from '@/api/types.gen'

// Local type aliases for convenience
export type User = IdentityServiceUserResponse
export type UpdateProfileInput = IdentityServiceUpdateProfileRequest
export type ChangePasswordInput = IdentityServiceChangePasswordRequest

// Vietnamese label mappings for profile fields
export const PROFILE_FIELD_LABELS = {
  firstName: 'Họ',
  lastName: 'Tên',
  email: 'Email',
  role: 'Vai trò',
  isActive: 'Trạng thái hoạt động',
  isEmailVerified: 'Xác thực Email',
  createdAt: 'Ngày tạo',
  updatedAt: 'Ngày cập nhật',
} as const

// Vietnamese role labels
export const ROLE_LABELS: Record<string, string> = {
  ADMIN: 'Quản trị viên',
  LECTURER: 'Giảng viên',
  STUDENT: 'Sinh viên',
  CONTENT_PROVIDER: 'Nhà cung cấp nội dung',
  INSTRUCTOR: 'Giảng viên', // Alternative role name
}

// Profile form values for edit modal
export interface ProfileFormValues {
  firstName: string
  lastName: string
}

// Password form values for change password modal
export interface PasswordFormValues {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

// Button labels
export const BUTTON_LABELS = {
  edit: 'Chỉnh sửa thông tin',
  changePassword: 'Đổi mật khẩu',
  save: 'Lưu',
  cancel: 'Hủy',
  submit: 'Xác nhận',
} as const

// Modal titles
export const MODAL_TITLES = {
  editProfile: 'Cập nhật thông tin',
  changePassword: 'Đổi mật khẩu',
} as const

// Validation error messages in Vietnamese
export const VALIDATION_MESSAGES = {
  firstNameRequired: 'Họ là bắt buộc',
  lastNameRequired: 'Tên là bắt buộc',
  firstNameMaxLength: 'Họ không được quá 100 ký tự',
  lastNameMaxLength: 'Tên không được quá 100 ký tự',
  currentPasswordRequired: 'Mật khẩu hiện tại là bắt buộc',
  newPasswordRequired: 'Mật khẩu mới là bắt buộc',
  newPasswordMinLength: 'Mật khẩu mới phải có ít nhất 8 ký tự',
  confirmPasswordRequired: 'Xác nhận mật khẩu là bắt buộc',
  passwordsDoNotMatch: 'Mật khẩu xác nhận không khớp',
} as const

// Success/error notification messages
export const NOTIFICATION_MESSAGES = {
  updateProfileSuccess: 'Cập nhật thông tin thành công',
  updateProfileError: 'Lỗi khi cập nhật thông tin. Vui lòng thử lại.',
  changePasswordSuccess: 'Đổi mật khẩu thành công',
  changePasswordError: 'Lỗi khi đổi mật khẩu. Vui lòng thử lại.',
  loadProfileError: 'Lỗi khi tải thông tin người dùng',
} as const

// Page title
export const PAGE_TITLE = 'Hồ sơ cá nhân' as const
