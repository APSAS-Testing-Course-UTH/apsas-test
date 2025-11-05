import { describe, it, expect, vi } from 'vitest';
import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@/test-utils';
import { FormSelect } from './FormSelect';

describe('FormSelect Component', () => {
  const defaultOptions = [
    { label: 'Python', value: 'python' },
    { label: 'JavaScript', value: 'js' },
    { label: 'Java', value: 'java' },
  ];

  // ==================== RENDERING TESTS ====================
  describe('Rendering', () => {
    it('should render FormSelect with Vietnamese label', () => {
      render(
        <FormSelect
          label="Ngôn ngữ lập trình"
          options={defaultOptions}
          value=""
          onChange={() => {}}
        />
      );
      expect(screen.getByText('Ngôn ngữ lập trình')).toBeInTheDocument();
    });

    it('should render select element', () => {
      render(
        <FormSelect
          label="Ngôn ngữ lập trình"
          options={defaultOptions}
          value=""
          onChange={() => {}}
        />
      );
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('should render all options', () => {
      render(
        <FormSelect
          label="Ngôn ngữ lập trình"
          options={defaultOptions}
          value=""
          onChange={() => {}}
        />
      );
      defaultOptions.forEach((option) => {
        expect(screen.getByText(option.label)).toBeInTheDocument();
      });
    });

    it('should render with Vietnamese placeholder', () => {
      render(
        <FormSelect
          label="Ngôn ngữ lập trình"
          placeholder="Chọn ngôn ngữ..."
          options={defaultOptions}
          value=""
          onChange={() => {}}
        />
      );
      expect(screen.getByPlaceholderText('Chọn ngôn ngữ...')).toBeInTheDocument();
    });
  });

  // ==================== VALUE HANDLING ====================
  describe('Value Handling', () => {
    it('should display selected value', () => {
      render(
        <FormSelect
          label="Ngôn ngữ lập trình"
          options={defaultOptions}
          value="python"
          onChange={() => {}}
        />
      );
      expect(screen.getByDisplayValue('Python')).toBeInTheDocument();
    });

    it('should call onChange when selection changes', () => {
      const handleChange = vi.fn();
      render(
        <FormSelect
          label="Ngôn ngữ lập trình"
          options={defaultOptions}
          value=""
          onChange={handleChange}
        />
      );
      const select = screen.getByRole('textbox');
      // Open the dropdown by clicking the select
      fireEvent.click(select);
      // Find and click the JavaScript option
      const jsOption = screen.getByRole('option', { name: 'JavaScript' });
      fireEvent.click(jsOption);
      expect(handleChange).toHaveBeenCalled();
    });

    it('should update value when prop changes', () => {
      const { rerender } = render(
        <FormSelect
          label="Ngôn ngữ lập trình"
          options={defaultOptions}
          value="python"
          onChange={() => {}}
        />
      );
      expect(screen.getByDisplayValue('Python')).toBeInTheDocument();

      rerender(
        <FormSelect
          label="Ngôn ngữ lập trình"
          options={defaultOptions}
          value="java"
          onChange={() => {}}
        />
      );
      expect(screen.getByDisplayValue('Java')).toBeInTheDocument();
    });
  });

  // ==================== ERROR HANDLING ====================
  describe('Error Display', () => {
    it('should display Vietnamese error message', () => {
      render(
        <FormSelect
          label="Ngôn ngữ lập trình"
          error="Vui lòng chọn ngôn ngữ"
          options={defaultOptions}
          value=""
          onChange={() => {}}
        />
      );
      expect(screen.getByText('Vui lòng chọn ngôn ngữ')).toBeInTheDocument();
    });

    it('should not display error when error prop is undefined', () => {
      render(
        <FormSelect
          label="Ngôn ngữ lập trình"
          options={defaultOptions}
          value=""
          onChange={() => {}}
        />
      );
      expect(screen.queryByText(/Vui lòng/)).not.toBeInTheDocument();
    });
  });

  // ==================== DISABLED STATE ====================
  describe('Disabled State', () => {
    it('should disable select when disabled prop is true', () => {
      render(
        <FormSelect
          label="Ngôn ngữ lập trình"
          disabled={true}
          options={defaultOptions}
          value=""
          onChange={() => {}}
        />
      );
      const select = screen.getByRole('textbox') as HTMLInputElement;
      expect(select).toBeDisabled();
    });

    it('should not call onChange when disabled', () => {
      const handleChange = vi.fn();
      render(
        <FormSelect
          label="Ngôn ngữ lập trình"
          disabled={true}
          options={defaultOptions}
          value=""
          onChange={handleChange}
        />
      );
      const select = screen.getByRole('textbox');
      fireEvent.change(select, { target: { value: 'python' } });
      expect(handleChange).not.toHaveBeenCalled();
    });
  });

  // ==================== REQUIRED FIELD ====================
  describe('Required Field', () => {
    it('should mark field as required', () => {
      render(
        <FormSelect
          label="Ngôn ngữ lập trình"
          required={true}
          options={defaultOptions}
          value=""
          onChange={() => {}}
        />
      );
      const select = screen.getByRole('textbox') as HTMLInputElement;
      expect(select).toHaveAttribute('required');
    });

    it('should not mark as required by default', () => {
      render(
        <FormSelect
          label="Ngôn ngữ lập trình"
          options={defaultOptions}
          value=""
          onChange={() => {}}
        />
      );
      const select = screen.getByRole('textbox');
      expect(select).not.toHaveAttribute('required');
    });
  });

  // ==================== OPTIONS ====================
  describe('Options', () => {
    it('should handle empty options array', () => {
      render(
        <FormSelect
          label="Ngôn ngữ lập trình"
          options={[]}
          value=""
          onChange={() => {}}
        />
      );
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('should handle large options array', () => {
      const largeOptions = Array.from({ length: 100 }, (_, i) => ({
        label: `Option ${i}`,
        value: `opt${i}`,
      }));

      render(
        <FormSelect
          label="Ngôn ngữ lập trình"
          options={largeOptions}
          value=""
          onChange={() => {}}
        />
      );
      expect(screen.getByText('Option 0')).toBeInTheDocument();
      expect(screen.getByText('Option 99')).toBeInTheDocument();
    });

    it('should handle options with special characters', () => {
      const specialOptions = [
        { label: 'C++', value: 'cpp' },
        { label: 'C#', value: 'csharp' },
        { label: 'Objective-C', value: 'objc' },
      ];

      render(
        <FormSelect
          label="Ngôn ngữ lập trình"
          options={specialOptions}
          value=""
          onChange={() => {}}
        />
      );
      expect(screen.getByText('C++')).toBeInTheDocument();
      expect(screen.getByText('C#')).toBeInTheDocument();
    });
  });

  // ==================== ACCESSIBILITY ====================
  describe('Accessibility', () => {
    it('should have associated label', () => {
      render(
        <FormSelect
          label="Ngôn ngữ lập trình"
          options={defaultOptions}
          value=""
          onChange={() => {}}
        />
      );
      const select = screen.getByRole('textbox');
      expect(select).toBeInTheDocument();
    });

    it('should have proper aria attributes', () => {
      render(
        <FormSelect
          label="Ngôn ngữ lập trình"
          error="Vui lòng chọn"
          options={defaultOptions}
          value=""
          onChange={() => {}}
        />
      );
      const select = screen.getByRole('textbox');
      expect(select).toHaveAttribute('aria-invalid', 'true');
    });
  });

  // ==================== VIETNAMESE UI LABELS ====================
  describe('Vietnamese UI Labels', () => {
    it('should display Vietnamese form labels', () => {
      const vietnameseSelects = [
        'Ngôn ngữ lập trình',
        'Khóa học',
        'Trạng thái',
        'Vai trò',
        'Cấp độ',
      ];

      vietnameseSelects.forEach((label) => {
        const { unmount } = render(
          <FormSelect
            label={label}
            options={defaultOptions}
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
        <FormSelect
          label="Ngôn ngữ lập trình"
          placeholder="Chọn ngôn ngữ..."
          options={defaultOptions}
          value=""
          onChange={() => {}}
        />
      );
      expect(screen.getByPlaceholderText('Chọn ngôn ngữ...')).toBeInTheDocument();
    });
  });

  // ==================== INTEGRATION ====================
  describe('Integration', () => {
    it('should work in a form context', () => {
      const handleSubmit = vi.fn();
      render(
        <form onSubmit={handleSubmit}>
          <FormSelect
            label="Ngôn ngữ lập trình"
            options={defaultOptions}
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

    it('should work with multiple FormSelects', () => {
      const courseOptions = [
        { label: 'CS101', value: 'cs101' },
        { label: 'CS102', value: 'cs102' },
      ];

      render(
        <>
          <FormSelect
            label="Ngôn ngữ lập trình"
            options={defaultOptions}
            value="python"
            onChange={() => {}}
          />
          <FormSelect
            label="Khóa học"
            options={courseOptions}
            value="cs101"
            onChange={() => {}}
          />
        </>
      );

      expect(screen.getByDisplayValue('Python')).toBeInTheDocument();
      expect(screen.getByDisplayValue('CS101')).toBeInTheDocument();
    });
  });
});

