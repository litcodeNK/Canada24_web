'use client';

import { useState } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';
import { Footer } from './Footer';
import { OfflineScreen } from './OfflineScreen';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';

export function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isOnline = useOnlineStatus();

  if (!isOnline) return <OfflineScreen />;

  return (
    <>
      <Header onMenuToggle={() => setSidebarOpen(true)} />
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/*
        Header height: 72px red bar + 48px secondary nav = 120px desktop
        Mobile: 72px red bar + 48px secondary nav = 120px (secondary nav visible on mobile too)
        Bottom nav: 80px on mobile, hidden on desktop
      */}
      <main
        id="main-content"
        className="pt-[160px] sm:pt-[200px] pb-20 lg:pb-0 min-h-screen bg-white dark:bg-[#0D0D0D]"
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
