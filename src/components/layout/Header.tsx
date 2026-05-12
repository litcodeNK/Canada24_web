'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { Search, User, Menu } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Badge } from '@/components/news/Badge';
import { clsx } from 'clsx';

interface HeaderProps {
  onMenuToggle: () => void;
}

const PRIMARY_NAV = [
  { href: '/videos', label: 'VIDEOS' },
  { href: '/sections/politics', label: 'POLITICS' },
  { href: '/sections/business', label: 'BUSINESS' },
  { href: '/sections/world', label: 'WORLD' },
  { href: '/sections/health', label: 'HEALTH' },
  { href: '/sections/sports', label: 'SPORTS' },
  { href: '/sections/technology', label: 'TECHNOLOGY' },
  { href: '/sections/entertainment', label: 'ENTERTAINMENT' },
];

const SECONDARY_NAV = [
  { href: '/sections/immigration', label: 'Immigration' },
  { href: '/sections/aviation', label: 'Aviation' },
  { href: '/sections/indigenous', label: 'Indigenous' },
  { href: '/local', label: 'Events' },
  { href: '/sections/auto news', label: 'Auto News' },
  { href: '/sections/blacks in canada', label: 'Blacks in Canada' },
  { href: '/sections/education', label: 'Education in Canada' },
  { href: '/local', label: 'Opportunities' },
];

export function Header({ onMenuToggle }: HeaderProps) {
  const { darkMode, toggleDarkMode } = useApp();
  const router = useRouter();
  const pathname = usePathname();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full font-sans shadow-sm">

      {/* ── Top White Bar: Logo + Actions ── */}
      <div className="bg-white dark:bg-[#1A1A1A] border-b border-gray-200 dark:border-[#2A2A2A]">
        <div className="max-w-[1400px] mx-auto px-4 h-[80px] sm:h-[120px] flex items-center justify-between gap-4">

          {/* Left: hamburger (mobile) + Logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={onMenuToggle}
              className="lg:hidden text-[#1a1a1a] dark:text-white p-1 -ml-1 hover:text-canadaRed transition-colors flex-shrink-0"
              aria-label="Open navigation menu"
            >
              <Menu className="w-6 h-6" />
            </button>

            <Link
              href="/"
              className="flex items-center gap-3 flex-shrink-0"
              aria-label="Canada 247 — home"
            >
              <div className="h-[44px] w-[110px] sm:h-[56px] sm:w-[140px] rounded-full overflow-hidden flex-shrink-0">
                <Image
                  src="/canada247-logo.jpg"
                  alt="Canada 247"
                  width={140}
                  height={56}
                  className="w-full h-full object-cover"
                  priority
                />
              </div>
              <div className="hidden sm:block border-l-2 border-canadaRed pl-5">
                <span className="block text-[22px] sm:text-[42px] font-black tracking-[0.08em] text-canadaRed uppercase leading-none">
                  CANADA IN REAL TIME
                </span>
              </div>
            </Link>
          </div>

          {/* Right: actions */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            {/* Dark mode toggle */}
            <button
              onClick={toggleDarkMode}
              className="hidden md:flex items-center text-gray-500 dark:text-gray-400 hover:text-canadaRed transition-colors p-1.5"
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
              className="flex items-center text-gray-600 dark:text-gray-300 hover:text-canadaRed transition-colors p-1.5"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>

            <Link
              href="/profile"
              className="hidden sm:flex items-center gap-1.5 text-gray-600 dark:text-gray-300 hover:text-canadaRed transition-colors p-1.5 text-sm font-medium"
              aria-label="Profile / Sign in"
            >
              <User className="w-5 h-5" />
              <span className="hidden lg:inline">Sign In</span>
            </Link>

            <Link
              href="/subscribe"
              className="hidden sm:flex bg-canadaRed text-white text-[12px] font-bold px-4 py-2 rounded-sm tracking-wide hover:bg-canadaRedDark transition-colors whitespace-nowrap"
            >
              SUBSCRIBE
            </Link>
          </div>
        </div>
      </div>

      {/* ── Red Primary Nav Bar ── */}
      <nav
        className="bg-canadaRed text-white"
        aria-label="Primary navigation"
      >
        <div className="max-w-[1400px] mx-auto px-4 h-10 flex items-center justify-between gap-4">
          {/* Primary nav links — xl+ */}
          <div className="hidden xl:flex items-center gap-1 text-[12px] font-bold tracking-wide h-full overflow-x-auto scrollbar-hide">
            {PRIMARY_NAV.map(({ href, label }) => {
              const isActive = pathname === href || pathname.startsWith(href + '/');
              return (
                <Link
                  key={href}
                  href={href}
                  aria-current={isActive ? 'page' : undefined}
                  className={clsx(
                    'px-3 h-full flex items-center hover:bg-white/10 transition-colors whitespace-nowrap',
                    isActive && 'bg-white/20 underline underline-offset-4 decoration-1',
                  )}
                >
                  {label}
                </Link>
              );
            })}
          </div>

          {/* Mobile: show all sections scrollable */}
          <div className="xl:hidden flex items-center gap-1 text-[12px] font-bold tracking-wide h-full overflow-x-auto scrollbar-hide flex-1">
            {PRIMARY_NAV.map(({ href, label }) => {
              const isActive = pathname === href || pathname.startsWith(href + '/');
              return (
                <Link
                  key={href}
                  href={href}
                  aria-current={isActive ? 'page' : undefined}
                  className={clsx(
                    'px-3 h-full flex items-center hover:bg-white/10 transition-colors whitespace-nowrap flex-shrink-0',
                    isActive && 'bg-white/20',
                  )}
                >
                  {label}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* ── White Secondary Topic Bar ── */}
      <nav
        className="bg-white dark:bg-[#1A1A1A] border-b border-gray-300 dark:border-[#2A2A2A]"
        aria-label="Topic navigation"
      >
        <div className="max-w-[1400px] mx-auto px-4 h-10 flex items-center gap-5 overflow-x-auto whitespace-nowrap scrollbar-hide text-[13px] font-medium">
          <Link href="/" className="flex items-center gap-2 group flex-shrink-0">
            <Badge type="live" />
            <span className="font-bold text-gray-900 dark:text-white group-hover:text-canadaRed group-hover:underline transition-colors decoration-1 underline-offset-2">
              Breaking News
            </span>
          </Link>
          {SECONDARY_NAV.map(({ href, label }) => (
            <Link
              key={label}
              href={href}
              className="hover:text-canadaRed hover:underline transition-colors flex-shrink-0 text-gray-600 dark:text-[#CCC] decoration-1 underline-offset-2"
            >
              {label}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}
