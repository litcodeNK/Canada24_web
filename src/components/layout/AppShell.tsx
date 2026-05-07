'use client';

import { useState } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';
import { Footer } from './Footer';

export function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      <Header onMenuToggle={() => setSidebarOpen(true)} />
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/*
        On desktop (lg+): header is 14px top bar + 42px secondary nav = ~108px total
        On mobile: header is 56px top bar only (secondary nav hidden)
        Bottom nav: 64px on mobile, hidden on desktop
      */}
      <main className="pt-[56px] lg:pt-[108px] pb-16 lg:pb-0 min-h-screen bg-white dark:bg-[#0D0D0D]">
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
