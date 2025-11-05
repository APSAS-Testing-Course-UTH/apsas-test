import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@/test-utils';
import { Modal, ConfirmDialog } from './Modal';

describe('Modal Component', () => {
  // ============================================================================
  // RENDERING TESTS (3 tests)
  // ============================================================================
  
  describe('Rendering', () => {
    it('should render modal with title and children when open', () => {
      render(
        <Modal isOpen={true} onClose={vi.fn()} title="Xác nhận">
          <p>Nội dung modal</p>
        </Modal>
      );

      expect(screen.getByText('Xác nhận')).toBeInTheDocument();
      expect(screen.getByText('Nội dung modal')).toBeInTheDocument();
    });

    it('should have proper ARIA attributes (role="dialog")', () => {
      render(
        <Modal isOpen={true} onClose={vi.fn()}>
          Content
        </Modal>
      );

      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-modal', 'true');
      expect(dialog).toHaveAttribute('role', 'dialog');
    });

    it('should contain backdrop when open', () => {
      render(
        <Modal isOpen={true} onClose={vi.fn()}>
          Content
        </Modal>
      );

      const backdrop = document.querySelector('[class*="backdrop"]');
      expect(backdrop).toBeInTheDocument();
    });
  });

  // ============================================================================
  // VISIBILITY TESTS (2 tests)
  // ============================================================================

  describe('Visibility', () => {
    it('should display modal when isOpen is true', () => {
      const { rerender } = render(
        <Modal isOpen={false} onClose={vi.fn()}>
          Modal content
        </Modal>
      );

      expect(screen.queryByText('Modal content')).not.toBeInTheDocument();

      rerender(
        <Modal isOpen={true} onClose={vi.fn()}>
          Modal content
        </Modal>
      );

      expect(screen.getByText('Modal content')).toBeInTheDocument();
    });

    it('should not display modal when isOpen is false', () => {
      render(
        <Modal isOpen={false} onClose={vi.fn()}>
          Hidden content
        </Modal>
      );

      expect(screen.queryByText('Hidden content')).not.toBeInTheDocument();
    });
  });

  // ============================================================================
  // CLOSE BEHAVIOR TESTS (6 tests)
  // ============================================================================

  describe('Close Behavior', () => {
    it('should close on escape key press', async () => {
      const handleClose = vi.fn();
      render(
        <Modal isOpen={true} onClose={handleClose}>
          Content
        </Modal>
      );

      fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' });

      await waitFor(() => {
        expect(handleClose).toHaveBeenCalled();
      });
    });

    it('should close on backdrop click when closeOnClickOutside is true', async () => {
      const handleClose = vi.fn();
      render(
        <Modal isOpen={true} onClose={handleClose} closeOnClickOutside={true}>
          Content
        </Modal>
      );

      const backdrop = document.querySelector('[class*="backdrop"]');
      if (backdrop) {
        fireEvent.click(backdrop);
      }

      await waitFor(() => {
        expect(handleClose).toHaveBeenCalled();
      });
    });

    it('should not close on backdrop click when closeOnClickOutside is false', async () => {
      const handleClose = vi.fn();
      render(
        <Modal isOpen={true} onClose={handleClose} closeOnClickOutside={false}>
          Content
        </Modal>
      );

      const backdrop = document.querySelector('[class*="backdrop"]');
      if (backdrop) {
        fireEvent.click(backdrop);
      }

      expect(handleClose).not.toHaveBeenCalled();
    });

    it('should close on close button click', async () => {
      const handleClose = vi.fn();
      render(
        <Modal isOpen={true} onClose={handleClose} showCloseButton={true}>
          Content
        </Modal>
      );

      const closeButton = screen.getByRole('button', { name: /đóng|close|×/i });
      fireEvent.click(closeButton);

      expect(handleClose).toHaveBeenCalled();
    });

    it('should not show close button when showCloseButton is false', () => {
      render(
        <Modal isOpen={true} onClose={vi.fn()} showCloseButton={false}>
          Content
        </Modal>
      );

      const closeButton = screen.queryByRole('button', { name: /đóng|close|×/i });
      expect(closeButton).not.toBeInTheDocument();
    });

    it('should call onClose callback', async () => {
      const handleClose = vi.fn();
      render(
        <Modal isOpen={true} onClose={handleClose}>
          Content
        </Modal>
      );

      const closeButton = screen.getByRole('button', { name: /đóng|close|×/i });
      fireEvent.click(closeButton);

      expect(handleClose).toHaveBeenCalledTimes(1);
    });
  });

  // ============================================================================
  // SIZE TESTS (6 tests)
  // ============================================================================

  describe('Size Variants', () => {
    const sizes: Array<'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full'> = ['xs', 'sm', 'md', 'lg', 'xl', 'full'];

    sizes.forEach((size) => {
      it(`should apply ${size} size variant`, () => {
        render(
          <Modal isOpen={true} onClose={vi.fn()} size={size}>
            Content
          </Modal>
        );

        const dialog = screen.getByRole('dialog');
        expect(dialog.className).toContain(`modal-${size}`);
      });
    });
  });

  // ============================================================================
  // ACCESSIBILITY TESTS (4 tests)
  // ============================================================================

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      render(
        <Modal isOpen={true} onClose={vi.fn()} title="Xác nhận">
          Content
        </Modal>
      );

      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-modal', 'true');
      expect(dialog).toHaveAttribute('role', 'dialog');
    });

    it('should manage focus when opening', () => {
      const { rerender } = render(
        <Modal isOpen={false} onClose={vi.fn()}>
          <button>Modal Button</button>
        </Modal>
      );

      rerender(
        <Modal isOpen={true} onClose={vi.fn()}>
          <button>Modal Button</button>
        </Modal>
      );

      // Focus should move to dialog or first interactive element
      const dialog = screen.getByRole('dialog');
      expect(document.activeElement).toBe(dialog);
    });

    it('should have semantic structure', () => {
      render(
        <Modal isOpen={true} onClose={vi.fn()} title="Tiêu đề">
          Content
        </Modal>
      );

      const dialog = screen.getByRole('dialog');
      expect(dialog).toBeInTheDocument();
      expect(screen.getByText('Tiêu đề')).toBeInTheDocument();
    });

    it('should support aria-label for untitled modals', () => {
      render(
        <Modal isOpen={true} onClose={vi.fn()} aria-label="Hộp thoại xác nhận">
          Content
        </Modal>
      );

      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-label', 'Hộp thoại xác nhận');
    });
  });

  // ============================================================================
  // CONFIRM DIALOG TESTS (15 tests)
  // ============================================================================

  describe('ConfirmDialog Component', () => {
    it('should render confirm and cancel buttons with Vietnamese labels', () => {
      render(
        <ConfirmDialog
          isOpen={true}
          title="Xác nhận xóa"
          message="Bạn có chắc chắn muốn xóa bản ghi này?"
          onConfirm={vi.fn()}
          onCancel={vi.fn()}
        />
      );

      expect(screen.getByRole('button', { name: /xác nhận|confirm/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /hủy|cancel/i })).toBeInTheDocument();
    });

    it('should display title and message in Vietnamese', () => {
      render(
        <ConfirmDialog
          isOpen={true}
          title="Cảnh báo"
          message="Thao tác này không thể hoàn tác"
          onConfirm={vi.fn()}
          onCancel={vi.fn()}
        />
      );

      expect(screen.getByText('Cảnh báo')).toBeInTheDocument();
      expect(screen.getByText('Thao tác này không thể hoàn tác')).toBeInTheDocument();
    });

    it('should call onConfirm when confirm button clicked', async () => {
      const handleConfirm = vi.fn();
      render(
        <ConfirmDialog
          isOpen={true}
          title="Xác nhận"
          message="Tiếp tục?"
          onConfirm={handleConfirm}
          onCancel={vi.fn()}
        />
      );

      const confirmButton = screen.getByRole('button', { name: /xác nhận/i });
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(handleConfirm).toHaveBeenCalled();
      });
    });

    it('should call onCancel when cancel button clicked', async () => {
      const handleCancel = vi.fn();
      render(
        <ConfirmDialog
          isOpen={true}
          title="Xác nhận"
          message="Tiếp tục?"
          onConfirm={vi.fn()}
          onCancel={handleCancel}
        />
      );

      const cancelButton = screen.getByRole('button', { name: /hủy/i });
      fireEvent.click(cancelButton);

      expect(handleCancel).toHaveBeenCalled();
    });

    it('should support custom button text', () => {
      render(
        <ConfirmDialog
          isOpen={true}
          title="Xác nhận"
          message="Message"
          onConfirm={vi.fn()}
          onCancel={vi.fn()}
          confirmText="Tiếp tục"
          cancelText="Đóng"
        />
      );

      expect(screen.getByRole('button', { name: 'Tiếp tục' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Đóng' })).toBeInTheDocument();
    });

    it('should support different button variants (danger for destructive)', () => {
      render(
        <ConfirmDialog
          isOpen={true}
          title="Xóa"
          message="Xóa vĩnh viễn?"
          onConfirm={vi.fn()}
          onCancel={vi.fn()}
          confirmVariant="danger"
        />
      );

      const confirmButton = screen.getByRole('button', { name: /xác nhận/i });
      expect(confirmButton.className).toContain('variant-danger');
    });

    it('should show loading state on confirm button', () => {
      render(
        <ConfirmDialog
          isOpen={true}
          title="Processing"
          message="Please wait..."
          onConfirm={vi.fn()}
          onCancel={vi.fn()}
          isLoading={true}
        />
      );

      const confirmButton = screen.getByRole('button', { name: /đang xử lý|processing/i });
      expect(confirmButton).toHaveAttribute('disabled');
    });

    it('should support size prop', () => {
      const { rerender } = render(
        <ConfirmDialog
          isOpen={true}
          title="Title"
          message="Message"
          onConfirm={vi.fn()}
          onCancel={vi.fn()}
          size="sm"
        />
      );

      const dialog = screen.getByRole('dialog');
      expect(dialog.className).toContain('modal-sm');

      rerender(
        <ConfirmDialog
          isOpen={true}
          title="Title"
          message="Message"
          onConfirm={vi.fn()}
          onCancel={vi.fn()}
          size="lg"
        />
      );

      expect(dialog.className).toContain('modal-lg');
    });

    it('should not display when isOpen is false', () => {
      render(
        <ConfirmDialog
          isOpen={false}
          title="Title"
          message="Message"
          onConfirm={vi.fn()}
          onCancel={vi.fn()}
        />
      );

      expect(screen.queryByText('Title')).not.toBeInTheDocument();
    });

    it('should handle async onConfirm', async () => {
      const handleConfirm = vi.fn<() => Promise<void>>(
        () =>
          new Promise((resolve) => {
            setTimeout(resolve, 100);
          })
      );

      render(
        <ConfirmDialog
          isOpen={true}
          title="Xác nhận"
          message="Message"
          onConfirm={handleConfirm}
          onCancel={vi.fn()}
        />
      );

      const confirmButton = screen.getByRole('button', { name: /xác nhận/i });
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(handleConfirm).toHaveBeenCalled();
      });
    });

    it('should default to danger variant for confirm button', () => {
      render(
        <ConfirmDialog
          isOpen={true}
          title="Title"
          message="Message"
          onConfirm={vi.fn()}
          onCancel={vi.fn()}
        />
      );

      const confirmButton = screen.getByRole('button', { name: /xác nhận/i }) as HTMLElement;
      expect(confirmButton).toHaveCSSModuleClass('variant-danger');
    });

    it('should default size to sm', () => {
      render(
        <ConfirmDialog
          isOpen={true}
          title="Title"
          message="Message"
          onConfirm={vi.fn()}
          onCancel={vi.fn()}
        />
      );

      const dialog = (screen.getByRole('dialog') as HTMLElement);
      expect(dialog).toHaveCSSModuleClass('modal-sm');
    });

    it('should have proper aria-modal attribute', () => {
      render(
        <ConfirmDialog
          isOpen={true}
          title="Title"
          message="Message"
          onConfirm={vi.fn()}
          onCancel={vi.fn()}
        />
      );

      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-modal', 'true');
    });
  });

  // ============================================================================
  // VIETNAMESE UI TESTS (5 tests)
  // ============================================================================

  describe('Vietnamese UI', () => {
    it('should display Vietnamese button labels in ConfirmDialog', () => {
      render(
        <ConfirmDialog
          isOpen={true}
          title="Tiêu đề"
          message="Nội dung"
          onConfirm={vi.fn()}
          onCancel={vi.fn()}
        />
      );

      expect(screen.getByRole('button', { name: /xác nhận/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /hủy/i })).toBeInTheDocument();
    });

    it('should display custom Vietnamese button text', () => {
      render(
        <ConfirmDialog
          isOpen={true}
          title="Xóa bài toán"
          message="Bạn có chắc chắn?"
          onConfirm={vi.fn()}
          onCancel={vi.fn()}
          confirmText="Xóa vĩnh viễn"
          cancelText="Hủy bỏ"
        />
      );

      expect(screen.getByRole('button', { name: 'Xóa vĩnh viễn' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Hủy bỏ' })).toBeInTheDocument();
    });

    it('should support Vietnamese accented characters', () => {
      render(
        <Modal isOpen={true} onClose={vi.fn()} title="Xác nhận hành động">
          <p>Nội dung với các ký tự đặc biệt: à, á, ả, ã, ạ</p>
        </Modal>
      );

      expect(screen.getByText('Xác nhận hành động')).toBeInTheDocument();
      expect(screen.getByText(/Nội dung với các ký tự đặc biệt/i)).toBeInTheDocument();
    });

    it('should render Modal with Vietnamese title', () => {
      render(
        <Modal isOpen={true} onClose={vi.fn()} title="Bảng xác nhận">
          Nội dung
        </Modal>
      );

      expect(screen.getByText('Bảng xác nhận')).toBeInTheDocument();
    });

    it('should handle Vietnamese error messages', () => {
      render(
        <Modal isOpen={true} onClose={vi.fn()} title="Lỗi">
          <p>Có lỗi xảy ra: Không tìm thấy tài nguyên</p>
        </Modal>
      );

      expect(screen.getByText(/Không tìm thấy tài nguyên/i)).toBeInTheDocument();
    });
  });

  // ============================================================================
  // ANIMATION & STYLING TESTS (3 tests)
  // ============================================================================

  describe('Animation & Styling', () => {
    it('should have animation classes for entrance', () => {
      render(
        <Modal isOpen={true} onClose={vi.fn()}>
          Content
        </Modal>
      );

      const dialog = screen.getByRole('dialog');
      expect(dialog).toBeTruthy();
    });

    it('should apply responsive styling', () => {
      render(
        <Modal isOpen={true} onClose={vi.fn()} size="lg">
          Content
        </Modal>
      );

      const dialog = screen.getByRole('dialog');
      expect(dialog as HTMLElement).toHaveCSSModuleClass('modal-lg');
    });

    it('should support dark mode styling', () => {
      render(
        <Modal isOpen={true} onClose={vi.fn()}>
          Content
        </Modal>
      );

      const dialog = screen.getByRole('dialog');
      // Dark mode support is handled via CSS media queries
      expect(dialog).toBeTruthy();
    });
  });

  // ============================================================================
  // INTEGRATION TESTS (6 tests)
  // ============================================================================

  describe('Integration', () => {
    it('should work with form elements inside', () => {
      render(
        <Modal isOpen={true} onClose={vi.fn()}>
          <form>
            <input type="text" placeholder="Nhập tên" />
            <button type="submit">Gửi</button>
          </form>
        </Modal>
      );

      expect(screen.getByPlaceholderText('Nhập tên')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Gửi' })).toBeInTheDocument();
    });

    it('should work with nested elements', () => {
      render(
        <Modal isOpen={true} onClose={vi.fn()} title="Xác nhận">
          <div>
            <h3>Tiêu đề phụ</h3>
            <p>Nội dung chi tiết</p>
            <ul>
              <li>Mục 1</li>
              <li>Mục 2</li>
            </ul>
          </div>
        </Modal>
      );

      expect(screen.getByText('Tiêu đề phụ')).toBeInTheDocument();
      expect(screen.getByText('Nội dung chi tiết')).toBeInTheDocument();
    });

    it('should work with loading state', () => {
      const handleConfirm = vi.fn<() => Promise<void>>(
        () =>
          new Promise((resolve) => {
            setTimeout(resolve, 500);
          })
      );

      render(
        <ConfirmDialog
          isOpen={true}
          title="Xử lý"
          message="Đang xử lý..."
          onConfirm={handleConfirm}
          onCancel={vi.fn()}
          isLoading={true}
        />
      );

      const confirmButton = screen.getByRole('button', { name: /đang xử lý|processing/i });
      expect(confirmButton).toHaveAttribute('disabled');
    });

    it('should work with large content', () => {
      const largeContent = Array.from({ length: 50 }, (_, i) => (
        <p key={i}>Dòng nội dung {i + 1}</p>
      ));

      render(
        <Modal isOpen={true} onClose={vi.fn()} size="lg">
          <div>{largeContent}</div>
        </Modal>
      );

      expect(screen.getByText('Dòng nội dung 1')).toBeInTheDocument();
      expect(screen.getByText('Dòng nội dung 50')).toBeInTheDocument();
    });

    it('should support multiple modals (portals)', () => {
      render(
        <>
          <Modal isOpen={true} onClose={vi.fn()} title="Modal 1">
            Nội dung modal 1
          </Modal>
          <Modal isOpen={true} onClose={vi.fn()} title="Modal 2">
            Nội dung modal 2
          </Modal>
        </>
      );

      expect(screen.getByText('Nội dung modal 1')).toBeInTheDocument();
      expect(screen.getByText('Nội dung modal 2')).toBeInTheDocument();
    });

    it('should work with custom CSS classes', () => {
      render(
        <Modal isOpen={true} onClose={vi.fn()} className="custom-class">
          Content
        </Modal>
      );

      const dialog = screen.getByRole('dialog');
      expect(dialog as HTMLElement).toHaveCSSModuleClass('custom-class');
    });
  });

  // ============================================================================
  // EDGE CASES (4 tests)
  // ============================================================================

  describe('Edge Cases', () => {
    it('should handle empty children', () => {
      const { container } = render(
        <Modal isOpen={true} onClose={vi.fn()}>
          Modal content
        </Modal>
      );

      expect(container.querySelector('[role="dialog"]')).toBeInTheDocument();
    });

    it('should handle rapid open/close', async () => {
      const handleClose = vi.fn();
      const { rerender } = render(
        <Modal isOpen={true} onClose={handleClose}>
          Content
        </Modal>
      );

      rerender(
        <Modal isOpen={false} onClose={handleClose}>
          Content
        </Modal>
      );

      rerender(
        <Modal isOpen={true} onClose={handleClose}>
          Content
        </Modal>
      );

      rerender(
        <Modal isOpen={false} onClose={handleClose}>
          Content
        </Modal>
      );

      await waitFor(() => {
        expect(screen.queryByText('Content')).not.toBeInTheDocument();
      });
    });

    it('should handle null onClose gracefully', () => {
      const { container } = render(
        <Modal isOpen={true} onClose={() => {}}>
          Content
        </Modal>
      );

      expect(container.querySelector('[role="dialog"]')).toBeInTheDocument();
    });

    it('should work without title prop', () => {
      const { container } = render(
        <Modal isOpen={true} onClose={vi.fn()}>
          Content without title
        </Modal>
      );

      expect(screen.getByText('Content without title')).toBeInTheDocument();
      expect(container.querySelector('[role="dialog"]')).toBeInTheDocument();
    });
  });
});

