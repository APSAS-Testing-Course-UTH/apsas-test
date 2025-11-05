import { describe, it, expect, vi } from 'vitest';
import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@/test-utils';
import { FormTextarea } from './FormTextarea';

describe('FormTextarea Component', () => {
  // ==================== RENDERING TESTS ====================
  describe('Rendering', () => {
    it('should render FormTextarea with Vietnamese label', () => {
      render(
        <FormTextarea
          label="Mô tả bài toán"
          value=""
          onChange={() => {}}
        />
      );
      expect(screen.getByText('Mô tả bài toán')).toBeInTheDocument();
    });

    it('should render textarea element', () => {
      render(
        <FormTextarea
          label="Mô tả bài toán"
          value=""
          onChange={() => {}}
        />
      );
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('should render with Vietnamese placeholder text', () => {
      render(
        <FormTextarea
          label="Mô tả bài toán"
          placeholder="Nhập mô tả chi tiết..."
          value=""
          onChange={() => {}}
        />
      );
      expect(screen.getByPlaceholderText('Nhập mô tả chi tiết...')).toBeInTheDocument();
    });
  });

  // ==================== VALUE & CHANGE HANDLING ====================
  describe('Value Handling', () => {
    it('should display initial value', () => {
      const initialValue = 'Lorem ipsum dolor sit amet';
      render(
        <FormTextarea
          label="Mô tả bài toán"
          value={initialValue}
          onChange={() => {}}
        />
      );
      expect(screen.getByDisplayValue(initialValue)).toBeInTheDocument();
    });

    it('should call onChange when textarea value changes', () => {
      const handleChange = vi.fn();
      render(
        <FormTextarea
          label="Mô tả bài toán"
          value=""
          onChange={handleChange}
        />
      );
      const textarea = screen.getByRole('textbox');
      fireEvent.change(textarea, { target: { value: 'New content' } });
      expect(handleChange).toHaveBeenCalled();
    });

    it('should update value when prop changes', () => {
      const { rerender } = render(
        <FormTextarea
          label="Mô tả bài toán"
          value="Initial content"
          onChange={() => {}}
        />
      );
      expect(screen.getByDisplayValue('Initial content')).toBeInTheDocument();

      rerender(
        <FormTextarea
          label="Mô tả bài toán"
          value="Updated content"
          onChange={() => {}}
        />
      );
      expect(screen.getByDisplayValue('Updated content')).toBeInTheDocument();
    });

    it('should handle empty string value', () => {
      render(
        <FormTextarea
          label="Mô tả bài toán"
          value=""
          onChange={() => {}}
        />
      );
      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
      expect(textarea.value).toBe('');
    });
  });

  // ==================== ERROR HANDLING ====================
  describe('Error Display', () => {
    it('should display Vietnamese error message', () => {
      render(
        <FormTextarea
          label="Mô tả bài toán"
          error="Mô tả không được để trống"
          value=""
          onChange={() => {}}
        />
      );
      expect(screen.getByText('Mô tả không được để trống')).toBeInTheDocument();
    });

    it('should not display error when error prop is undefined', () => {
      render(
        <FormTextarea
          label="Mô tả bài toán"
          error={undefined}
          value=""
          onChange={() => {}}
        />
      );
      expect(screen.queryByText(/Mô tả/)).toBeInTheDocument();
    });
  });

  // ==================== DISABLED STATE ====================
  describe('Disabled State', () => {
    it('should disable textarea when disabled prop is true', () => {
      render(
        <FormTextarea
          label="Mô tả bài toán"
          disabled={true}
          value=""
          onChange={() => {}}
        />
      );
      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
      expect(textarea).toBeDisabled();
    });

    it('should not call onChange when disabled', () => {
      const handleChange = vi.fn();
      render(
        <FormTextarea
          label="Mô tả bài toán"
          disabled={true}
          value=""
          onChange={handleChange}
        />
      );
      const textarea = screen.getByRole('textbox');
      fireEvent.change(textarea, { target: { value: 'test' } });
      expect(handleChange).not.toHaveBeenCalled();
    });
  });

  // ==================== REQUIRED FIELD ====================
  describe('Required Field', () => {
    it('should mark field as required', () => {
      render(
        <FormTextarea
          label="Mô tả bài toán"
          required={true}
          value=""
          onChange={() => {}}
        />
      );
      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
      expect(textarea.required).toBe(true);
    });

    it('should not mark as required by default', () => {
      render(
        <FormTextarea
          label="Mô tả bài toán"
          value=""
          onChange={() => {}}
        />
      );
      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
      expect(textarea.required).toBe(false);
    });
  });

  // ==================== ROWS ====================
  describe('Rows', () => {
    it('should support rows prop', () => {
      render(
        <FormTextarea
          label="Mô tả bài toán"
          rows={10}
          value=""
          onChange={() => {}}
        />
      );
      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
      expect(textarea.rows).toBe(10);
    });

    it('should default to 4 rows', () => {
      render(
        <FormTextarea
          label="Mô tả bài toán"
          value=""
          onChange={() => {}}
        />
      );
      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
      expect(textarea.rows).toBe(4);
    });
  });

  // ==================== MAX LENGTH ====================
  describe('Max Length', () => {
    it('should support maxLength prop', () => {
      render(
        <FormTextarea
          label="Mô tả bài toán"
          maxLength={200}
          value=""
          onChange={() => {}}
        />
      );
      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
      expect(textarea.maxLength).toBe(200);
    });

    it('should prevent input beyond maxLength', () => {
      render(
        <FormTextarea
          label="Mô tả bài toán"
          maxLength={10}
          value=""
          onChange={() => {}}
        />
      );
      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
      fireEvent.change(textarea, { target: { value: 'a'.repeat(20) } });
      expect(textarea.value.length).toBeLessThanOrEqual(10);
    });

    it('should display character count when showCharCount is true', () => {
      render(
        <FormTextarea
          label="Mô tả bài toán"
          maxLength={200}
          showCharCount={true}
          value="Hello world"
          onChange={() => {}}
        />
      );
      expect(screen.getByText('11 / 200')).toBeInTheDocument();
    });
  });

  // ==================== SIZE VARIATIONS ====================
  describe('Size Variations', () => {
    it('should support small size', () => {
      const { container } = render(
        <FormTextarea
          label="Mô tả bài toán"
          size="sm"
          value=""
          onChange={() => {}}
        />
      );
      expect(container.firstChild).toBeInTheDocument();
    });

    it('should support medium size (default)', () => {
      const { container } = render(
        <FormTextarea
          label="Mô tả bài toán"
          size="md"
          value=""
          onChange={() => {}}
        />
      );
      expect(container.firstChild).toBeInTheDocument();
    });

    it('should support large size', () => {
      const { container } = render(
        <FormTextarea
          label="Mô tả bài toán"
          size="lg"
          value=""
          onChange={() => {}}
        />
      );
      expect(container.firstChild).toBeInTheDocument();
    });
  });

  // ==================== ACCESSIBILITY ====================
  describe('Accessibility', () => {
    it('should have associated label', () => {
      render(
        <FormTextarea
          label="Mô tả bài toán"
          value=""
          onChange={() => {}}
        />
      );
      const textarea = screen.getByRole('textbox');
      expect(textarea).toBeInTheDocument();
    });

    it('should support aria attributes', () => {
      render(
        <FormTextarea
          label="Mô tả bài toán"
          error="Lỗi"
          value=""
          onChange={() => {}}
        />
      );
      const textarea = screen.getByRole('textbox');
      expect(textarea).toBeInTheDocument();
    });
  });

  // ==================== EDGE CASES ====================
  describe('Edge Cases', () => {
    it('should handle very long content', () => {
      const longContent = 'a'.repeat(5000);
      render(
        <FormTextarea
          label="Mô tả bài toán"
          value={longContent}
          onChange={() => {}}
        />
      );
      const textarea = screen.getByDisplayValue(longContent) as HTMLTextAreaElement;
      expect(textarea.value.length).toBe(5000);
    });

    it('should handle multiline content', () => {
      const multilineContent = 'Line 1\nLine 2\nLine 3';
      render(
        <FormTextarea
          label="Mô tả bài toán"
          value={multilineContent}
          onChange={() => {}}
        />
      );
      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
      expect(textarea.value).toBe(multilineContent);
    });

    it('should handle special characters', () => {
      const specialContent = '!@#$%^&*()_+-=[]{}|;:,.<>?';
      render(
        <FormTextarea
          label="Mô tả bài toán"
          value={specialContent}
          onChange={() => {}}
        />
      );
      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
      expect(textarea.value).toBe(specialContent);
    });

    it('should handle rapid onChange calls', () => {
      const handleChange = vi.fn();
      const { rerender } = render(
        <FormTextarea
          label="Mô tả bài toán"
          value=""
          onChange={handleChange}
        />
      );

      for (let i = 0; i < 10; i++) {
        rerender(
          <FormTextarea
            label="Mô tả bài toán"
            value={`content${i}`}
            onChange={handleChange}
          />
        );
      }

      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
      expect(textarea.value).toBe('content9');
    });
  });

  // ==================== VIETNAMESE UI LABELS ====================
  describe('Vietnamese UI Labels', () => {
    it('should display Vietnamese form labels', () => {
      const vietnameseLabels = [
        'Mô tả bài toán',
        'Ghi chú',
        'Nhận xét',
        'Giải pháp',
        'Tài liệu',
      ];

      vietnameseLabels.forEach((label) => {
        const { unmount } = render(
          <FormTextarea
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
        <FormTextarea
          label="Mô tả bài toán"
          placeholder="Nhập mô tả chi tiết..."
          value=""
          onChange={() => {}}
        />
      );
      expect(screen.getByPlaceholderText('Nhập mô tả chi tiết...')).toBeInTheDocument();
    });
  });

  // ==================== INTEGRATION ====================
  describe('Integration', () => {
    it('should work in a form context', () => {
      const handleSubmit = vi.fn();
      render(
        <form onSubmit={handleSubmit}>
          <FormTextarea
            label="Mô tả bài toán"
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

    it('should work with multiple FormTextareas', () => {
      render(
        <>
          <FormTextarea
            label="Mô tả bài toán"
            value="Description"
            onChange={() => {}}
          />
          <FormTextarea
            label="Ghi chú"
            value="Notes"
            onChange={() => {}}
          />
        </>
      );

      const textareas = screen.getAllByRole('textbox') as HTMLTextAreaElement[];
      expect(textareas).toHaveLength(2);
      expect(textareas[0].value).toBe('Description');
      expect(textareas[1].value).toBe('Notes');
    });
  });
});

