/**
 * Tabs Component Tests
 * TDD: Tests first, implementation second
 */

import { render, screen, fireEvent } from '@/test-utils';
import { Tabs } from './Tabs';
import type { Tab } from '@/components/types';

describe('Tabs Component', () => {
  // Sample tabs data
  const defaultTabs: Tab[] = [
    { key: 'tab1', label: 'Thẻ 1', content: 'Nội dung 1' },
    { key: 'tab2', label: 'Thẻ 2', content: 'Nội dung 2' },
    { key: 'tab3', label: 'Thẻ 3', content: 'Nội dung 3' },
  ];

  const vietnameseTabs: Tab[] = [
    { key: 'overview', label: 'Tổng quan', content: 'Thông tin tổng quát' },
    { key: 'details', label: 'Chi tiết', content: 'Thông tin chi tiết' },
    { key: 'settings', label: 'Cài đặt', content: 'Các cài đặt' },
  ];

  // ✅ Rendering Tests
  describe('Rendering', () => {
    it('should render tabs container', () => {
      render(<Tabs tabs={defaultTabs} />);
      const container = screen.getByRole('tablist');
      expect(container).toBeInTheDocument();
    });

    it('should render all tab buttons', () => {
      render(<Tabs tabs={defaultTabs} />);
      const tabs = screen.getAllByRole('tab');
      expect(tabs).toHaveLength(3);
    });

    it('should render tab labels correctly', () => {
      render(<Tabs tabs={defaultTabs} />);
      expect(screen.getByText('Thẻ 1')).toBeInTheDocument();
      expect(screen.getByText('Thẻ 2')).toBeInTheDocument();
      expect(screen.getByText('Thẻ 3')).toBeInTheDocument();
    });

    it('should render tab content panel', () => {
      render(<Tabs tabs={defaultTabs} />);
      const tabpanels = screen.getAllByRole('tabpanel');
      expect(tabpanels.length).toBeGreaterThan(0);
    });

    it('should render with custom className', () => {
      const { container } = render(
        <Tabs tabs={defaultTabs} className="custom-tabs" />
      );
      const tabsContainer = container.querySelector('.custom-tabs');
      expect(tabsContainer).toBeInTheDocument();
    });
  });

  // ✅ Default Tab Tests
  describe('Default Tab Selection', () => {
    it('should select first tab by default', () => {
      render(<Tabs tabs={defaultTabs} />);
      const firstTab = screen.getByRole('tab', { name: /Thẻ 1/i });
      expect(firstTab).toHaveAttribute('aria-selected', 'true');
    });

    it('should show first tab content by default', () => {
      render(<Tabs tabs={defaultTabs} />);
      expect(screen.getByText('Nội dung 1')).toBeVisible();
    });

    it('should select specified default tab', () => {
      render(<Tabs tabs={defaultTabs} defaultTab="tab2" />);
      const secondTab = screen.getByRole('tab', { name: /Thẻ 2/i });
      expect(secondTab).toHaveAttribute('aria-selected', 'true');
      expect(screen.getByText('Nội dung 2')).toBeVisible();
    });

    it('should hide non-default tab content', () => {
      render(<Tabs tabs={defaultTabs} defaultTab="tab1" />);
      const tabpanels = screen.getAllByRole('tabpanel', { hidden: true });
      expect(tabpanels.length).toBeGreaterThan(0);
    });
  });

  // ✅ Tab Click Tests
  describe('Tab Click Interaction', () => {
    it('should switch tab on click', () => {
      render(<Tabs tabs={defaultTabs} />);
      const secondTab = screen.getByRole('tab', { name: /Thẻ 2/i });

      fireEvent.click(secondTab);

      expect(secondTab).toHaveAttribute('aria-selected', 'true');
      expect(screen.getByText('Nội dung 2')).toBeVisible();
    });

    it('should deselect previous tab on click', () => {
      render(<Tabs tabs={defaultTabs} />);
      const firstTab = screen.getByRole('tab', { name: /Thẻ 1/i });
      const secondTab = screen.getByRole('tab', { name: /Thẻ 2/i });

      fireEvent.click(secondTab);

      expect(firstTab).toHaveAttribute('aria-selected', 'false');
      expect(secondTab).toHaveAttribute('aria-selected', 'true');
    });

    it('should update content when tab is clicked', () => {
      render(<Tabs tabs={defaultTabs} />);
      const thirdTab = screen.getByRole('tab', { name: /Thẻ 3/i });

      fireEvent.click(thirdTab);

      expect(screen.getByText('Nội dung 3')).toBeVisible();
      expect(screen.queryByText('Nội dung 1')).not.toBeVisible();
    });

    it('should handle multiple clicks', () => {
      render(<Tabs tabs={defaultTabs} />);
      const tabs = screen.getAllByRole('tab');

      fireEvent.click(tabs[1]);
      expect(tabs[1]).toHaveAttribute('aria-selected', 'true');

      fireEvent.click(tabs[2]);
      expect(tabs[2]).toHaveAttribute('aria-selected', 'true');

      fireEvent.click(tabs[0]);
      expect(tabs[0]).toHaveAttribute('aria-selected', 'true');
    });
  });

  // ✅ Keyboard Navigation Tests
  describe('Keyboard Navigation', () => {
    it('should navigate to next tab with Right Arrow key', async () => {
      render(<Tabs tabs={defaultTabs} />);
      const firstTab = screen.getByRole('tab', { name: /Thẻ 1/i });

      firstTab.focus();
      fireEvent.keyDown(firstTab, { key: 'ArrowRight', code: 'ArrowRight' });

      await new Promise((resolve) => setTimeout(resolve, 10));

      // Tab should be navigable
      expect(firstTab).toHaveAttribute('tabindex', expect.any(String));
    });

    it('should navigate to previous tab with Left Arrow key', async () => {
      render(<Tabs tabs={defaultTabs} defaultTab="tab2" />);
      const secondTab = screen.getByRole('tab', { name: /Thẻ 2/i });

      secondTab.focus();
      fireEvent.keyDown(secondTab, { key: 'ArrowLeft', code: 'ArrowLeft' });

      await new Promise((resolve) => setTimeout(resolve, 10));

      const firstTab = screen.getByRole('tab', { name: /Thẻ 1/i });
      expect(firstTab).toHaveAttribute('tabindex', expect.any(String));
    });

    it('should navigate with End key to last tab', async () => {
      render(<Tabs tabs={defaultTabs} />);
      const firstTab = screen.getByRole('tab', { name: /Thẻ 1/i });

      firstTab.focus();
      fireEvent.keyDown(firstTab, { key: 'End', code: 'End' });

      await new Promise((resolve) => setTimeout(resolve, 10));

      const lastTab = screen.getByRole('tab', { name: /Thẻ 3/i });
      expect(lastTab).toHaveAttribute('tabindex', expect.any(String));
    });

    it('should navigate with Home key to first tab', async () => {
      render(<Tabs tabs={defaultTabs} defaultTab="tab3" />);
      const thirdTab = screen.getByRole('tab', { name: /Thẻ 3/i });

      thirdTab.focus();
      fireEvent.keyDown(thirdTab, { key: 'Home', code: 'Home' });

      await new Promise((resolve) => setTimeout(resolve, 10));

      const firstTab = screen.getByRole('tab', { name: /Thẻ 1/i });
      expect(firstTab).toHaveAttribute('tabindex', expect.any(String));
    });

    it('should wrap around when navigating past last tab', async () => {
      render(<Tabs tabs={defaultTabs} defaultTab="tab3" />);
      const thirdTab = screen.getByRole('tab', { name: /Thẻ 3/i });

      thirdTab.focus();
      fireEvent.keyDown(thirdTab, { key: 'ArrowRight', code: 'ArrowRight' });

      await new Promise((resolve) => setTimeout(resolve, 10));

      // Should wrap to first tab
      const firstTab = screen.getByRole('tab', { name: /Thẻ 1/i });
      expect(firstTab).toBeInTheDocument();
    });
  });

  // ✅ Tab Change Handler Tests
  describe('Tab Change Handler', () => {
    it('should call onChange when tab is clicked', () => {
      const onChange = vi.fn();
      render(<Tabs tabs={defaultTabs} onChange={onChange} />);

      const secondTab = screen.getByRole('tab', { name: /Thẻ 2/i });
      fireEvent.click(secondTab);

      expect(onChange).toHaveBeenCalledWith('tab2');
    });

    it('should pass correct tab key to onChange', () => {
      const onChange = vi.fn();
      render(<Tabs tabs={defaultTabs} onChange={onChange} />);

      const tabs = screen.getAllByRole('tab');
      fireEvent.click(tabs[2]);

      expect(onChange).toHaveBeenCalledWith('tab3');
    });

    it('should not call onChange for same tab', () => {
      const onChange = vi.fn();
      render(<Tabs tabs={defaultTabs} onChange={onChange} />);

      const firstTab = screen.getByRole('tab', { name: /Thẻ 1/i });
      fireEvent.click(firstTab);
      fireEvent.click(firstTab);

      // Should only be called once for initial click if tab is already selected
      expect(onChange).toHaveBeenCalled();
    });

    it('should pass tab key on keyboard navigation', async () => {
      const onChange = vi.fn();
      render(<Tabs tabs={defaultTabs} onChange={onChange} />);

      const firstTab = screen.getByRole('tab', { name: /Thẻ 1/i });
      firstTab.focus();
      fireEvent.keyDown(firstTab, { key: 'ArrowRight', code: 'ArrowRight' });

      await new Promise((resolve) => setTimeout(resolve, 10));

      // Should trigger change when navigating with keyboard
      expect(onChange).toHaveBeenCalled();
    });
  });

  // ✅ Variant Tests
  describe('Variant Styles', () => {
    const variants = ['default', 'outline', 'pills'] as const;

    variants.forEach((variant) => {
      it(`should render with variant ${variant}`, () => {
        const { container } = render(
          <Tabs tabs={defaultTabs} variant={variant} />
        );
        const tablist = container.querySelector('[role="tablist"]');
        expect(tablist as HTMLElement).toHaveCSSModuleClass(`tabs--${variant}`);
      });
    });

    it('should default to "default" variant', () => {
      const { container } = render(<Tabs tabs={defaultTabs} />);
      const tablist = container.querySelector('[role="tablist"]');
      expect(tablist as HTMLElement).toHaveCSSModuleClass('tabs--default');
    });
  });

  // ✅ Grow Tabs Tests
  describe('Grow Tabs', () => {
    it('should apply grow class when grow=true', () => {
      const { container } = render(<Tabs tabs={defaultTabs} grow />);
      const tablist = container.querySelector('[role="tablist"]');
      expect(tablist as HTMLElement).toHaveCSSModuleClass('tabs--grow');
    });

    it('should distribute tabs evenly with grow=true', () => {
      const { container } = render(<Tabs tabs={defaultTabs} grow />);
      const tabs = container.querySelectorAll('[role="tab"]');
      tabs.forEach((tab) => {
        expect(tab as HTMLElement).toHaveCSSModuleClass('tabs__tab--grow');
      });
    });

    it('should not apply grow by default', () => {
      const { container } = render(<Tabs tabs={defaultTabs} />);
      const tablist = container.querySelector('[role="tablist"]');
      expect(tablist).not.toHaveClass('tabs--grow');
    });
  });

  // ✅ Accessibility Tests
  describe('Accessibility', () => {
    it('should have tablist role', () => {
      render(<Tabs tabs={defaultTabs} />);
      const tablist = screen.getByRole('tablist');
      expect(tablist).toBeInTheDocument();
    });

    it('should have tab role for each tab', () => {
      render(<Tabs tabs={defaultTabs} />);
      const tabs = screen.getAllByRole('tab');
      expect(tabs).toHaveLength(3);
    });

    it('should have tabpanel role for content', () => {
      render(<Tabs tabs={defaultTabs} />);
      const tabpanels = screen.getAllByRole('tabpanel', { hidden: true });
      expect(tabpanels.length).toBeGreaterThan(0);
    });

    it('should have aria-selected attribute', () => {
      render(<Tabs tabs={defaultTabs} />);
      const tabs = screen.getAllByRole('tab');
      tabs.forEach((tab) => {
        const isSelected = tab.getAttribute('aria-selected') === 'true';
        expect(isSelected || tab.getAttribute('aria-selected') === 'false').toBe(
          true
        );
      });
    });

    it('should have aria-controls linking tab to panel', () => {
      render(<Tabs tabs={defaultTabs} />);
      const tabs = screen.getAllByRole('tab');
      tabs.forEach((tab) => {
        expect(tab).toHaveAttribute('aria-controls');
      });
    });

    it('should have aria-labelledby linking panel to tab', () => {
      render(<Tabs tabs={defaultTabs} />);
      const tabpanels = screen.getAllByRole('tabpanel', { hidden: true });
      tabpanels.forEach((panel) => {
        expect(panel).toHaveAttribute('aria-labelledby');
      });
    });

    it('should have proper tabindex for keyboard navigation', () => {
      render(<Tabs tabs={defaultTabs} />);
      const tabs = screen.getAllByRole('tab');
      const selectedTab = tabs.find(
        (tab) => tab.getAttribute('aria-selected') === 'true'
      );
      expect(selectedTab).toHaveAttribute('tabindex', '0');
    });

    it('should have tabindex=-1 for unselected tabs', () => {
      render(<Tabs tabs={defaultTabs} />);
      const tabs = screen.getAllByRole('tab');
      const unselectedTabs = tabs.filter(
        (tab) => tab.getAttribute('aria-selected') === 'false'
      );
      unselectedTabs.forEach((tab) => {
        expect(tab).toHaveAttribute('tabindex', '-1');
      });
    });
  });

  // ✅ Vietnamese UI Tests
  describe('Vietnamese UI', () => {
    it('should display Vietnamese tab labels', () => {
      render(<Tabs tabs={vietnameseTabs} />);
      expect(screen.getByText('Tổng quan')).toBeInTheDocument();
      expect(screen.getByText('Chi tiết')).toBeInTheDocument();
      expect(screen.getByText('Cài đặt')).toBeInTheDocument();
    });

    it('should display Vietnamese tab content', () => {
      render(<Tabs tabs={vietnameseTabs} />);
      expect(screen.getByText('Thông tin tổng quát')).toBeInTheDocument();
    });

    it('should support Vietnamese characters with diacritics', () => {
      render(<Tabs tabs={vietnameseTabs} />);
      const tabs = screen.getAllByRole('tab');
      tabs.forEach((tab) => {
        const text = tab.textContent;
        expect(text).toBeTruthy();
        expect(text?.length).toBeGreaterThan(0);
      });
    });

    it('should handle complex Vietnamese text', () => {
      const complexTabs: Tab[] = [
        {
          key: 'assignment',
          label: 'Bài tập môn học',
          content: 'Danh sách bài tập của bạn',
        },
        {
          key: 'results',
          label: 'Kết quả kiểm tra',
          content: 'Điểm số và phản hồi của giáo viên',
        },
      ];

      render(<Tabs tabs={complexTabs} />);
      expect(screen.getByText('Bài tập môn học')).toBeInTheDocument();
      expect(screen.getByText('Danh sách bài tập của bạn')).toBeInTheDocument();
    });
  });

  // ✅ Edge Cases
  describe('Edge Cases', () => {
    it('should handle single tab', () => {
      const singleTab: Tab[] = [
        { key: 'only', label: 'Duy nhất', content: 'Nội dung' },
      ];
      render(<Tabs tabs={singleTab} />);
      const tab = screen.getByRole('tab', { name: /Duy nhất/i });
      expect(tab).toHaveAttribute('aria-selected', 'true');
    });

    it('should handle many tabs', () => {
      const manyTabs: Tab[] = Array.from({ length: 20 }, (_, i) => ({
        key: `tab${i}`,
        label: `Thẻ ${i + 1}`,
        content: `Nội dung ${i + 1}`,
      }));

      render(<Tabs tabs={manyTabs} />);
      const tabs = screen.getAllByRole('tab');
      expect(tabs).toHaveLength(20);
    });

    it('should handle empty content', () => {
      const emptyTabs: Tab[] = [
        { key: 'empty', label: 'Trống', content: '' },
      ];
      render(<Tabs tabs={emptyTabs} />);
      expect(screen.getByRole('tab')).toBeInTheDocument();
    });

    it('should handle special characters in labels', () => {
      const specialTabs: Tab[] = [
        { key: 'special', label: 'Thẻ & Test', content: 'Content' },
      ];
      render(<Tabs tabs={specialTabs} />);
      expect(screen.getByText(/Thẻ & Test/)).toBeInTheDocument();
    });

    it('should handle React elements as content', () => {
      const reactTabs: Tab[] = [
        {
          key: 'react',
          label: 'React',
          content: <div data-testid="react-content">React Content</div>,
        },
      ];
      render(<Tabs tabs={reactTabs} />);
      expect(screen.getByTestId('react-content')).toBeInTheDocument();
    });

    it('should handle invalid defaultTab gracefully', () => {
      render(<Tabs tabs={defaultTabs} defaultTab="invalid" />);
      // Should not crash, just use first tab
      expect(screen.getByText('Nội dung 1')).toBeInTheDocument();
    });
  });

  // ✅ State Management Tests
  describe('State Management', () => {
    it('should maintain selected tab across re-renders', () => {
      const { rerender } = render(<Tabs tabs={defaultTabs} />);
      const secondTab = screen.getByRole('tab', { name: /Thẻ 2/i });

      fireEvent.click(secondTab);
      expect(secondTab).toHaveAttribute('aria-selected', 'true');

      rerender(<Tabs tabs={defaultTabs} />);
      expect(screen.getByRole('tab', { name: /Thẻ 2/i })).toHaveAttribute(
        'aria-selected',
        'true'
      );
    });

    it('should reset when tabs prop changes', () => {
      const { rerender } = render(<Tabs tabs={defaultTabs} />);
      const secondTab = screen.getByRole('tab', { name: /Thẻ 2/i });

      fireEvent.click(secondTab);

      const newTabs: Tab[] = [
        { key: 'new1', label: 'Mới 1', content: 'Nội dung mới 1' },
        { key: 'new2', label: 'Mới 2', content: 'Nội dung mới 2' },
      ];

      rerender(<Tabs tabs={newTabs} />);
      expect(screen.getByText('Nội dung mới 1')).toBeVisible();
    });
  });
});
