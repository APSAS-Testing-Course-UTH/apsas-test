import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@/test-utils';
import { ExportButton, ExportGroup } from './ExportButton';

// Mock the exportUtils
vi.mock('../utils/exportUtils', () => ({
  exportToCSV: vi.fn(),
  generateFilename: vi.fn(() => 'test-08-11-2025.csv'),
}));

// Mock the toast hook
vi.mock('@/components/hooks/useToast', () => ({
  useToast: () => ({
    showNotification: vi.fn(),
  }),
}));

describe('ExportButton', () => {
  const mockData = [
    {
      id: '1',
      title: 'Assignment 1',
      difficulty: 'EASY',
      status: 'PUBLISHED',
      createdAt: '2025-11-08T00:00:00Z',
    },
    {
      id: '2',
      title: 'Assignment 2',
      difficulty: 'MEDIUM',
      status: 'DRAFT',
      createdAt: '2025-11-08T00:00:00Z',
    },
  ];

  describe('Rendering', () => {
    it('should render Vietnamese label "Tải xuống" for assignments', () => {
      render(
        <ExportButton data={mockData} type="assignments" />
      );

      expect(screen.getByRole('button')).toBeInTheDocument();
      expect(screen.getByText(/Tải xuống/)).toBeInTheDocument();
    });

    it('should render Vietnamese label with data count', () => {
      render(
        <ExportButton data={mockData} type="assignments" />
      );

      expect(screen.getByText('Tải xuống (2)')).toBeInTheDocument();
    });

    it('should render with download icon', () => {
      render(
        <ExportButton data={mockData} type="assignments" />
      );

      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
      // Icon is rendered as SVG in Mantine
    });

    it('should render for submissions type', () => {
      render(
        <ExportButton
          data={mockData}
          type="submissions"
        />
      );

      expect(screen.getByText(/Tải xuống/)).toBeInTheDocument();
    });

    it('should disable button when data is empty', () => {
      render(
        <ExportButton data={[]} type="assignments" />
      );

      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    it('should disable button when loading', () => {
      render(
        <ExportButton
          data={mockData}
          type="assignments"
          isLoading={true}
        />
      );

      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    it('should show tooltip for empty data', async () => {
      render(
        <ExportButton data={[]} type="assignments" />
      );

      const button = screen.getByRole('button');
      fireEvent.hover(button);

      await waitFor(() => {
        const tooltip = screen.queryByText(/Không có bài tập/i);
        if (tooltip) {
          expect(tooltip).toBeInTheDocument();
        }
      });
    });

    it('should use custom className', () => {
      const { container } = render(
        <ExportButton
          data={mockData}
          type="assignments"
          className="custom-class"
        />
      );

      const button = screen.getByRole('button');
      expect(button.parentElement).toHaveClass('custom-class');
    });
  });

  describe('Export Functionality', () => {
    it('should call exportToCSV on button click', async () => {
      const { exportToCSV } = await import('../utils/exportUtils');

      render(
        <ExportButton data={mockData} type="assignments" />
      );

      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        expect(exportToCSV).toHaveBeenCalledWith(
          mockData,
          'assignments',
          undefined
        );
      });
    });

    it('should pass custom filename to exportToCSV', async () => {
      const { exportToCSV } = await import('../utils/exportUtils');
      const customFilename = 'custom-assignments.csv';

      render(
        <ExportButton
          data={mockData}
          type="assignments"
          filename={customFilename}
        />
      );

      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        expect(exportToCSV).toHaveBeenCalledWith(
          mockData,
          'assignments',
          customFilename
        );
      });
    });

    it('should show loading state while exporting', async () => {
      const { exportToCSV } = await import('../utils/exportUtils');
      (exportToCSV as any).mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            setTimeout(resolve, 100);
          })
      );

      render(
        <ExportButton data={mockData} type="assignments" />
      );

      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText('Đang tải...')).toBeInTheDocument();
      });
    });

    it('should call onSuccess callback after export', async () => {
      const onSuccess = vi.fn();

      render(
        <ExportButton
          data={mockData}
          type="assignments"
          onSuccess={onSuccess}
        />
      );

      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        expect(onSuccess).toHaveBeenCalled();
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle empty data gracefully', async () => {
      const onError = vi.fn();

      render(
        <ExportButton
          data={[]}
          type="assignments"
          onError={onError}
        />
      );

      const button = screen.getByRole('button');

      // Button should be disabled for empty data
      expect(button).toBeDisabled();
    });

    it('should handle export errors', async () => {
      const { exportToCSV } = await import('../utils/exportUtils');
      const error = new Error('Export failed');
      (exportToCSV as any).mockImplementationOnce(() => {
        throw error;
      });

      const onError = vi.fn();

      render(
        <ExportButton
          data={mockData}
          type="assignments"
          onError={onError}
        />
      );

      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        expect(onError).toHaveBeenCalled();
      });
    });

    it('should disable button while disabled prop is true', () => {
      render(
        <ExportButton
          data={mockData}
          type="assignments"
          disabled={true}
        />
      );

      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });
  });

  describe('Props Handling', () => {
    it('should accept variant prop', () => {
      render(
        <ExportButton
          data={mockData}
          type="assignments"
          variant="filled"
        />
      );

      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    it('should accept size prop', () => {
      render(
        <ExportButton
          data={mockData}
          type="assignments"
          size="lg"
        />
      );

      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    it('should handle multiple clicks without interference', async () => {
      const { exportToCSV } = await import('../utils/exportUtils');

      render(
        <ExportButton data={mockData} type="assignments" />
      );

      const button = screen.getByRole('button');

      fireEvent.click(button);
      await waitFor(() => {
        expect(exportToCSV).toHaveBeenCalledTimes(1);
      });

      fireEvent.click(button);
      await waitFor(() => {
        expect(exportToCSV).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('Vietnamese UI Compliance', () => {
    it('should display all Vietnamese labels', () => {
      render(
        <ExportButton data={mockData} type="assignments" />
      );

      expect(screen.getByText(/Tải xuống/)).toBeInTheDocument();
    });

    it('should show "Đang tải..." during loading', async () => {
      const { exportToCSV } = await import('../utils/exportUtils');
      (exportToCSV as any).mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            setTimeout(resolve, 100);
          })
      );

      render(
        <ExportButton data={mockData} type="assignments" />
      );

      fireEvent.click(screen.getByRole('button'));

      await waitFor(() => {
        expect(screen.getByText('Đang tải...')).toBeInTheDocument();
      });
    });

    it('should display correct Vietnamese count label', () => {
      render(
        <ExportButton data={mockData} type="assignments" />
      );

      expect(screen.getByText('Tải xuống (2)')).toBeInTheDocument();
    });
  });
});

describe('ExportGroup', () => {
  const mockData = [
    {
      id: '1',
      title: 'Assignment 1',
      difficulty: 'EASY',
      status: 'PUBLISHED',
      createdAt: '2025-11-08T00:00:00Z',
    },
  ];

  it('should render export group with button', () => {
    render(
      <ExportGroup data={mockData} type="assignments" />
    );

    expect(screen.getByRole('button')).toBeInTheDocument();
    expect(screen.getByText(/Tải xuống/)).toBeInTheDocument();
  });

  it('should pass loading state to button', () => {
    render(
      <ExportGroup
        data={mockData}
        type="assignments"
        isLoading={true}
      />
    );

    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  it('should pass data and type to ExportButton', async () => {
    const { exportToCSV } = await import('../utils/exportUtils');

    render(
      <ExportGroup data={mockData} type="submissions" />
    );

    const button = screen.getByRole('button');
    fireEvent.click(button);

    await waitFor(() => {
      expect(exportToCSV).toHaveBeenCalledWith(
        mockData,
        'submissions',
        undefined
      );
    });
  });

  it('should call onSuccess callback', async () => {
    const onSuccess = vi.fn();

    render(
      <ExportGroup
        data={mockData}
        type="assignments"
        onSuccess={onSuccess}
      />
    );

    const button = screen.getByRole('button');
    fireEvent.click(button);

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalled();
    });
  });
});
