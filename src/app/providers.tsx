'use client';

import { AppProvider } from '@/context/AppContext';
import { AuthProvider } from '@/context/AuthContext';
import { InteractionsProvider } from '@/context/InteractionsContext';
import { NavigationLoader } from '@/components/layout/NavigationLoader';
import { Sidebar } from '@/components/layout/Sidebar';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AppProvider>
      <AuthProvider>
        <InteractionsProvider>
          <NavigationLoader />
          {children}
          {/* Rendered once, outside any single page's tree, so it survives route
              changes instead of unmounting/resetting whenever the page under it
              (which may or may not use AppShell) swaps out. */}
          <Sidebar />
        </InteractionsProvider>
      </AuthProvider>
    </AppProvider>
  );
}
