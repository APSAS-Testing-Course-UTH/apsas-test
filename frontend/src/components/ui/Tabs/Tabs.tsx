/**
 * Tabs Component
 * Accessible tabbed interface with keyboard navigation
 */

import { useState, useCallback, useEffect } from 'react';
import type { TabsProps } from '@/components/types';
import styles from './Tabs.module.css';

/**
 * Tabs - Tabbed interface component
 *
 * Features:
 * - Full keyboard navigation (Arrow keys, Home, End)
 * - ARIA attributes for accessibility
 * - Vietnamese labels support
 * - Multiple variants (default, outline, pills)
 * - Responsive design
 *
 * @example
 * ```tsx
 * const tabs = [
 *   { key: 'tab1', label: 'Tổng quan', content: 'Nội dung 1' },
 *   { key: 'tab2', label: 'Chi tiết', content: 'Nội dung 2' },
 * ];
 *
 * <Tabs
 *   tabs={tabs}
 *   defaultTab="tab1"
 *   onChange={(key) => console.log('Tab changed:', key)}
 * />
 * ```
 */
export function Tabs({
  tabs,
  defaultTab,
  onChange,
  variant = 'default',
  grow = false,
  className,
}: TabsProps) {
  // Initialize selected tab
  const initialTab =
    defaultTab && tabs.some((t) => t.key === defaultTab)
      ? defaultTab
      : tabs[0]?.key || '';

  const [selectedTab, setSelectedTab] = useState<string>(initialTab);

  // Reset selected tab when tabs prop changes
  useEffect(() => {
    const newTab =
      defaultTab && tabs.some((t) => t.key === defaultTab)
        ? defaultTab
        : tabs[0]?.key || '';
    setSelectedTab(newTab);
  }, [tabs, defaultTab]);

  // Handle tab click
  const handleTabClick = useCallback(
    (key: string) => {
      setSelectedTab(key);
      onChange?.(key);
    },
    [onChange]
  );

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLButtonElement>) => {
      const currentIndex = tabs.findIndex((t) => t.key === selectedTab);

      let newIndex: number | null = null;

      switch (e.key) {
        case 'ArrowRight':
        case 'ArrowDown':
          e.preventDefault();
          newIndex =
            currentIndex === tabs.length - 1 ? 0 : currentIndex + 1;
          break;

        case 'ArrowLeft':
        case 'ArrowUp':
          e.preventDefault();
          newIndex =
            currentIndex === 0 ? tabs.length - 1 : currentIndex - 1;
          break;

        case 'Home':
          e.preventDefault();
          newIndex = 0;
          break;

        case 'End':
          e.preventDefault();
          newIndex = tabs.length - 1;
          break;

        default:
          break;
      }

      if (newIndex !== null && tabs[newIndex]) {
        const newKey = tabs[newIndex].key;
        setSelectedTab(newKey);
        onChange?.(newKey);

        // Focus the newly selected tab for better UX
        setTimeout(() => {
          const button = document.querySelector(
            `[role="tab"][data-tab-key="${newKey}"]`
          ) as HTMLButtonElement;
          button?.focus();
        }, 0);
      }
    },
    [tabs, selectedTab, onChange]
  );

  const tablistClass = `${styles.tabs} ${styles[`tabs--${variant}`]} ${
    grow ? styles['tabs--grow'] : ''
  } ${className || ''}`;

  return (
    <div>
      {/* Tab buttons */}
      <div
        role="tablist"
        className={tablistClass}
        aria-label="Các thẻ"
      >
        {tabs.map((tab) => {
          const isSelected = tab.key === selectedTab;

          return (
            <button
              key={tab.key}
              role="tab"
              data-tab-key={tab.key}
              aria-selected={isSelected}
              aria-controls={`${tab.key}-panel`}
              tabIndex={isSelected ? 0 : -1}
              className={`${styles.tabs__tab} ${
                isSelected ? styles['tabs__tab--active'] : ''
              } ${grow ? styles['tabs__tab--grow'] : ''}`}
              onClick={() => handleTabClick(tab.key)}
              onKeyDown={handleKeyDown}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab panels */}
      <div className={styles.tabs__panels}>
        {tabs.map((tab) => {
          const isSelected = tab.key === selectedTab;

          return (
            <div
              key={`${tab.key}-panel`}
              role="tabpanel"
              id={`${tab.key}-panel`}
              aria-labelledby={tab.key}
              hidden={!isSelected}
              className={`${styles.tabs__panel} ${
                isSelected ? styles['tabs__panel--active'] : ''
              }`}
            >
              {tab.content}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Tabs;