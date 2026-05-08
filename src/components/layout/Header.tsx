'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Search, User, Menu } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { MapleLeaf } from '@/components/news/MapleLeaf';
import { Badge } from '@/components/news/Badge';
import { clsx } from 'clsx';

interface HeaderProps {
  onMenuToggle: () => void;
}

const PRIMARY_NAV = [
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
    <header className="fixed top-0 left-0 right-0 z-50 w-full font-sans">
      {/* Skip link target — visually hidden, referenced by layout.tsx skip link */}

      {/* ── Main Red Bar ── */}
      <div className="bg-canadaRed text-white">
        <div className="max-w-[1400px] mx-auto px-4 h-[72px] flex items-center justify-between gap-4">

          {/* Left: hamburger (mobile) + Logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={onMenuToggle}
              className="lg:hidden text-white p-1 -ml-1 hover:text-white/80 transition-colors flex-shrink-0"
              aria-label="Open navigation menu"
            >
              <Menu className="w-7 h-7" />
            </button>
            <Link
              href="/"
              className="flex items-center gap-3 cursor-pointer flex-shrink-0"
              aria-label="Canada News — home"
            >
              <MapleLeaf className="w-10 h-10 flex-shrink-0" />
              <span className="font-display font-black text-3xl tracking-tight text-white mt-0.5 leading-none">
                CANADA NEWS
              </span>
            </Link>
          </div>

          {/* Center: Primary nav (xl+ only) */}
          <nav
            className="hidden xl:flex items-center gap-5 text-[13px] font-bold tracking-wide"
            aria-label="Primary navigation"
          >
            {PRIMARY_NAV.map(({ href, label }) => {
              const isActive = pathname === href || pathname.startsWith(href + '/');
              return (
                <Link
                  key={href}
                  href={href}
                  aria-current={isActive ? 'page' : undefined}
                  className={clsx(
                    'hover:text-white/70 transition-colors whitespace-nowrap',
                    isActive && 'underline underline-offset-4 decoration-1',
                  )}
                >
                  {label}
                </Link>
              );
            })}
          </nav>

          {/* Right: actions */}
          <div className="flex items-center gap-3 flex-shrink-0">
            {/* Dark mode toggle — desktop only */}
            <button
              onClick={toggleDarkMode}
              className="hidden lg:flex items-center text-white/80 hover:text-white transition-colors"
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
              className="hidden md:flex items-center text-white hover:text-white/70 transition-colors p-1"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>

            <Link
              href="/auth/email"
              className="bg-white text-canadaRed text-[13px] font-bold px-4 py-2 rounded-sm tracking-wide hover:bg-gray-100 transition-colors whitespace-nowrap"
            >
              SUBSCRIBE
            </Link>

            <Link
              href="/auth/email"
              className="text-white hover:text-white/70 transition-colors"
              aria-label="Sign in or account"
            >
              <User className="w-6 h-6" />
            </Link>
          </div>
        </div>
      </div>

      {/* ── Secondary Topic Nav (white bar) ── */}
      <nav
        className="bg-white dark:bg-[#1A1A1A] border-b border-gray-300 dark:border-[#2A2A2A]"
        aria-label="Topic navigation"
      >
        <div className="max-w-[1400px] mx-auto px-4 h-12 flex items-center gap-6 overflow-x-auto whitespace-nowrap scrollbar-hide text-[14px] font-medium">
          <Link
            href="/"
            className="flex items-center gap-2 cursor-pointer group flex-shrink-0"
          >
            <Badge type="live" />
            <span className="group-hover:underline font-bold text-gray-900 dark:text-white decoration-1 underline-offset-2">
              Breaking News
            </span>
          </Link>
          {SECONDARY_NAV.map(({ href, label }) => (
            <Link
              key={label}
              href={href}
              className="hover:text-canadaRed hover:underline transition-colors flex-shrink-0 text-gray-700 dark:text-[#CCC] decoration-1 underline-offset-2"
            >
              {label}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}
