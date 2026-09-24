'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { Search, User, Menu } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import { clsx } from 'clsx';
import { SECTION_NAV } from '@/lib/nav';

interface HeaderProps {
  onMenuToggle: () => void;
}


function MapleLeaf({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 512 512" aria-hidden="true" className={className} fill="currentColor">
      <path d="M256 32l-38 76c-4 8-13 12-22 10l-47-10 21 92c2 9-3 18-12 21l-30 10 96 82c7 6 10 15 7 24l-12 38 90-8c9-1 17 6 17 15l-4 88h32l-4-88c0-9 8-16 17-15l90 8-12-38c-3-9 0-18 7-24l96-82-30-10c-9-3-14-12-12-21l21-92-47 10c-9 2-18-2-22-10l-38-76z" />
    </svg>
  );
}

export function Header({ onMenuToggle }: HeaderProps) {
  const { darkMode, toggleDarkMode } = useApp();
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full font-sans">
      <div className="bg-navy text-white">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 h-[64px] sm:h-[76px] flex items-center gap-4">

          {/* Hamburger (mobile) */}
          <button
            onClick={onMenuToggle}
            className="lg:hidden text-white p-1 -ml-1 hover:text-canadaRed transition-colors flex-shrink-0"
            aria-label="Open navigation menu"
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* Wordmark + tagline */}
          <Link href="/" className="flex items-center gap-3 flex-shrink-0 group" aria-label="Canada 24/7 — home">
            <MapleLeaf className="w-7 h-7 sm:w-9 sm:h-9 text-canadaRed flex-shrink-0" />
            <span className="font-black italic tracking-tight text-[30px] sm:text-[40px] leading-none select-none">
              24/7
            </span>
          </Link>

          <span className="hidden md:block text-[12px] lg:text-[13px] text-white/70 leading-tight flex-shrink-0">
            The Newcomer&apos;s News Network • Live 24/7
          </span>

          <div className="flex-1" />

          {/* Primary nav */}
          <nav
            className="hidden lg:flex items-center gap-1 text-[11.5px] xl:text-[12.5px] font-bold tracking-wide"
            aria-label="Primary navigation"
          >
            {SECTION_NAV.map(item => {
              if (item.href === null) {
                return (
                  <span
                    key={item.label}
                    title="Coming soon"
                    className="px-2.5 xl:px-3 py-2 flex items-center gap-1.5 text-white/40 cursor-default whitespace-nowrap"
                  >
                    {item.label.toUpperCase()}
                    <span className="text-[8.5px] font-bold uppercase tracking-wider border border-white/25 rounded px-1 py-px leading-none">
                      Soon
                    </span>
                  </span>
                );
              }

              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={isActive ? 'page' : undefined}
                  className={clsx(
                    'px-2.5 xl:px-3 py-2 hover:text-canadaRed transition-colors whitespace-nowrap',
                    isActive && 'text-canadaRed',
                  )}
                >
                  {item.label.toUpperCase()}
                </Link>
              );
            })}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            <button
              onClick={toggleDarkMode}
              className="hidden md:flex items-center text-white/70 hover:text-white transition-colors p-2"
              aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {darkMode ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
              )}
            </button>

            <button
              onClick={() => router.push('/search')}
              className="flex items-center text-white/80 hover:text-white transition-colors p-2"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>

            <Link
              href="/profile"
              className="flex items-center text-white/80 hover:text-white transition-colors p-2"
              aria-label={user ? `${user.displayName || user.email} — Profile` : 'Profile / Sign in'}
            >
              {user && user.avatar ? (
                <Image
                  src={user.avatar}
                  alt={user.displayName || user.email}
                  width={24}
                  height={24}
                  className="w-6 h-6 rounded-full object-cover"
                />
              ) : user ? (
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[11px] font-bold select-none"
                  style={{ backgroundColor: '#D52B1E' }}
                >
                  {(user.displayName?.[0] ?? user.email[0]).toUpperCase()}
                </div>
              ) : (
                <User className="w-5 h-5" />
              )}
            </Link>

            <button
              onClick={onMenuToggle}
              className="hidden lg:flex items-center text-white/80 hover:text-white transition-colors p-2"
              aria-label="Open navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
