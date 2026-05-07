'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { clsx } from 'clsx';

interface HeaderProps {
  onMenuToggle: () => void;
}

const NAV_LINKS = [
  { href: '/', label: 'TOP STORIES' },
  { href: '/local', label: 'LOCAL' },
  { href: '/sections/politics', label: 'POLITICS' },
  { href: '/sections/business', label: 'BUSINESS' },
  { href: '/sections/health', label: 'HEALTH' },
  { href: '/sections/sports', label: 'SPORTS' },
  { href: '/sections/technology', label: 'TECH' },
  { href: '/sections/world', label: 'WORLD' },
  { href: '/sections/entertainment', label: 'ENTERTAINMENT' },
  { href: '/sections/immigration', label: 'IMMIGRATION' },
];

export function Header({ onMenuToggle }: HeaderProps) {
  const { darkMode, toggleDarkMode } = useApp();
  const router = useRouter();
  const pathname = usePathname();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-[#1A1A1A] shadow-sm">
      {/* Top bar: logo + search */}
      <div className="border-b border-[#E8E8E8] dark:border-[#2A2A2A]">
        <div className="max-w-[1180px] mx-auto px-4 h-14 flex items-center gap-4">
          {/* Hamburger — visible on all screens but only functionally used on mobile */}
          <button
            onClick={onMenuToggle}
            className="lg:hidden text-[#1a1a1a] dark:text-[#F5F5F5] p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-[#2A2A2A] rounded transition-colors flex-shrink-0"
            aria-label="Toggle menu"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 flex-shrink-0">
            <div className="w-8 h-8 bg-[#D52B1E] flex items-center justify-center">
              <span className="bebas text-white text-base leading-none">C</span>
            </div>
            <span className="bebas text-[#1a1a1a] dark:text-white text-2xl tracking-[0.1em]">CANADA 247</span>
          </Link>

          {/* Tagline — desktop only */}
          <span className="hidden md:block text-[11px] text-[#999] font-medium tracking-wider uppercase border-l border-[#E8E8E8] dark:border-[#333] pl-3 ml-1">
            Canada in Real Time
          </span>

          <div className="flex-1" />

          {/* Dark mode toggle — desktop */}
          <button
            onClick={toggleDarkMode}
            className="hidden lg:flex items-center gap-1.5 text-[#999] hover:text-[#1a1a1a] dark:hover:text-white transition-colors text-xs"
            aria-label="Toggle dark mode"
          >
            {darkMode ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
            )}
          </button>

          {/* Search */}
          <button
            onClick={() => router.push('/search')}
            className="flex items-center gap-2 text-[#1a1a1a] dark:text-[#F5F5F5] hover:text-[#D52B1E] dark:hover:text-[#D52B1E] transition-colors p-2"
            aria-label="Search"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <span className="hidden lg:inline text-sm font-medium">Search</span>
          </button>

          {/* Auth link — desktop */}
          <Link
            href="/auth/email"
            className="hidden lg:flex items-center gap-1 text-sm font-medium text-[#1a1a1a] dark:text-white hover:text-[#D52B1E] transition-colors"
          >
            Sign In
          </Link>
        </div>
      </div>

      {/* Secondary category nav — desktop only */}
      <nav className="hidden lg:block bg-white dark:bg-[#1A1A1A] border-b border-[#E8E8E8] dark:border-[#2A2A2A]">
        <div className="max-w-[1180px] mx-auto px-4">
          <div className="flex items-center gap-0 overflow-x-auto scrollbar-hide">
            {NAV_LINKS.map(({ href, label }) => {
              const isActive = href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(href + '/');
              return (
                <Link
                  key={href}
                  href={href}
                  className={clsx(
                    'flex-shrink-0 px-3.5 py-3 text-[13px] font-semibold tracking-wide whitespace-nowrap transition-colors border-b-2',
                    isActive
                      ? 'border-[#D52B1E] text-[#D52B1E]'
                      : 'border-transparent text-[#3a3a3a] dark:text-[#CCC] hover:text-[#D52B1E] dark:hover:text-[#D52B1E]',
                  )}
                >
                  {label}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
    </header>
  );
}
