import { render } from '@testing-library/react';
import type { RenderOptions } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactElement } from 'react';
import { beforeEach } from 'vitest';

// Mock localStorage for testing
beforeEach(() => {
  // Set mock instructor token in localStorage (key matches test/setup.ts)
  localStorage.setItem('apsas_token', 'instructor-token');
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