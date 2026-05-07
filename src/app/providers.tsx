'use client';

import { AppProvider } from '@/context/AppContext';
import { AuthProvider } from '@/context/AuthContext';
import { InteractionsProvider } from '@/context/InteractionsContext';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AppProvider>
      <AuthProvider>
        <InteractionsProvider>
          {children}
        </InteractionsProvider>
      </AuthProvider>
    </AppProvider>
  );
}
