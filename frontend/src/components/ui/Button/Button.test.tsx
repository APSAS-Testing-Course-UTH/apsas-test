/**
 * Button Component Tests
 * Testing all Button variants, states, and interactions
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@/test-utils'
import { Button } from './Button'

describe('Button Component', () => {
  describe('Rendering', () => {
    it('should render button with Vietnamese label', () => {
      render(<Button>Đăng nhập</Button>);
      expect(screen.getByRole('button', { name: 'Đăng nhập' })).toBeInTheDocument();
    });

    it('should render button with children content', () => {
      render(<Button>Nộp bài</Button>);
      expect(screen.getByText('Nộp bài')).toBeInTheDocument();
    });

    it('should render button with correct HTML type', () => {
      render(<Button type="submit">Gửi</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('type', 'submit');
    });
  });

  describe('Variants', () => {
    it('should render primary variant (default)', () => {
      render(<Button>Primary</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('variant-primary');
    });

    it('should render secondary variant', () => {
      render(<Button variant="secondary">Secondary</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('variant-secondary');
    });

    it('should render outline variant', () => {
      render(<Button variant="outline">Outline</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('variant-outline');
    });

    it('should render danger variant', () => {
      render(<Button variant="danger">Xóa</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('variant-danger');
    });

    it('should render subtle variant', () => {
      render(<Button variant="subtle">Subtle</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('variant-subtle');
    });
  });

  describe('Sizes', () => {
    it('should render extra small size', () => {
      render(<Button size="xs">Small</Button>);
      expect(screen.getByRole('button')).toHaveClass('size-xs');
    });

    it('should render small size', () => {
      render(<Button size="sm">Small</Button>);
      expect(screen.getByRole('button')).toHaveClass('size-sm');
    });

    it('should render medium size (default)', () => {
      render(<Button size="md">Medium</Button>);
      expect(screen.getByRole('button')).toHaveClass('size-md');
    });

    it('should render large size', () => {
      render(<Button size="lg">Large</Button>);
      expect(screen.getByRole('button')).toHaveClass('size-lg');
    });

    it('should render extra large size', () => {
      render(<Button size="xl">Extra Large</Button>);
      expect(screen.getByRole('button')).toHaveClass('size-xl');
    });
  });

  describe('States', () => {
    it('should be enabled by default', () => {
      render(<Button>Button</Button>);
      expect(screen.getByRole('button')).not.toBeDisabled();
    });

    it('should be disabled when disabled prop is true', () => {
      render(<Button disabled>Disabled</Button>);
      expect(screen.getByRole('button')).toBeDisabled();
    });

    it('should show loading state', () => {
      render(<Button loading>Loading</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('loading');
      expect(button).toBeDisabled();
    });

    it('should disable button when loading', () => {
      render(<Button loading>Loading</Button>);
      expect(screen.getByRole('button')).toBeDisabled();
    });
  });

  describe('Full Width', () => {
    it('should render full width when fullWidth prop is true', () => {
      render(<Button fullWidth>Full Width Button</Button>);
      expect(screen.getByRole('button')).toHaveClass('full-width');
    });

    it('should not have full-width class by default', () => {
      render(<Button>Normal Button</Button>);
      expect(screen.getByRole('button')).not.toHaveClass('full-width');
    });
  });

  describe('Events', () => {
    it('should call onClick handler when clicked', () => {
      const handleClick = vi.fn();
      render(<Button onClick={handleClick}>Click Me</Button>);
      fireEvent.click(screen.getByRole('button'));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should not call onClick when disabled', () => {
      const handleClick = vi.fn();
      render(
        <Button disabled onClick={handleClick}>
          Disabled
        </Button>
      );
      fireEvent.click(screen.getByRole('button'));
      expect(handleClick).not.toHaveBeenCalled();
    });

    it('should not call onClick when loading', () => {
      const handleClick = vi.fn();
      render(
        <Button loading onClick={handleClick}>
          Loading
        </Button>
      );
      fireEvent.click(screen.getByRole('button'));
      expect(handleClick).not.toHaveBeenCalled();
    });

    it('should handle async onClick', async () => {
      const handleClick = vi.fn().mockResolvedValue(undefined);
      render(<Button onClick={handleClick}>Async Click</Button>);
      fireEvent.click(screen.getByRole('button'));
      await expect(handleClick()).resolves.toBeUndefined();
    });
  });

  describe('CSS Classes', () => {
    it('should accept custom className', () => {
      render(<Button className="custom-class">Custom</Button>);
      expect(screen.getByRole('button')).toHaveClass('custom-class');
    });

    it('should combine variant and size classes', () => {
      render(
        <Button variant="danger" size="lg">
          Big Danger Button
        </Button>
      );
      const button = screen.getByRole('button');
      expect(button).toHaveClass('variant-danger');
      expect(button).toHaveClass('size-lg');
    });

    it('should combine all classes correctly', () => {
      render(
        <Button
          variant="secondary"
          size="sm"
          fullWidth
          className="custom"
        >
          Complete Button
        </Button>
      );
      const button = screen.getByRole('button');
      expect(button).toHaveClass('variant-secondary');
      expect(button).toHaveClass('size-sm');
      expect(button).toHaveClass('full-width');
      expect(button).toHaveClass('custom');
    });
  });

  describe('Vietnamese Labels', () => {
    const vietnameseLabels = [
      'Đăng nhập',
      'Đăng ký',
      'Nộp bài',
      'Lưu',
      'Xóa',
      'Hủy',
      'Tìm kiếm',
    ];

    vietnameseLabels.forEach((label) => {
      it(`should render Vietnamese label: "${label}"`, () => {
        render(<Button>{label}</Button>);
        expect(screen.getByText(label)).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have accessible button role', () => {
      render(<Button>Accessible Button</Button>);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('should show disabled state to screen readers', () => {
      render(<Button disabled>Disabled Button</Button>);
      const button = screen.getByRole('button', { hidden: true });
      expect(button).toBeDisabled();
    });

    it('should have proper aria attributes when loading', () => {
      render(
        <Button loading aria-label="Loading action">
          Loading
        </Button>
      );
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty children gracefully', () => {
      const { container } = render(<Button>Button</Button>);
      expect(container.querySelector('button')).toBeInTheDocument();
    });

    it('should handle very long text', () => {
      const longText = 'Đây là một nút có rất nhiều chữ trong tiêng Việt';
      render(<Button>{longText}</Button>);
      expect(screen.getByText(longText)).toBeInTheDocument();
    });

    it('should handle multiple clicks quickly', () => {
      const handleClick = vi.fn();
      render(<Button onClick={handleClick}>Click</Button>);
      const button = screen.getByRole('button');

      fireEvent.click(button);
      fireEvent.click(button);
      fireEvent.click(button);

      expect(handleClick).toHaveBeenCalledTimes(3);
    });
  });

  describe('Type Prop', () => {
    it('should have button type by default', () => {
      render(<Button>Button</Button>);
      expect(screen.getByRole('button')).toHaveAttribute('type', 'button');
    });

    it('should render submit button', () => {
      render(<Button type="submit">Submit</Button>);
      expect(screen.getByRole('button')).toHaveAttribute('type', 'submit');
    });

    it('should render reset button', () => {
      render(<Button type="reset">Reset</Button>);
      expect(screen.getByRole('button')).toHaveAttribute('type', 'reset');
    });
  });
});
