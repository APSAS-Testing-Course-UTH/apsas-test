/**
 * Badge Component Tests
 * Testing Badge and StatusBadge components with Vietnamese status labels
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@/test-utils';
import { Badge, StatusBadge } from './Badge';

describe('Badge Component', () => {
  describe('Rendering', () => {
    it('should render badge with Vietnamese label', () => {
      render(<Badge label="Mới" />);
      expect(screen.getByText('Mới')).toBeInTheDocument();
    });

    it('should render badge with children as alternative', () => {
      render(<Badge>Nhãn</Badge>);
      expect(screen.getByText('Nhãn')).toBeInTheDocument();
    });

    it('should render badge with correct role', () => {
      render(<Badge label="Badge" role="status" />);
      const badge = screen.getByText('Badge');
      expect(badge).toHaveAttribute('role', 'status');
    });

    it('should render badge as span by default', () => {
      render(<Badge label="Test" />);
      const badge = screen.getByText('Test');
      expect(badge.tagName.toLowerCase()).toBe('span');
    });
  });

  describe('Colors', () => {
    it('should render badge with default color', () => {
      render(<Badge label="Default" />);
      const badge = screen.getByText('Default');
      expect(badge).toHaveCSSModuleClass('badge');
    });

    it('should render badge with primary color', () => {
      render(<Badge label="Primary" color="primary" />);
      const badge = screen.getByText('Primary');
      expect(badge).toHaveCSSModuleClass('badge-primary');
    });

    it('should render badge with success color', () => {
      render(<Badge label="Success" color="success" />);
      const badge = screen.getByText('Success');
      expect(badge).toHaveCSSModuleClass('badge-success');
    });

    it('should render badge with warning color', () => {
      render(<Badge label="Warning" color="warning" />);
      const badge = screen.getByText('Warning');
      expect(badge).toHaveCSSModuleClass('badge-warning');
    });

    it('should render badge with error color', () => {
      render(<Badge label="Error" color="error" />);
      const badge = screen.getByText('Error');
      expect(badge).toHaveCSSModuleClass('badge-error');
    });

    it('should render badge with info color', () => {
      render(<Badge label="Info" color="info" />);
      const badge = screen.getByText('Info');
      expect(badge).toHaveCSSModuleClass('badge-info');
    });

    it('should render badge with secondary color', () => {
      render(<Badge label="Secondary" color="secondary" />);
      const badge = screen.getByText('Secondary');
      expect(badge).toHaveCSSModuleClass('badge-secondary');
    });
  });

  describe('Variants', () => {
    it('should render badge with solid variant (default)', () => {
      render(<Badge label="Solid" />);
      const badge = screen.getByText('Solid');
      expect(badge).toHaveCSSModuleClass('variant-solid');
    });

    it('should render badge with outline variant', () => {
      render(<Badge label="Outline" variant="outline" />);
      const badge = screen.getByText('Outline');
      expect(badge).toHaveCSSModuleClass('variant-outline');
    });

    it('should render badge with light variant', () => {
      render(<Badge label="Light" variant="light" />);
      const badge = screen.getByText('Light');
      expect(badge).toHaveCSSModuleClass('variant-light');
    });

    it('should render badge with dot variant', () => {
      render(<Badge label="Dot" variant="dot" />);
      const badge = screen.getByText('Dot');
      expect(badge).toHaveCSSModuleClass('variant-dot');
    });
  });

  describe('Sizes', () => {
    it('should render badge with small size', () => {
      render(<Badge label="Small" size="sm" />);
      const badge = screen.getByText('Small');
      expect(badge).toHaveCSSModuleClass('size-sm');
    });

    it('should render badge with medium size', () => {
      render(<Badge label="Medium" size="md" />);
      const badge = screen.getByText('Medium');
      expect(badge).toHaveCSSModuleClass('size-md');
    });

    it('should render badge with large size', () => {
      render(<Badge label="Large" size="lg" />);
      const badge = screen.getByText('Large');
      expect(badge).toHaveCSSModuleClass('size-lg');
    });

    it('should render badge with default size', () => {
      render(<Badge label="Default" />);
      const badge = screen.getByText('Default');
      expect(badge).toHaveCSSModuleClass('size-md');
    });
  });

  describe('Vietnamese Support', () => {
    it('should display Vietnamese badge label correctly', () => {
      render(<Badge label="Đạt" />);
      expect(screen.getByText('Đạt')).toBeInTheDocument();
    });

    it('should display Vietnamese badge with accents', () => {
      render(<Badge label="Không đạt" />);
      expect(screen.getByText('Không đạt')).toBeInTheDocument();
    });

    it('should render Vietnamese labels with special characters', () => {
      render(<Badge label="Quá hạn" />);
      expect(screen.getByText('Quá hạn')).toBeInTheDocument();
    });
  });

  describe('Additional Props', () => {
    it('should apply custom className', () => {
      render(<Badge label="Custom" className="my-badge" />);
      const badge = screen.getByText('Custom');
      expect(badge).toHaveCSSModuleClass('my-badge');
    });

    it('should render with aria-label for accessibility', () => {
      render(<Badge label="Badge" aria-label="Nhãn mới" />);
      const badge = screen.getByText('Badge');
      expect(badge).toHaveAttribute('aria-label', 'Nhãn mới');
    });

    it('should support multiple classes', () => {
      render(<Badge label="Multi" color="success" variant="outline" size="lg" />);
      const badge = screen.getByText('Multi');
      expect(badge).toHaveCSSModuleClass('badge-success');
      expect(badge).toHaveCSSModuleClass('variant-outline');
      expect(badge).toHaveCSSModuleClass('size-lg');
    });
  });
});

describe('StatusBadge Component', () => {
  describe('Rendering', () => {
    it('should render status badge for pending status', () => {
      render(<StatusBadge status="PENDING" />);
      expect(screen.getByText('Chưa làm')).toBeInTheDocument();
    });

    it('should render status badge for submitted status', () => {
      render(<StatusBadge status="SUBMITTED" />);
      expect(screen.getByText('Đã nộp')).toBeInTheDocument();
    });

    it('should render status badge for evaluated status', () => {
      render(<StatusBadge status="EVALUATED" />);
      expect(screen.getByText('Đã chấm')).toBeInTheDocument();
    });

    it('should render status badge for passed status', () => {
      render(<StatusBadge status="PASSED" />);
      expect(screen.getByText('Đạt')).toBeInTheDocument();
    });

    it('should render status badge for failed status', () => {
      render(<StatusBadge status="FAILED" />);
      expect(screen.getByText('Không đạt')).toBeInTheDocument();
    });

    it('should render status badge for overdue status', () => {
      render(<StatusBadge status="OVERDUE" />);
      expect(screen.getByText('Quá hạn')).toBeInTheDocument();
    });

    it('should render status badge for in-progress status', () => {
      render(<StatusBadge status="IN_PROGRESS" />);
      expect(screen.getByText('Đang làm')).toBeInTheDocument();
    });

    it('should render status badge for draft status', () => {
      render(<StatusBadge status="DRAFT" />);
      expect(screen.getByText('Bản nháp')).toBeInTheDocument();
    });

    it('should render status badge for archived status', () => {
      render(<StatusBadge status="ARCHIVED" />);
      expect(screen.getByText('Đã lưu trữ')).toBeInTheDocument();
    });
  });

  describe('Status Colors', () => {
    it('should render pending badge with gray color', () => {
      render(<StatusBadge status="PENDING" />);
      const badge = screen.getByText('Chưa làm');
      expect(badge).toHaveCSSModuleClass('badge-gray');
    });

    it('should render submitted badge with blue color', () => {
      render(<StatusBadge status="SUBMITTED" />);
      const badge = screen.getByText('Đã nộp');
      expect(badge).toHaveCSSModuleClass('badge-blue');
    });

    it('should render evaluated badge with info color', () => {
      render(<StatusBadge status="EVALUATED" />);
      const badge = screen.getByText('Đã chấm');
      expect(badge).toHaveCSSModuleClass('badge-yellow');
    });

    it('should render passed badge with success (green) color', () => {
      render(<StatusBadge status="PASSED" />);
      const badge = screen.getByText('Đạt');
      expect(badge).toHaveCSSModuleClass('badge-green');
    });

    it('should render failed badge with error (red) color', () => {
      render(<StatusBadge status="FAILED" />);
      const badge = screen.getByText('Không đạt');
      expect(badge).toHaveCSSModuleClass('badge-red');
    });

    it('should render overdue badge with warning (orange) color', () => {
      render(<StatusBadge status="OVERDUE" />);
      const badge = screen.getByText('Quá hạn');
      expect(badge).toHaveCSSModuleClass('badge-red');
    });

    it('should render in-progress badge with primary color', () => {
      render(<StatusBadge status="IN_PROGRESS" />);
      const badge = screen.getByText('Đang làm');
      expect(badge).toHaveCSSModuleClass('badge-blue');
    });

    it('should render draft badge with secondary color', () => {
      render(<StatusBadge status="DRAFT" />);
      const badge = screen.getByText('Bản nháp');
      expect(badge).toHaveCSSModuleClass('badge-gray');
    });

    it('should render archived badge with gray color', () => {
      render(<StatusBadge status="ARCHIVED" />);
      const badge = screen.getByText('Đã lưu trữ');
      expect(badge).toHaveCSSModuleClass('badge-gray');
    });
  });

  describe('Size Variants', () => {
    it('should render status badge with small size', () => {
      render(<StatusBadge status="PASSED" size="sm" />);
      const badge = screen.getByText('Đạt');
      expect(badge).toHaveCSSModuleClass('size-sm');
    });

    it('should render status badge with medium size (default)', () => {
      render(<StatusBadge status="PASSED" />);
      const badge = screen.getByText('Đạt');
      expect(badge).toHaveCSSModuleClass('size-md');
    });

    it('should render status badge with large size', () => {
      render(<StatusBadge status="PASSED" size="lg" />);
      const badge = screen.getByText('Đạt');
      expect(badge).toHaveCSSModuleClass('size-lg');
    });
  });

  describe('Variant Support', () => {
    it('should render status badge with solid variant', () => {
      render(<StatusBadge status="PASSED" variant="solid" />);
      const badge = screen.getByText('Đạt');
      expect(badge).toHaveCSSModuleClass('variant-solid');
    });

    it('should render status badge with outline variant', () => {
      render(<StatusBadge status="PASSED" variant="outline" />);
      const badge = screen.getByText('Đạt');
      expect(badge).toHaveCSSModuleClass('variant-outline');
    });

    it('should render status badge with light variant', () => {
      render(<StatusBadge status="PASSED" variant="light" />);
      const badge = screen.getByText('Đạt');
      expect(badge).toHaveCSSModuleClass('variant-light');
    });
  });

  describe('Accessibility', () => {
    it('should include aria-label for screen readers', () => {
      render(<StatusBadge status="PASSED" />);
      const badge = screen.getByText('Đạt');
      expect(badge).toHaveAttribute('role', 'status');
    });

    it('should support custom aria-label override', () => {
      render(<StatusBadge status="PASSED" aria-label="Kết quả đạt" />);
      const badge = screen.getByText('Đạt');
      expect(badge).toHaveAttribute('aria-label', 'Kết quả đạt');
    });
  });

  describe('Vietnamese UI', () => {
    it('should use Vietnamese status labels consistently', () => {
      render(
        <>
          <StatusBadge status="PENDING" />
          <StatusBadge status="PASSED" />
          <StatusBadge status="FAILED" />
        </>
      );

      expect(screen.getByText('Chưa làm')).toBeInTheDocument();
      expect(screen.getByText('Đạt')).toBeInTheDocument();
      expect(screen.getByText('Không đạt')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle unknown status gracefully', () => {
      render(<StatusBadge status="UNKNOWN" />);
      // Should render something, even if status is unknown
      const badge = document.querySelector('[role="status"]');
      expect(badge).toBeInTheDocument();
    });

    it('should render multiple status badges without conflict', () => {
      render(
        <>
          <StatusBadge status="PASSED" />
          <StatusBadge status="FAILED" />
          <StatusBadge status="PENDING" />
        </>
      );

      expect(screen.getByText('Đạt')).toBeInTheDocument();
      expect(screen.getByText('Không đạt')).toBeInTheDocument();
      expect(screen.getByText('Chưa làm')).toBeInTheDocument();
    });
  });

  describe('Integration with Dashboard', () => {
    it('should display assignment status correctly', () => {
      render(
        <div>
          <h3>Bài toán: Fibonacci</h3>
          <StatusBadge status="PASSED" />
        </div>
      );

      expect(screen.getByText('Bài toán: Fibonacci')).toBeInTheDocument();
      expect(screen.getByText('Đạt')).toBeInTheDocument();
    });

    it('should display multiple status in a list', () => {
      render(
        <ul>
          <li>
            Bài tập 1 <StatusBadge status="PASSED" />
          </li>
          <li>
            Bài tập 2 <StatusBadge status="FAILED" />
          </li>
          <li>
            Bài tập 3 <StatusBadge status="PENDING" />
          </li>
        </ul>
      );

      expect(screen.getByText('Đạt')).toBeInTheDocument();
      expect(screen.getByText('Không đạt')).toBeInTheDocument();
      expect(screen.getByText('Chưa làm')).toBeInTheDocument();
    });
  });
});

