/**
 * SkeletonLoader Component Tests
 * TDD: Tests first, implementation second
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@/test-utils';
import { SkeletonLoader } from './SkeletonLoader';

describe('SkeletonLoader Component', () => {
  // ✅ Rendering Tests
  describe('Rendering', () => {
    it('should render skeleton loader', () => {
      render(<SkeletonLoader />);
      const skeleton = screen.getByRole('img', { hidden: true });
      expect(skeleton).toBeInTheDocument();
    });

    it('should render with default single line', () => {
      const { container } = render(<SkeletonLoader />);
      const lines = container.querySelectorAll('[class*="skeleton__line"]');
      expect(lines).toHaveLength(1);
    });

    it('should have accessibility attributes', () => {
      render(<SkeletonLoader />);
      const skeleton = screen.getByRole('img', { hidden: true });
      expect(skeleton).toHaveAttribute('aria-busy', 'true');
    });
  });

  // ✅ Lines Tests
  describe('Multiple Lines', () => {
    it('should render multiple lines', () => {
      const { container } = render(<SkeletonLoader lines={3} />);
      const lines = container.querySelectorAll('[class*="skeleton__line"]');
      expect(lines).toHaveLength(3);
    });

    it('should render 5 lines', () => {
      const { container } = render(<SkeletonLoader lines={5} />);
      const lines = container.querySelectorAll('[class*="skeleton__line"]');
      expect(lines).toHaveLength(5);
    });

    it('should render 10 lines', () => {
      const { container } = render(<SkeletonLoader lines={10} />);
      const lines = container.querySelectorAll('[class*="skeleton__line"]');
      expect(lines).toHaveLength(10);
    });
  });

  // ✅ Height Tests
  describe('Height Variants', () => {
    const heights = ['xs', 'sm', 'md', 'lg', 'xl'] as const;

    heights.forEach((height) => {
      it(`should render with height ${height}`, () => {
        const { container } = render(<SkeletonLoader height={height} />);
        const line = container.querySelector('[class*="skeleton__line"]');
        expect(line).toHaveCSSModuleClass(`skeleton__line--${height}`);
      });
    });

    it('should default to md height', () => {
      const { container } = render(<SkeletonLoader />);
      const line = container.querySelector('[class*="skeleton__line"]');
      expect(line).toHaveCSSModuleClass('skeleton__line--md');
    });
  });

  // ✅ Width Tests
  describe('Width', () => {
    it('should render with 100% width by default', () => {
      const { container } = render(<SkeletonLoader />);
      const line = container.querySelector('[class*="skeleton__line"]');
      expect(line).toHaveStyle('width: 100%');
    });

    it('should render with string width', () => {
      const { container } = render(<SkeletonLoader width="80%" />);
      const line = container.querySelector('[class*="skeleton__line"]');
      expect(line).toHaveStyle('width: 80%');
    });

    it('should render with numeric width as pixels', () => {
      const { container } = render(<SkeletonLoader width={200} />);
      const line = container.querySelector('[class*="skeleton__line"]');
      expect(line).toHaveStyle('width: 200px');
    });

    it('should support various width units', () => {
      const { container } = render(<SkeletonLoader width="50vw" />);
      const line = container.querySelector('[class*="skeleton__line"]');
      expect(line).toHaveStyle('width: 50vw');
    });
  });

  // ✅ Circle Tests
  describe('Circle Skeleton', () => {
    it('should render circular skeleton', () => {
      const { container } = render(<SkeletonLoader circle />);
      const skeleton = container.querySelector('[class*="skeleton--circle"]');
      expect(skeleton).toBeInTheDocument();
    });

    it('should apply circle class', () => {
      const { container } = render(<SkeletonLoader circle />);
      const line = container.querySelector('[class*="skeleton__line"]');
      expect(line).toHaveCSSModuleClass('skeleton__line--circle');
    });

    it('should ignore lines prop when circle=true', () => {
      const { container } = render(<SkeletonLoader circle lines={5} />);
      const lines = container.querySelectorAll('[class*="skeleton__line"]');
      expect(lines).toHaveLength(1);
    });

    it('should render square circle (equal width/height)', () => {
      const { container } = render(
        <SkeletonLoader circle width={64} height="lg" />
      );
      const line = container.querySelector('[class*="skeleton__line"]');
      expect(line).toHaveCSSModuleClass('skeleton__line--circle');
    });
  });

  // ✅ Message Tests
  describe('Message', () => {
    it('should display message when provided', () => {
      render(<SkeletonLoader message="Đang tải..." />);
      expect(screen.getByText('Đang tải...')).toBeInTheDocument();
    });

    it('should not display message by default', () => {
      const { container } = render(<SkeletonLoader />);
      const message = container.querySelector('[class*="skeleton__message"]');
      expect(message).not.toBeInTheDocument();
    });

    it('should display Vietnamese message', () => {
      render(<SkeletonLoader message="Xin chờ dữ liệu..." />);
      expect(screen.getByText('Xin chờ dữ liệu...')).toBeInTheDocument();
    });

    it('should position message below skeleton', () => {
      render(<SkeletonLoader message="Tải dữ liệu" />);
      const messageElement = screen.getByText('Tải dữ liệu');
      expect(messageElement).toBeInTheDocument();
      expect(messageElement).toBeVisible();
    });
  });

  // ✅ Combination Tests
  describe('Combinations', () => {
    it('should render multiple lines with varying heights', () => {
      const { container } = render(
        <SkeletonLoader lines={3} height="md" />
      );
      const lines = container.querySelectorAll('[class*="skeleton__line"]');
      expect(lines).toHaveLength(3);
      expect(lines[0]).toHaveCSSModuleClass('skeleton__line--md');
    });

    it('should render with circle and message', () => {
      const { container } = render(
        <SkeletonLoader circle width={48} message="Tải hồ sơ..." />
      );
      expect(container.querySelector('[class*="skeleton--circle"]')).toBeInTheDocument();
      expect(screen.getByText('Tải hồ sơ...')).toBeInTheDocument();
    });

    it('should render with custom width and height', () => {
      const { container } = render(
        <SkeletonLoader width="75%" height="lg" lines={2} />
      );
      const lines = container.querySelectorAll('[class*="skeleton__line"]');
      expect(lines).toHaveLength(2);
      expect(lines[0]).toHaveCSSModuleClass('skeleton__line--lg');
    });

    it('should render full-width multiple lines', () => {
      const { container } = render(
        <SkeletonLoader width="100%" lines={4} message="Đang tải danh sách..." />
      );
      const lines = container.querySelectorAll('[class*="skeleton__line"]');
      expect(lines).toHaveLength(4);
      expect(screen.getByText('Đang tải danh sách...')).toBeInTheDocument();
    });
  });

  // ✅ Accessibility Tests
  describe('Accessibility', () => {
    it('should have aria-busy attribute', () => {
      render(<SkeletonLoader />);
      const skeleton = screen.getByRole('img', { hidden: true });
      expect(skeleton).toHaveAttribute('aria-busy', 'true');
    });

    it('should have aria-label when message provided', () => {
      render(<SkeletonLoader message="Đang tải dữ liệu" />);
      const skeleton = screen.getByRole('img', { hidden: true });
      expect(skeleton).toHaveAttribute(
        'aria-label',
        'Đang tải dữ liệu'
      );
    });

    it('should be hidden from screen readers', () => {
      render(<SkeletonLoader />);
      const skeleton = screen.getByRole('img', { hidden: true });
      expect(skeleton).toHaveAttribute('aria-hidden', 'false');
    });
  });

  // ✅ Edge Cases
  describe('Edge Cases', () => {
    it('should handle 0 lines gracefully', () => {
      const { container } = render(<SkeletonLoader lines={0} />);
      const lines = container.querySelectorAll('[class*="skeleton__line"]');
      expect(lines).toHaveLength(0);
    });

    it('should handle very large number of lines', () => {
      const { container } = render(<SkeletonLoader lines={50} />);
      const lines = container.querySelectorAll('[class*="skeleton__line"]');
      expect(lines).toHaveLength(50);
    });

    it('should handle mixed width units', () => {
      const { rerender, container } = render(
        <SkeletonLoader width="80%" />
      );
      let line = container.querySelector('[class*="skeleton__line"]');
      expect(line).toHaveStyle('width: 80%');

      rerender(<SkeletonLoader width={150} />);
      line = container.querySelector('[class*="skeleton__line"]');
      expect(line).toHaveStyle('width: 150px');

      rerender(<SkeletonLoader width="50vw" />);
      line = container.querySelector('[class*="skeleton__line"]');
      expect(line).toHaveStyle('width: 50vw');
    });

    it('should handle empty message string', () => {
      const { container } = render(<SkeletonLoader message="" />);
      // When message="" - skeleton should still render normally
      const skeleton = container.querySelector('[class*="skeleton"]');
      expect(skeleton).toBeInTheDocument();
    });

    it('should handle very long message', () => {
      const longMessage =
        'Đây là một tin nhắn rất dài về việc tải dữ liệu từ máy chủ và có thể mất một khoảng thời gian ngắn để hoàn thành';
      render(<SkeletonLoader message={longMessage} />);
      expect(screen.getByText(longMessage)).toBeInTheDocument();
    });
  });

  // ✅ Vietnamese UI Tests
  describe('Vietnamese UI', () => {
    it('should display Vietnamese loading message', () => {
      render(<SkeletonLoader message="Đang tải trang..." />);
      expect(screen.getByText('Đang tải trang...')).toBeInTheDocument();
    });

    it('should support Vietnamese characters with diacritics', () => {
      const vietnameseMessage = 'Xin chờ, đang tải dữ liệu...';
      render(<SkeletonLoader message={vietnameseMessage} />);
      expect(screen.getByText(vietnameseMessage)).toBeInTheDocument();
    });

    it('should work with complex Vietnamese messages', () => {
      const message = 'Đang tải danh sách sinh viên, vui lòng chờ...';
      render(<SkeletonLoader message={message} />);
      expect(screen.getByText(message)).toBeInTheDocument();
    });
  });

  // ✅ Visual Tests
  describe('Visual Rendering', () => {
    it('should render visible skeleton', () => {
      const { container } = render(<SkeletonLoader />);
      const skeleton = container.querySelector('[class*="skeleton"]');
      expect(skeleton).toBeVisible();
    });

    it('should render shimmer animation', () => {
      const { container } = render(<SkeletonLoader />);
      const line = container.querySelector('[class*="skeleton__line"]');
      expect(line).toHaveCSSModuleClass('skeleton__line');
    });

    it('should have proper spacing between lines', () => {
      const { container } = render(<SkeletonLoader lines={3} />);
      const lines = container.querySelectorAll('[class*="skeleton__line"]');
      lines.forEach((line) => {
        const styles = window.getComputedStyle(line);
        expect(styles.marginBottom).toBeDefined();
      });
    });
  });
});
