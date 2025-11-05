/**
 * Vietnamese Navigation Constants
 * APSAS Student Portal - Navigation labels and routes
 */

import {
  IconDashboard,
  IconBook,
  IconFileUpload,
  IconChartBar,
  IconHelp,
  IconBookmark,
  type Icon,
} from '@tabler/icons-react';

export interface NavItem {
  label: string; // Vietnamese label
  href: string; // Route path
  icon: Icon; // Tabler icon component
}

/**
 * Student Portal Navigation Items
 * All labels in Vietnamese (ENFORCED)
 */
export const STUDENT_NAV_ITEMS: NavItem[] = [
  {
    label: 'Bảng điều khiển', // Dashboard
    href: '/student',
    icon: IconDashboard,
  },
  {
    label: 'Bài tập', // Assignments
    href: '/student/assignments',
    icon: IconBook,
  },
  {
    label: 'Bài nộp', // Submissions
    href: '/student/submissions',
    icon: IconFileUpload,
  },
  {
    label: 'Hiệu suất', // Performance
    href: '/student/performance',
    icon: IconChartBar,
  },
  {
    label: 'Tài liệu', // Resources
    href: '/student/resources',
    icon: IconBookmark,
  },
  {
    label: 'Hỗ trợ', // Support
    href: '/student/support',
    icon: IconHelp,
  },
];

/**
 * Brand Configuration
 */
export const BRAND_CONFIG = {
  name: 'Student Portal',
  shortName: 'APSAS',
  logoutLabel: 'Đăng xuất', // Logout
};
