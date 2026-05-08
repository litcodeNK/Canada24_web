'use client';

import { AppProvider } from '@/context/AppContext';
import { AuthProvider } from '@/context/AuthContext';
import { InteractionsProvider } from '@/context/InteractionsContext';
import { NavigationLoader } from '@/components/layout/NavigationLoader';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AppProvider>
      <AuthProvider>
        <InteractionsProvider>
          <NavigationLoader />
          {children}
        </InteractionsProvider>
      </AuthProvider>
    </AppProvider>
  );
}
