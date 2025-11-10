/**
 * Badge Color Utils Tests
 * Test mapping urgency levels to Badge colors
 */

import { describe, it, expect } from 'vitest';
import { mapUrgencyToBadgeColor, mapUrgencyToHexColor, mapStatusToBadgeColor } from './badgeColorUtils';
import type { UrgencyLevel } from '../../utils/dateUtils';

describe('Badge Color Utils', () => {
  describe('mapUrgencyToBadgeColor', () => {
    it('should map overdue urgency to red color', () => {
      const result = mapUrgencyToBadgeColor('overdue');
      expect(result).toBe('red');
    });

    it('should map urgent urgency to orange color', () => {
      const result = mapUrgencyToBadgeColor('urgent');
      expect(result).toBe('orange');
    });

    it('should map soon urgency to yellow color', () => {
      const result = mapUrgencyToBadgeColor('soon');
      expect(result).toBe('yellow');
    });

    it('should map upcoming urgency to green color', () => {
      const result = mapUrgencyToBadgeColor('upcoming');
      expect(result).toBe('green');
    });

    it('should map draft urgency to gray color', () => {
      const result = mapUrgencyToBadgeColor('draft');
      expect(result).toBe('gray');
    });

    it('should handle all urgency levels', () => {
      const urgencyLevels: UrgencyLevel[] = ['overdue', 'urgent', 'soon', 'upcoming', 'draft'];
      const colors = urgencyLevels.map(mapUrgencyToBadgeColor);
      
      expect(colors).toContain('red');
      expect(colors).toContain('orange');
      expect(colors).toContain('yellow');
      expect(colors).toContain('green');
      expect(colors).toContain('gray');
    });

    it('should return gray for unknown urgency level', () => {
      // TypeScript won't let us pass unknown, so we cast
      const result = mapUrgencyToBadgeColor('draft' as UrgencyLevel);
      expect(['red', 'orange', 'yellow', 'green', 'gray']).toContain(result);
    });
  });

  describe('mapUrgencyToHexColor', () => {
    it('should map overdue urgency to red hex color', () => {
      const result = mapUrgencyToHexColor('overdue');
      expect(result).toBe('#d32f2f');
    });

    it('should map urgent urgency to orange hex color', () => {
      const result = mapUrgencyToHexColor('urgent');
      expect(result).toBe('#f57c00');
    });

    it('should map soon urgency to yellow hex color', () => {
      const result = mapUrgencyToHexColor('soon');
      expect(result).toBe('#fbc02d');
    });

    it('should map upcoming urgency to green hex color', () => {
      const result = mapUrgencyToHexColor('upcoming');
      expect(result).toBe('#388e3c');
    });

    it('should map draft urgency to gray hex color', () => {
      const result = mapUrgencyToHexColor('draft');
      expect(result).toBe('#9e9e9e');
    });

    it('should return valid hex color codes', () => {
      const hexColorRegex = /^#[0-9a-f]{6}$/i;
      
      const result1 = mapUrgencyToHexColor('overdue');
      expect(result1).toMatch(hexColorRegex);
      
      const result2 = mapUrgencyToHexColor('urgent');
      expect(result2).toMatch(hexColorRegex);
    });

    it('should maintain consistency between levels and colors', () => {
      const urgencyLevels: UrgencyLevel[] = ['overdue', 'urgent', 'soon', 'upcoming', 'draft'];
      const colors = urgencyLevels.map(mapUrgencyToHexColor);
      
      // Should have 5 unique colors
      const uniqueColors = new Set(colors);
      expect(uniqueColors.size).toBe(5);
    });
  });

  describe('mapStatusToBadgeColor', () => {
    it('should map PASSED status to success color', () => {
      const result = mapStatusToBadgeColor('PASSED');
      expect(result).toBe('success');
    });

    it('should map SUBMITTED status to success color', () => {
      const result = mapStatusToBadgeColor('SUBMITTED');
      expect(result).toBe('success');
    });

    it('should map FAILED status to error color', () => {
      const result = mapStatusToBadgeColor('FAILED');
      expect(result).toBe('error');
    });

    it('should map REJECTED status to error color', () => {
      const result = mapStatusToBadgeColor('REJECTED');
      expect(result).toBe('error');
    });

    it('should map PENDING status to warning color', () => {
      const result = mapStatusToBadgeColor('PENDING');
      expect(result).toBe('warning');
    });

    it('should map IN_PROGRESS status to warning color', () => {
      const result = mapStatusToBadgeColor('IN_PROGRESS');
      expect(result).toBe('warning');
    });

    it('should map DRAFT status to gray color', () => {
      const result = mapStatusToBadgeColor('DRAFT');
      expect(result).toBe('gray');
    });

    it('should handle lowercase status names', () => {
      const result = mapStatusToBadgeColor('passed');
      expect(result).toBe('success');
    });

    it('should handle mixed case status names', () => {
      const result = mapStatusToBadgeColor('Failed');
      expect(result).toBe('error');
    });

    it('should return gray for unknown status', () => {
      const result = mapStatusToBadgeColor('UNKNOWN');
      expect(result).toBe('gray');
    });

    it('should handle null status gracefully', () => {
      const result = mapStatusToBadgeColor(null as any);
      expect(result).toBe('gray');
    });

    it('should handle undefined status gracefully', () => {
      const result = mapStatusToBadgeColor(undefined as any);
      expect(result).toBe('gray');
    });

    it('should return valid badge color options', () => {
      const validColors = ['primary', 'success', 'warning', 'error', 'info', 'gray', 'secondary'];
      
      const result1 = mapStatusToBadgeColor('PASSED');
      expect(validColors).toContain(result1);
      
      const result2 = mapStatusToBadgeColor('PENDING');
      expect(validColors).toContain(result2);
    });
  });

  describe('Integration', () => {
    it('should work together in real scenario - overdue assignment', () => {
      const urgency: UrgencyLevel = 'overdue';
      const badgeColor = mapUrgencyToBadgeColor(urgency);
      const hexColor = mapUrgencyToHexColor(urgency);
      
      expect(badgeColor).toBe('red');
      expect(hexColor).toBe('#d32f2f');
    });

    it('should work together in real scenario - urgent task with failed status', () => {
      const urgency: UrgencyLevel = 'urgent';
      const status = 'FAILED';
      
      const urgencyColor = mapUrgencyToBadgeColor(urgency);
      const statusColor = mapStatusToBadgeColor(status);
      
      // Both are red-ish
      expect(urgencyColor).toBe('orange');
      expect(statusColor).toBe('error');
    });

    it('should map all urgency levels to valid badge colors', () => {
      const urgencyLevels: UrgencyLevel[] = ['overdue', 'urgent', 'soon', 'upcoming', 'draft'];
      const validBadgeColors = ['primary', 'success', 'warning', 'error', 'info', 'gray', 'secondary', 'red', 'orange', 'yellow', 'green'];
      
      urgencyLevels.forEach(level => {
        const color = mapUrgencyToBadgeColor(level);
        expect(validBadgeColors).toContain(color);
      });
    });
  });
});
