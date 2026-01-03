'use client';

import { ReactNode } from 'react';
import { QueryProvider } from './QueryProvider';
import { ToastProvider } from '@/components/ui/Toast';

/**
 * Application Providers
 *
 * Wraps the application with all necessary providers.
 * Add new providers here as needed.
 */
export function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryProvider>
      <ToastProvider>
        {children}
      </ToastProvider>
    </QueryProvider>
  );
}
