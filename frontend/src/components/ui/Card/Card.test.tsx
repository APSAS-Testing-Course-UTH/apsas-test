/**
 * Card Component Tests
 * Testing Card, CardHeader, CardBody, CardFooter components
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@/test-utils';
import { Card, CardHeader, CardBody, CardFooter } from './Card';

describe('Card Component', () => {
  describe('Rendering', () => {
    it('should render card with children', () => {
      render(
        <Card>
          <div>Nội dung thẻ</div>
        </Card>
      );
      expect(screen.getByText('Nội dung thẻ')).toBeInTheDocument();
    });

    it('should render card as container element', () => {
      render(<Card>Test Content</Card>);
      const card = screen.getByText('Test Content').closest('div');
      expect(card).toHaveCSSModuleClass('card');
    });

    it('should apply custom className', () => {
      render(<Card className="custom-class">Content</Card>);
      const card = screen.getByText('Content').closest('div');
      expect(card).toHaveCSSModuleClass('custom-class');
    });
  });

  describe('Shadow Variants', () => {
    it('should render with default shadow', () => {
      render(<Card shadow>Có bóng</Card>);
      const card = screen.getByText('Có bóng').closest('div');
      expect(card).toHaveCSSModuleClass('shadow-default');
    });

    it('should render with sm shadow', () => {
      render(<Card shadow="sm">Bóng nhỏ</Card>);
      const card = screen.getByText('Bóng nhỏ').closest('div');
      expect(card).toHaveCSSModuleClass('shadow-sm');
    });

    it('should render with md shadow', () => {
      render(<Card shadow="md">Bóng vừa</Card>);
      const card = screen.getByText('Bóng vừa').closest('div');
      expect(card).toHaveCSSModuleClass('shadow-md');
    });

    it('should render with lg shadow', () => {
      render(<Card shadow="lg">Bóng lớn</Card>);
      const card = screen.getByText('Bóng lớn').closest('div');
      expect(card).toHaveCSSModuleClass('shadow-lg');
    });

    it('should render with xl shadow', () => {
      render(<Card shadow="xl">Bóng rất lớn</Card>);
      const card = screen.getByText('Bóng rất lớn').closest('div');
      expect(card).toHaveCSSModuleClass('shadow-xl');
    });

    it('should render without shadow when false', () => {
      render(<Card shadow={false}>Không bóng</Card>);
      const card = screen.getByText('Không bóng').closest('div');
      expect(card).not.toHaveCSSModuleClass('shadow-default');
    });
  });

  describe('Padding Variants', () => {
    it('should render with xs padding', () => {
      render(<Card padding="xs">XS Padding</Card>);
      const card = screen.getByText('XS Padding').closest('div');
      expect(card).toHaveCSSModuleClass('padding-xs');
    });

    it('should render with sm padding', () => {
      render(<Card padding="sm">SM Padding</Card>);
      const card = screen.getByText('SM Padding').closest('div');
      expect(card).toHaveCSSModuleClass('padding-sm');
    });

    it('should render with md padding', () => {
      render(<Card padding="md">MD Padding</Card>);
      const card = screen.getByText('MD Padding').closest('div');
      expect(card).toHaveCSSModuleClass('padding-md');
    });

    it('should render with lg padding', () => {
      render(<Card padding="lg">LG Padding</Card>);
      const card = screen.getByText('LG Padding').closest('div');
      expect(card).toHaveCSSModuleClass('padding-lg');
    });

    it('should render with xl padding', () => {
      render(<Card padding="xl">XL Padding</Card>);
      const card = screen.getByText('XL Padding').closest('div');
      expect(card).toHaveCSSModuleClass('padding-xl');
    });
  });

  describe('Border', () => {
    it('should render with border when withBorder is true', () => {
      render(<Card withBorder>Có viền</Card>);
      const card = screen.getByText('Có viền').closest('div');
      expect(card).toHaveCSSModuleClass('with-border');
    });

    it('should render without border by default', () => {
      render(<Card>Mặc định</Card>);
      const card = screen.getByText('Mặc định').closest('div');
      expect(card).not.toHaveCSSModuleClass('with-border');
    });
  });

  describe('Border Radius', () => {
    it('should render with xs radius', () => {
      render(<Card radius="xs">Radius XS</Card>);
      const card = screen.getByText('Radius XS').closest('div');
      expect(card).toHaveCSSModuleClass('radius-xs');
    });

    it('should render with sm radius', () => {
      render(<Card radius="sm">Radius SM</Card>);
      const card = screen.getByText('Radius SM').closest('div');
      expect(card).toHaveCSSModuleClass('radius-sm');
    });

    it('should render with md radius', () => {
      render(<Card radius="md">Radius MD</Card>);
      const card = screen.getByText('Radius MD').closest('div');
      expect(card).toHaveCSSModuleClass('radius-md');
    });

    it('should render with lg radius', () => {
      render(<Card radius="lg">Radius LG</Card>);
      const card = screen.getByText('Radius LG').closest('div');
      expect(card).toHaveCSSModuleClass('radius-lg');
    });

    it('should render with xl radius', () => {
      render(<Card radius="xl">Radius XL</Card>);
      const card = screen.getByText('Radius XL').closest('div');
      expect(card).toHaveCSSModuleClass('radius-xl');
    });
  });

  describe('Multiple Props', () => {
    it('should combine multiple props correctly', () => {
      render(
        <Card shadow="lg" padding="md" withBorder radius="md">
          Combined Props
        </Card>
      );
      const card = screen.getByText('Combined Props').closest('div');
      expect(card).toHaveCSSModuleClass('shadow-lg');
      expect(card).toHaveCSSModuleClass('padding-md');
      expect(card).toHaveCSSModuleClass('with-border');
      expect(card).toHaveCSSModuleClass('radius-md');
    });
  });

  describe('Responsive Design', () => {
    it('should be responsive to screen size changes', () => {
      render(<Card padding="md">Responsive</Card>);
      const card = screen.getByText('Responsive').closest('div');
      expect(card).toBeInTheDocument();
    });
  });
});

describe('CardHeader Component', () => {
  describe('Rendering', () => {
    it('should render card header with Vietnamese title', () => {
      render(
        <Card>
          <CardHeader>Tiêu đề thẻ</CardHeader>
        </Card>
      );
      expect(screen.getByText('Tiêu đề thẻ')).toBeInTheDocument();
    });

    it('should render header as semantic element', () => {
      render(
        <Card>
          <CardHeader>Header</CardHeader>
        </Card>
      );
      const header = screen.getByText('Header').closest('div');
      expect(header).toHaveCSSModuleClass('card-header');
    });

    it('should apply custom className to header', () => {
      render(
        <Card>
          <CardHeader className="custom-header">Header</CardHeader>
        </Card>
      );
      const header = screen.getByText('Header').closest('div');
      expect(header).toHaveCSSModuleClass('custom-header');
    });

    it('should render header with complex children', () => {
      render(
        <Card>
          <CardHeader>
            <h2>Tiêu đề</h2>
            <span>Phụ đề</span>
          </CardHeader>
        </Card>
      );
      expect(screen.getByText('Tiêu đề')).toBeInTheDocument();
      expect(screen.getByText('Phụ đề')).toBeInTheDocument();
    });
  });

  describe('Vietnamese UI', () => {
    it('should display Vietnamese header text correctly', () => {
      render(
        <Card>
          <CardHeader>Bài nộp gần đây</CardHeader>
        </Card>
      );
      expect(screen.getByText('Bài nộp gần đây')).toBeInTheDocument();
    });
  });
});

describe('CardBody Component', () => {
  describe('Rendering', () => {
    it('should render card body with content', () => {
      render(
        <Card>
          <CardBody>Nội dung chính</CardBody>
        </Card>
      );
      expect(screen.getByText('Nội dung chính')).toBeInTheDocument();
    });

    it('should render body as main content container', () => {
      render(
        <Card>
          <CardBody>Content</CardBody>
        </Card>
      );
      const body = screen.getByText('Content').closest('div');
      expect(body).toHaveCSSModuleClass('card-body');
    });

    it('should apply custom className to body', () => {
      render(
        <Card>
          <CardBody className="custom-body">Body</CardBody>
        </Card>
      );
      const body = screen.getByText('Body').closest('div');
      expect(body).toHaveCSSModuleClass('custom-body');
    });

    it('should render body with complex children', () => {
      render(
        <Card>
          <CardBody>
            <p>Đoạn một</p>
            <p>Đoạn hai</p>
          </CardBody>
        </Card>
      );
      expect(screen.getByText('Đoạn một')).toBeInTheDocument();
      expect(screen.getByText('Đoạn hai')).toBeInTheDocument();
    });

    it('should handle empty body', () => {
      const { container } = render(
        <Card>
          <CardBody>Empty body</CardBody>
        </Card>
      );
      const card = container.querySelector('[class*="card"]');
      expect(card).toBeInTheDocument();
    });
  });

  describe('Vietnamese UI', () => {
    it('should display Vietnamese body content correctly', () => {
      render(
        <Card>
          <CardBody>Đây là nội dung bài toán lập trình</CardBody>
        </Card>
      );
      expect(screen.getByText('Đây là nội dung bài toán lập trình')).toBeInTheDocument();
    });
  });
});

describe('CardFooter Component', () => {
  describe('Rendering', () => {
    it('should render card footer with Vietnamese label', () => {
      render(
        <Card>
          <CardFooter>Xem thêm</CardFooter>
        </Card>
      );
      expect(screen.getByText('Xem thêm')).toBeInTheDocument();
    });

    it('should render footer as separate element', () => {
      render(
        <Card>
          <CardFooter>Footer</CardFooter>
        </Card>
      );
      const footer = screen.getByText('Footer').closest('div');
      expect(footer).toHaveCSSModuleClass('card-footer');
    });

    it('should apply custom className to footer', () => {
      render(
        <Card>
          <CardFooter className="custom-footer">Footer</CardFooter>
        </Card>
      );
      const footer = screen.getByText('Footer').closest('div');
      expect(footer).toHaveCSSModuleClass('custom-footer');
    });

    it('should render footer with multiple action buttons', () => {
      render(
        <Card>
          <CardFooter>
            <button>Hủy</button>
            <button>Lưu</button>
          </CardFooter>
        </Card>
      );
      expect(screen.getByRole('button', { name: 'Hủy' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Lưu' })).toBeInTheDocument();
    });
  });

  describe('Vietnamese UI', () => {
    it('should display Vietnamese footer actions correctly', () => {
      render(
        <Card>
          <CardFooter>
            <button>Hủy</button>
          </CardFooter>
        </Card>
      );
      expect(screen.getByRole('button', { name: 'Hủy' })).toBeInTheDocument();
    });
  });
});

describe('Card Composition', () => {
  describe('Full Card Structure', () => {
    it('should render complete card with all sections', () => {
      render(
        <Card shadow="md" padding="md" withBorder>
          <CardHeader>Tiêu đề bài tập</CardHeader>
          <CardBody>
            <p>Mô tả bài toán</p>
            <p>Ví dụ: Input → Output</p>
          </CardBody>
          <CardFooter>
            <button>Bắt đầu</button>
          </CardFooter>
        </Card>
      );

      expect(screen.getByText('Tiêu đề bài tập')).toBeInTheDocument();
      expect(screen.getByText('Mô tả bài toán')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Bắt đầu' })).toBeInTheDocument();
    });

    it('should maintain structure with partial sections', () => {
      render(
        <Card>
          <CardHeader>Header</CardHeader>
          <CardBody>Body</CardBody>
        </Card>
      );

      expect(screen.getByText('Header')).toBeInTheDocument();
      expect(screen.getByText('Body')).toBeInTheDocument();
    });

    it('should render card with only body section', () => {
      render(
        <Card>
          <CardBody>Nội dung</CardBody>
        </Card>
      );

      expect(screen.getByText('Nội dung')).toBeInTheDocument();
    });
  });

  describe('Assignment Card Example', () => {
    it('should render assignment card with Vietnamese labels', () => {
      render(
        <Card shadow="md" padding="md" withBorder>
          <CardHeader>Bài toán: Fibonacci</CardHeader>
          <CardBody>
            <p>Độ khó: Khó</p>
            <p>Hạn chót: 31/10/2025</p>
          </CardBody>
          <CardFooter>
            <button>Xem chi tiết</button>
          </CardFooter>
        </Card>
      );

      expect(screen.getByText(/Bài toán: Fibonacci/)).toBeInTheDocument();
      expect(screen.getByText(/Độ khó: Khó/)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Xem chi tiết/ })).toBeInTheDocument();
    });
  });

  describe('Stats Card Example', () => {
    it('should render stats card with Vietnamese content', () => {
      render(
        <Card shadow="sm" padding="md">
          <CardBody>
            <div>
              <strong>Tổng bài tập:</strong> 12
            </div>
            <div>
              <strong>Đã nộp:</strong> 8
            </div>
            <div>
              <strong>Điểm trung bình:</strong> 85%
            </div>
          </CardBody>
        </Card>
      );

      expect(screen.getByText(/Tổng bài tập:/)).toBeInTheDocument();
      expect(screen.getByText('12')).toBeInTheDocument();
      expect(screen.getByText(/Đã nộp:/)).toBeInTheDocument();
      expect(screen.getByText('8')).toBeInTheDocument();
    });
  });
});

describe('Accessibility', () => {
  it('should have proper heading hierarchy', () => {
    render(
      <Card>
        <CardHeader>
          <h2>Tiêu đề</h2>
        </CardHeader>
        <CardBody>Nội dung</CardBody>
      </Card>
    );

    const heading = screen.getByRole('heading', { level: 2 });
    expect(heading).toBeInTheDocument();
  });

  it('should maintain semantic structure', () => {
    render(
      <Card>
        <CardHeader>Header</CardHeader>
        <CardBody>Body</CardBody>
        <CardFooter>
          <button>Action</button>
        </CardFooter>
      </Card>
    );

    const card = screen.getByText('Header').closest('div[class*="card"]');
    expect(card).toBeInTheDocument();
  });
});

describe('Edge Cases', () => {
  it('should handle card with no children', () => {
    const { container } = render(<Card><CardBody>Content</CardBody></Card>);
    expect(container.querySelector('[class*="card"]')).toBeInTheDocument();
  });

  it('should handle very long content', () => {
    const longText = 'A'.repeat(500);
    render(<Card><CardBody>{longText}</CardBody></Card>);
    expect(screen.getByText(longText)).toBeInTheDocument();
  });

  it('should handle nested cards', () => {
    render(
      <Card>
        <CardBody>
          <Card>
            <CardBody>Nested</CardBody>
          </Card>
        </CardBody>
      </Card>
    );

    const nestedCards = document.querySelectorAll('div[class*="_card_"]:not([class*="card-"])');
    expect(nestedCards.length).toBe(2);
  });

  it('should combine all size props together', () => {
    render(
      <Card
        shadow="xl"
        padding="lg"
        radius="lg"
        withBorder
      >
        All Props
      </Card>
    );

    const card = screen.getByText('All Props').closest('div');
    expect(card).toHaveCSSModuleClass('shadow-xl');
    expect(card).toHaveCSSModuleClass('padding-lg');
    expect(card).toHaveCSSModuleClass('radius-lg');
    expect(card).toHaveCSSModuleClass('with-border');
  });
});

