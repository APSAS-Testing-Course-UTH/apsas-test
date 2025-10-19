import { vi } from 'vitest';
import { render } from '@testing-library/react';
import type { RenderOptions } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactElement } from 'react';

// Mock window methods for Mantine
Object.defineProperty(window, 'addEventListener', {
  writable: true,
  value: vi.fn(),
});

Object.defineProperty(window, 'removeEventListener', {
  writable: true,
  value: vi.fn(),
});

Object.defineProperty(window, 'clearTimeout', {
  writable: true,
  value: vi.fn(),
});

Object.defineProperty(window, 'setTimeout', {
  writable: true,
  value: vi.fn(() => 1),
});

// Mock localStorage for Mantine color scheme
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: vi.fn(() => null),
    setItem: vi.fn(),
    removeItem: vi.fn(),
  },
  writable: true,
});

// Create a custom render function that includes providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <MantineProvider
        theme={{
          // Disable focus ring for testing
          focusRing: 'never',
        }}
        defaultColorScheme="light"
      >
        {children}
      </MantineProvider>
    </QueryClientProvider>
  );
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => render(ui, { wrapper: AllTheProviders, ...options });

export * from '@testing-library/react';
export { customRender as render };