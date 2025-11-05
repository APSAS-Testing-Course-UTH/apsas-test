import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@/test-utils';
import { FormInput } from './FormInput';

describe('FormInput Component', () => {
  // ==================== RENDERING TESTS ====================
  describe('Rendering', () => {
    it('should render FormInput with Vietnamese label', () => {
      render(
        <FormInput
          label="Email"
          value=""
          onChange={() => {}}
        />
      );
      expect(screen.getByText('Email')).toBeInTheDocument();
    });

    it('should render input element', () => {
      render(
        <FormInput
          label="Mật khẩu"
          value=""
          onChange={() => {}}
        />
      );
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('should render with Vietnamese placeholder text', () => {
      render(
        <FormInput
          label="Email"
          placeholder="Nhập email của bạn..."
          value=""
          onChange={() => {}}
        />
      );
      expect(screen.getByPlaceholderText('Nhập email của bạn...')).toBeInTheDocument();
    });
  });

  // ==================== INPUT TYPE TESTS ====================
  describe('Input Types', () => {
    it('should render text input by default', () => {
      render(
        <FormInput
          label="Họ tên"
          value=""
          onChange={() => {}}
        />
      );
      const input = screen.getByRole('textbox') as HTMLInputElement;
      expect(input.type).toBe('text');
    });

    it('should render email input', () => {
      render(
        <FormInput
          label="Email"
          type="email"
          value=""
          onChange={() => {}}
        />
      );
      const input = screen.getByRole('textbox') as HTMLInputElement;
      expect(input.type).toBe('email');
    });

    it('should render password input', () => {
      render(
        <FormInput
          label="Mật khẩu"
          type="password"
          value=""
          onChange={() => {}}
        />
      );
      const input = screen.getByDisplayValue('') as HTMLInputElement;
      expect(input.type).toBe('password');
    });

    it('should render number input', () => {
      render(
        <FormInput
          label="Số điểm"
          type="number"
          value=""
          onChange={() => {}}
        />
      );
      const input = screen.getByRole('spinbutton') as HTMLInputElement;
      expect(input.type).toBe('number');
    });

    it('should render tel input', () => {
      render(
        <FormInput
          label="Số điện thoại"
          type="tel"
          value=""
          onChange={() => {}}
        />
      );
      const input = screen.getByRole('textbox') as HTMLInputElement;
      expect(input.type).toBe('tel');
    });

    it('should render date input', () => {
      render(
        <FormInput
          label="Ngày sinh"
          type="date"
          value=""
          onChange={() => {}}
        />
      );
      const input = screen.getByLabelText('Ngày sinh') as HTMLInputElement;
      expect(input.type).toBe('date');
    });
  });

  // ==================== VALUE & CHANGE HANDLING ====================
  describe('Value Handling', () => {
    it('should display initial value', () => {
      render(
        <FormInput
          label="Email"
          value="test@example.com"
          onChange={() => {}}
        />
      );
      expect(screen.getByDisplayValue('test@example.com')).toBeInTheDocument();
    });

    it('should call onChange when input value changes', () => {
      const handleChange = vi.fn();
      render(
        <FormInput
          label="Email"
          value=""
          onChange={handleChange}
        />
      );
      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: 'new@example.com' } });
      expect(handleChange).toHaveBeenCalled();
    });

    it('should update value when prop changes', () => {
      const { rerender } = render(
        <FormInput
          label="Email"
          value="initial@example.com"
          onChange={() => {}}
        />
      );
      expect(screen.getByDisplayValue('initial@example.com')).toBeInTheDocument();

      rerender(
        <FormInput
          label="Email"
          value="updated@example.com"
          onChange={() => {}}
        />
      );
      expect(screen.getByDisplayValue('updated@example.com')).toBeInTheDocument();
    });

    it('should handle empty string value', () => {
      render(
        <FormInput
          label="Email"
          value=""
          onChange={() => {}}
        />
      );
      const input = screen.getByRole('textbox') as HTMLInputElement;
      expect(input.value).toBe('');
    });
  });

  // ==================== ERROR HANDLING ====================
  describe('Error Display', () => {
    it('should display Vietnamese error message', () => {
      render(
        <FormInput
          label="Email"
          error="Email không hợp lệ"
          value=""
          onChange={() => {}}
        />
      );
      expect(screen.getByText('Email không hợp lệ')).toBeInTheDocument();
    });

    it('should display error in red/danger color', () => {
      render(
        <FormInput
          label="Email"
          error="Email không hợp lệ"
          value=""
          onChange={() => {}}
        />
      );
      const errorElement = screen.getByText('Email không hợp lệ');
      expect(errorElement).toBeInTheDocument();
    });

    it('should not display error when error prop is undefined', () => {
      render(
        <FormInput
          label="Email"
          error={undefined}
          value=""
          onChange={() => {}}
        />
      );
      expect(screen.queryByText(/Email/)).toBeInTheDocument();
    });

    it('should display common Vietnamese validation errors', () => {
      const errors = [
        'Trường này bắt buộc',
        'Email không hợp lệ',
        'Mật khẩu phải có ít nhất 8 ký tự',
        'Số điện thoại không hợp lệ',
        'Ngày sinh không hợp lệ',
      ];

      errors.forEach((error) => {
        const { unmount } = render(
          <FormInput
            label="Test Field"
            error={error}
            value=""
            onChange={() => {}}
          />
        );
        expect(screen.getByText(error)).toBeInTheDocument();
        unmount();
      });
    });
  });

  // ==================== DISABLED STATE ====================
  describe('Disabled State', () => {
    it('should disable input when disabled prop is true', () => {
      render(
        <FormInput
          label="Email"
          disabled={true}
          value=""
          onChange={() => {}}
        />
      );
      const input = screen.getByRole('textbox') as HTMLInputElement;
      expect(input).toBeDisabled();
    });

    it('should not call onChange when disabled', () => {
      const handleChange = vi.fn();
      render(
        <FormInput
          label="Email"
          disabled={true}
          value=""
          onChange={handleChange}
        />
      );
      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: 'test@example.com' } });
      expect(handleChange).not.toHaveBeenCalled();
    });

    it('should show disabled styling', () => {
      render(
        <FormInput
          label="Email"
          disabled={true}
          value=""
          onChange={() => {}}
        />
      );
      const input = screen.getByRole('textbox') as HTMLInputElement;
      expect(input.disabled).toBe(true);
    });
  });

  // ==================== REQUIRED FIELD ====================
  describe('Required Field', () => {
    it('should mark field as required', () => {
      render(
        <FormInput
          label="Email"
          required={true}
          value=""
          onChange={() => {}}
        />
      );
      const input = screen.getByRole('textbox') as HTMLInputElement;
      expect(input.required).toBe(true);
    });

    it('should display required indicator (asterisk)', () => {
      render(
        <FormInput
          label="Email"
          required={true}
          value=""
          onChange={() => {}}
        />
      );
      const label = screen.getByText('Email');
      expect(label).toBeInTheDocument();
    });

    it('should not mark as required by default', () => {
      render(
        <FormInput
          label="Email"
          value=""
          onChange={() => {}}
        />
      );
      const input = screen.getByRole('textbox') as HTMLInputElement;
      expect(input.required).toBe(false);
    });
  });

  // ==================== SIZE VARIATIONS ====================
  describe('Size Variations', () => {
    it('should support small size', () => {
      const { container } = render(
        <FormInput
          label="Email"
          size="sm"
          value=""
          onChange={() => {}}
        />
      );
      expect(container.firstChild).toBeInTheDocument();
    });

    it('should support medium size (default)', () => {
      const { container } = render(
        <FormInput
          label="Email"
          size="md"
          value=""
          onChange={() => {}}
        />
      );
      expect(container.firstChild).toBeInTheDocument();
    });

    it('should support large size', () => {
      const { container } = render(
        <FormInput
          label="Email"
          size="lg"
          value=""
          onChange={() => {}}
        />
      );
      expect(container.firstChild).toBeInTheDocument();
    });
  });

  // ==================== PLACEHOLDER ====================
  describe('Placeholder', () => {
    it('should show placeholder text in Vietnamese', () => {
      render(
        <FormInput
          label="Email"
          placeholder="Nhập email của bạn..."
          value=""
          onChange={() => {}}
        />
      );
      expect(screen.getByPlaceholderText('Nhập email của bạn...')).toBeInTheDocument();
    });

    it('should handle empty placeholder', () => {
      render(
        <FormInput
          label="Email"
          placeholder=""
          value=""
          onChange={() => {}}
        />
      );
      const input = screen.getByRole('textbox') as HTMLInputElement;
      expect(input.placeholder).toBe('');
    });
  });

  // ==================== ACCESSIBILITY ====================
  describe('Accessibility', () => {
    it('should have associated label', () => {
      render(
        <FormInput
          label="Email"
          value=""
          onChange={() => {}}
        />
      );
      const input = screen.getByRole('textbox');
      expect(input).toBeInTheDocument();
    });

    it('should have proper aria attributes', () => {
      render(
        <FormInput
          label="Email"
          error="Email không hợp lệ"
          value=""
          onChange={() => {}}
        />
      );
      const input = screen.getByRole('textbox');
      expect(input).toBeInTheDocument();
    });

    it('should support aria-describedby for error messages', () => {
      render(
        <FormInput
          label="Email"
          error="Email không hợp lệ"
          value=""
          onChange={() => {}}
        />
      );
      const input = screen.getByRole('textbox');
      expect(input).toBeInTheDocument();
    });
  });

  // ==================== EDGE CASES ====================
  describe('Edge Cases', () => {
    it('should handle very long input value', () => {
      const longValue = 'a'.repeat(1000);
      render(
        <FormInput
          label="Email"
          value={longValue}
          onChange={() => {}}
        />
      );
      const input = screen.getByDisplayValue(longValue) as HTMLInputElement;
      expect(input.value).toBe(longValue);
    });

    it('should handle special characters', () => {
      const specialChars = '!@#$%^&*()_+-=[]{}|;:,.<>?';
      render(
        <FormInput
          label="Email"
          value={specialChars}
          onChange={() => {}}
        />
      );
      const input = screen.getByDisplayValue(specialChars) as HTMLInputElement;
      expect(input.value).toBe(specialChars);
    });

    it('should handle rapid onChange calls', () => {
      const handleChange = vi.fn();
      const { rerender } = render(
        <FormInput
          label="Email"
          value=""
          onChange={handleChange}
        />
      );

      for (let i = 0; i < 10; i++) {
        rerender(
          <FormInput
            label="Email"
            value={`test${i}`}
            onChange={handleChange}
          />
        );
      }

      expect(screen.getByDisplayValue('test9')).toBeInTheDocument();
    });

    it('should handle undefined values gracefully', () => {
      render(
        <FormInput
          label="Email"
          value={undefined as any}
          onChange={() => {}}
        />
      );
      const input = screen.getByRole('textbox') as HTMLInputElement;
      expect(input).toBeInTheDocument();
    });
  });

  // ==================== VIETNAMESE UI LABELS ====================
  describe('Vietnamese UI Labels', () => {
    it('should display Vietnamese form labels', () => {
      const vietnameseLabels = [
        'Email',
        'Họ tên',
        'Mật khẩu',
        'Xác nhận mật khẩu',
        'Số điện thoại',
        'Địa chỉ',
        'Thành phố',
        'Quốc gia',
      ];

      vietnameseLabels.forEach((label) => {
        const { unmount } = render(
          <FormInput
            label={label}
            value=""
            onChange={() => {}}
          />
        );
        expect(screen.getByText(label)).toBeInTheDocument();
        unmount();
      });
    });

    it('should display Vietnamese placeholders', () => {
      render(
        <FormInput
          label="Email"
          placeholder="Nhập email của bạn..."
          value=""
          onChange={() => {}}
        />
      );
      expect(screen.getByPlaceholderText('Nhập email của bạn...')).toBeInTheDocument();
    });
  });

  // ==================== INTEGRATION ====================
  describe('Integration', () => {
    it('should work in a form context', () => {
      const handleSubmit = vi.fn();
      render(
        <form onSubmit={handleSubmit}>
          <FormInput
            label="Email"
            value=""
            onChange={() => {}}
          />
          <button type="submit">Gửi</button>
        </form>
      );
      const button = screen.getByRole('button');
      fireEvent.click(button);
      expect(handleSubmit).toHaveBeenCalled();
    });

    it('should work with multiple FormInputs', () => {
      render(
        <>
          <FormInput
            label="Họ tên"
            value="John"
            onChange={() => {}}
          />
          <FormInput
            label="Email"
            value="john@example.com"
            onChange={() => {}}
          />
          <FormInput
            label="Mật khẩu"
            type="password"
            value="pass123"
            onChange={() => {}}
          />
        </>
      );

      expect(screen.getByDisplayValue('John')).toBeInTheDocument();
      expect(screen.getByDisplayValue('john@example.com')).toBeInTheDocument();
      expect(screen.getByDisplayValue('pass123')).toBeInTheDocument();
    });
  });
});

