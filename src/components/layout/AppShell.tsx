'use client';

import { Header } from './Header';
import { BottomNav } from './BottomNav';
import { Footer } from './Footer';
import { OfflineScreen } from './OfflineScreen';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { useApp } from '@/context/AppContext';

export function AppShell({ children }: { children: React.ReactNode }) {
  const { openSidebar } = useApp();
  const isOnline = useOnlineStatus();

  if (!isOnline) return <OfflineScreen />;

  return (
    <>
      <Header onMenuToggle={openSidebar} />

      {/* Top padding = fixed header height (64px mobile, 76px sm+); keep in sync with Header.tsx. */}
      <main
        id="main-content"
        className="pt-[64px] sm:pt-[76px] pb-20 lg:pb-0 min-h-screen bg-white dark:bg-[#0D0D0D]"
      >
        {children}
        <Footer />
      </main>

      {/* Bottom nav: mobile only */}
      <div className="lg:hidden">
        <BottomNav />
      </div>
    </>
  );
}
