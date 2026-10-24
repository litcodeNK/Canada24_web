'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Search, User, Menu, X, ChevronDown } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import { clsx } from 'clsx';
import { SECTION_NAV, topicHref } from '@/lib/nav';
import { SearchModal } from './SearchModal';
import { Logo } from '@/components/brand/Logo';
import { FloatingBubbles } from '@/components/ui/FloatingBubbles';

interface HeaderProps {
  onMenuToggle: () => void;
}


export function Header({ onMenuToggle }: HeaderProps) {
  const { darkMode, toggleDarkMode, sidebarOpen, closeSidebar } = useApp();
  // The hamburger doubles as the close button while the menu is open.
  const handleMenu = sidebarOpen ? closeSidebar : onMenuToggle;
  const MenuIcon = sidebarOpen ? X : Menu;
  const { user, isAuthLoading } = useAuth();
  const [searchOpen, setSearchOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
    <header className="fixed top-0 left-0 right-0 z-50 w-full font-sans">
      <div className="relative bg-gradient-to-r from-navy via-[#12306a] to-navy text-white">
        <FloatingBubbles variant="header" />
        <div className="c247-shimmer-line absolute bottom-0 left-0 right-0 z-10" aria-hidden="true" />
        <div className="relative z-10 max-w-[1400px] mx-auto px-4 sm:px-6 h-[64px] sm:h-[76px] flex items-center gap-4">

          {/* Hamburger (mobile) */}
          <button
            onClick={handleMenu}
            className="lg:hidden text-white p-1 -ml-1 hover:text-canadaRed transition-colors flex-shrink-0"
            aria-label={sidebarOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={sidebarOpen}
          >
            <MenuIcon className="w-6 h-6" />
          </button>

          {/* Wordmark + tagline */}
          <Link href="/" className="flex items-center flex-shrink-0" aria-label="Canada 247 — home">
            <Logo surface="onDark" priority className="h-[46px] sm:h-[58px]" />
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
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              const linkClass = clsx(
                'px-2.5 xl:px-3 py-2 hover:text-canadaRed transition-colors whitespace-nowrap inline-flex items-center gap-1',
                isActive && 'text-canadaRed',
              );
              if (!item.topics?.length) {
                return (
                  <Link key={item.href} href={item.href} aria-current={isActive ? 'page' : undefined} className={linkClass}>
                    {item.label.toUpperCase()}
                  </Link>
                );
              }
              return (
                <div key={item.href} className="relative group">
                  <Link href={item.href} aria-current={isActive ? 'page' : undefined} aria-haspopup="true" className={linkClass}>
                    {item.label.toUpperCase()}
                    <ChevronDown className="w-3.5 h-3.5 transition-transform group-hover:rotate-180 group-focus-within:rotate-180" />
                  </Link>
                  <div className="invisible opacity-0 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100 transition-opacity duration-150 absolute left-0 top-full min-w-[210px] pt-1">
                    <ul className="bg-[#0b1a3a] border-t-2 border-canadaRed shadow-xl py-1 tracking-normal">
                      <li>
                        <Link href={item.href} className="block px-4 py-2.5 text-[13px] font-semibold text-white/90 hover:bg-white/10 hover:text-canadaRed border-b border-white/10">
                          All {item.label}
                        </Link>
                      </li>
                      {item.topics.map(topic => (
                        <li key={topic}>
                          <Link
                            href={topicHref(item, topic)}
                            className="block px-4 py-2.5 text-[13px] font-semibold text-white/90 hover:bg-white/10 hover:text-canadaRed border-b border-white/10 last:border-b-0"
                          >
                            {topic}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
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
              onClick={() => setSearchOpen(true)}
              className="flex items-center text-white/80 hover:text-white transition-colors p-2"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>

            {isAuthLoading ? (
              <div className="flex items-center p-2" aria-hidden="true">
                <div className="w-6 h-6 rounded-full bg-white/20 animate-pulse" />
              </div>
            ) : (
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
            )}

            <button
              onClick={handleMenu}
              className="hidden lg:flex items-center text-white/80 hover:text-white transition-colors p-2"
              aria-label={sidebarOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={sidebarOpen}
            >
              <MenuIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
    <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
