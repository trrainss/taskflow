import { Toaster } from 'react-hot-toast';
import type { ReactNode } from 'react';

export function ToastProvider({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          className: 'text-sm',
          style: {
            background: 'var(--toast-bg, #fff)',
            color: 'var(--toast-fg, #1f2937)',
          },
        }}
      />
    </>
  );
}
