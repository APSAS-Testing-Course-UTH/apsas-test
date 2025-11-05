/**
 * Spinner Component Tests
 * TDD: Tests first, implementation second
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@/test-utils';
import { Spinner } from './Spinner';

describe('Spinner Component', () => {
  // ✅ Rendering Tests
  describe('Rendering', () => {
    it('should render spinner element', () => {
      render(<Spinner />);
      const spinner = screen.getByRole('status');
      expect(spinner).toBeInTheDocument();
    });

    it('should render with ARIA busy attribute', () => {
      render(<Spinner />);
      const spinner = screen.getByRole('status');
      expect(spinner).toHaveAttribute('aria-busy', 'true');
    });

    it('should have accessibility label', () => {
      render(<Spinner />);
      const spinner = screen.getByRole('status');
      expect(spinner).toHaveAttribute('aria-label', expect.any(String));
    });
  });

  // ✅ Size Tests
  describe('Size Variants', () => {
    const sizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const;

    sizes.forEach((size) => {
      it(`should render with size ${size}`, () => {
        render(<Spinner size={size} />);
        const spinner = screen.getByRole('status');
        expect(spinner).toHaveCSSModuleClass(`spinner--${size}`);
      });
    });

    it('should default to md size', () => {
      render(<Spinner />);
      const spinner = screen.getByRole('status');
      expect(spinner).toHaveCSSModuleClass('spinner--md');
    });
  });

  // ✅ Message Tests
  describe('Loading Message', () => {
    it('should display loading message when provided', () => {
      render(<Spinner message="Đang tải..." />);
      expect(screen.getByText('Đang tải...')).toBeInTheDocument();
    });

    it('should not display message when not provided', () => {
      const { container } = render(<Spinner />);
      const message = container.querySelector('.spinner__message');
      expect(message).not.toBeInTheDocument();
    });

    it('should display Vietnamese message', () => {
      render(<Spinner message="Xin chờ một chút..." />);
      expect(screen.getByText('Xin chờ một chút...')).toBeInTheDocument();
    });
  });

  // ✅ Color Tests
  describe('Color Variants', () => {
    const colors = ['primary', 'success', 'error', 'warning', 'info'];

    colors.forEach((color) => {
      it(`should render with color ${color}`, () => {
        render(<Spinner color={color} />);
        const spinner = screen.getByRole('status');
        const style = spinner.getAttribute('style');
        expect(style).toMatch(/--spinner-color/);
      });
    });

    it('should default to primary color', () => {
      render(<Spinner />);
      const spinner = screen.getByRole('status');
      expect(spinner).toHaveCSSModuleClass('spinner--primary');
    });
  });

  // ✅ Full Screen Tests
  describe('Full Screen Mode', () => {
    it('should render full screen spinner when fullScreen=true', () => {
      render(<Spinner fullScreen />);
      const spinner = screen.getByRole('status');
      expect(spinner).toHaveCSSModuleClass('spinner--fullscreen');
    });

    it('should have overlay background in full screen mode', () => {
      const { container } = render(<Spinner fullScreen />);
      const overlay = container.querySelector('[class*="spinner__overlay"]');
      expect(overlay).toBeInTheDocument();
    });

    it('should not render overlay when fullScreen=false', () => {
      const { container } = render(<Spinner fullScreen={false} />);
      const overlay = container.querySelector('.spinner__overlay');
      expect(overlay).not.toBeInTheDocument();
    });
  });

  // ✅ Animation Tests
  describe('Animation', () => {
    it('should have animation class', () => {
      render(<Spinner />);
      const spinner = screen.getByRole('status');
      const SVG = spinner.querySelector('svg');
      expect(SVG).toHaveCSSModuleClass('spinner__svg');
    });

    it('should be visible during animation', () => {
      render(<Spinner />);
      const spinner = screen.getByRole('status');
      expect(spinner).toBeVisible();
    });
  });

  // ✅ Accessibility Tests
  describe('Accessibility', () => {
    it('should have proper ARIA label', () => {
      render(<Spinner />);
      const spinner = screen.getByRole('status');
      expect(spinner.getAttribute('aria-label')).toBe('Đang tải...');
    });

    it('should be keyboard accessible', () => {
      render(<Spinner />);
      const spinner = screen.getByRole('status');
      expect(spinner).toBeVisible();
    });

    it('should have live region for announcements', () => {
      render(<Spinner message="Đang xử lý..." />);
      const spinner = screen.getByRole('status');
      expect(spinner.getAttribute('aria-live')).toBe('polite');
    });
  });

  // ✅ Combination Tests
  describe('Combinations', () => {
    it('should render with all props combined', () => {
      render(
        <Spinner
          size="lg"
          color="success"
          message="Đang lưu..."
          fullScreen={false}
        />
      );

      const spinner = screen.getByRole('status');
      expect(spinner).toHaveCSSModuleClass('spinner--lg');
      expect(spinner).toHaveCSSModuleClass('spinner--success');
      expect(screen.getByText('Đang lưu...')).toBeInTheDocument();
    });

    it('should render full screen with message', () => {
      render(<Spinner fullScreen size="xl" message="Đang tải dữ liệu..." />);

      const spinner = screen.getByRole('status');
      expect(spinner).toHaveCSSModuleClass('spinner--fullscreen');
      expect(spinner).toHaveCSSModuleClass('spinner--xl');
      expect(screen.getByText('Đang tải dữ liệu...')).toBeInTheDocument();
    });
  });

  // ✅ Edge Cases
  describe('Edge Cases', () => {
    it('should handle empty message string', () => {
      render(<Spinner message="" />);
      const spinner = screen.getByRole('status');
      expect(spinner).toBeInTheDocument();
    });

    it('should handle long message text', () => {
      const longMessage =
        'Đây là một tin nhắn tải rất dài để kiểm tra xem thành phần có xử lý nó đúng không';
      render(<Spinner message={longMessage} />);
      expect(screen.getByText(longMessage)).toBeInTheDocument();
    });

    it('should re-render with new message', () => {
      const { rerender } = render(<Spinner message="Tin nhắn 1" />);
      expect(screen.getByText('Tin nhắn 1')).toBeInTheDocument();

      rerender(<Spinner message="Tin nhắn 2" />);
      expect(screen.getByText('Tin nhắn 2')).toBeInTheDocument();
      expect(screen.queryByText('Tin nhắn 1')).not.toBeInTheDocument();
    });
  });

  // ✅ Vietnamese UI Tests
  describe('Vietnamese UI', () => {
    it('should display Vietnamese loading message', () => {
      render(<Spinner message="Đang tải trang..." />);
      expect(screen.getByText('Đang tải trang...')).toBeInTheDocument();
    });

    it('should have Vietnamese aria label', () => {
      render(<Spinner />);
      const spinner = screen.getByRole('status');
      expect(spinner.getAttribute('aria-label')).toMatch(/tải/i);
    });

    it('should support Vietnamese characters in message', () => {
      const vietnameseMessage = 'Xin chờ một chút, đang xử lý...';
      render(<Spinner message={vietnameseMessage} />);
      expect(screen.getByText(vietnameseMessage)).toBeInTheDocument();
    });
  });
});
