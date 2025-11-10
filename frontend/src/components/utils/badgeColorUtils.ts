/**
 * Badge Color Utils
 * Maps urgency levels and status types to Badge colors
 * Used by components that display assignment/submission status
 */

import type { UrgencyLevel } from '@/utils/dateUtils';
import type { BadgeComponentProps } from '../ui/Badge';

/**
 * Maps an urgency level to a Badge color
 * 
 * @param urgency - UrgencyLevel from dateUtils
 * @returns Badge color prop
 * 
 * @example
 * ```tsx
 * const urgency = getUrgencyLevel(startDate, dueDate, status)
 * const badgeColor = mapUrgencyToBadgeColor(urgency)
 * <Badge color={badgeColor} label={getUrgencyLabel(urgency)} />
 * ```
 */
export function mapUrgencyToBadgeColor(
  urgency: UrgencyLevel
): BadgeComponentProps['color'] {
  switch (urgency) {
    case 'overdue':
      return 'red';
    case 'urgent':
      return 'orange';
    case 'soon':
      return 'yellow';
    case 'upcoming':
      return 'green';
    case 'draft':
      return 'gray';
    default:
      return 'gray';
  }
}

/**
 * Alternative function: Map urgency level to hex color code
 * Used if you need direct color values instead of Badge color prop
 * 
 * @param urgency - UrgencyLevel from dateUtils
 * @returns Hex color code
 * 
 * @example
 * ```tsx
 * const color = mapUrgencyToHexColor('urgent')
 * // Returns: '#f57c00'
 * ```
 */
export function mapUrgencyToHexColor(urgency: UrgencyLevel): string {
  switch (urgency) {
    case 'overdue':
      return '#d32f2f'; // Red
    case 'urgent':
      return '#f57c00'; // Orange
    case 'soon':
      return '#fbc02d'; // Yellow
    case 'upcoming':
      return '#388e3c'; // Green
    case 'draft':
      return '#9e9e9e'; // Gray
    default:
      return '#9e9e9e';
  }
}

/**
 * Map submission status to Badge color
 * Used for displaying submission evaluation results
 */
export function mapStatusToBadgeColor(
  status: string
): BadgeComponentProps['color'] {
  switch (status?.toUpperCase()) {
    case 'PASSED':
    case 'SUBMITTED':
      return 'success';
    case 'FAILED':
    case 'REJECTED':
      return 'error';
    case 'PENDING':
    case 'IN_PROGRESS':
      return 'warning';
    case 'DRAFT':
      return 'gray';
    default:
      return 'gray';
  }
}
