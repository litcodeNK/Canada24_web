'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useApp } from '@/context/AppContext';
import { clsx } from 'clsx';
import { SECTION_NAV } from '@/lib/nav';
import { AnimatedButton } from '@/components/ui/AnimatedButton';
import { Logo } from '@/components/brand/Logo';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

const navItems = [
  { href: '/', label: 'TOP STORIES', icon: HomeIcon },
  { href: '/local', label: 'ACROSS CANADA', icon: MapIcon },
  { href: '/videos', label: 'VIDEO FEED', icon: PlayIcon },
  { href: '/saved', label: 'SAVED', icon: BookmarkIcon },
  { href: '/sections', label: 'EXPLORE', icon: GridIcon },
];

const secondaryItems = [
  { href: '/settings', label: 'SETTINGS', icon: SettingsIcon },
  { href: '/onboarding/alerts', label: 'ALERT PREFERENCES', icon: BellIcon },
];

// Canonical nav lives in src/lib/nav.ts so header/footer/sidebar can't drift.
// Scoped to the mockup's 6 categories only.
const sectionLinks = SECTION_NAV;

export function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { user } = useAuth();
  const { darkMode } = useApp();

  return (
    <>
      {/* Backdrop */}
      <div
        className={clsx(
          'fixed inset-0 z-40 bg-black/50 transition-opacity duration-300 ease-out',
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
        )}
        onClick={onClose}
      />

      {/* Dropdown — hangs from the bottom edge of the header bar (z-45 keeps it
          beneath the header, so it appears to slide out from under it). */}
      <aside
        aria-hidden={!open}
        className={clsx(
          'fixed z-[45] top-[64px] sm:top-[76px] left-0 right-0 sm:left-auto sm:right-4 lg:right-6 sm:w-[360px]',
          'max-h-[calc(100dvh-64px)] sm:max-h-[calc(100dvh-76px-16px)] flex flex-col overflow-hidden',
          'bg-white dark:bg-[#1A1A1A] shadow-2xl sm:rounded-b-xl border-t-2 border-canadaRed',
          'transition-[transform,opacity,visibility] duration-300 ease-out',
          open ? 'translate-y-0 opacity-100 visible' : '-translate-y-full opacity-0 invisible pointer-events-none',
        )}
      >
        {/* Header */}
        <div
          className="relative overflow-hidden px-5 pt-5 pb-4"
          style={{
            backgroundImage: 'url(/sidebar-bg.avif)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          {/* Dark overlay so text stays legible */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'linear-gradient(160deg, rgba(6,16,34,0.88) 0%, rgba(6,16,34,0.82) 60%, rgba(12,31,63,0.78) 100%)',
            }}
          />

          {/* Logo */}
          <div className="relative z-10 flex flex-col items-start gap-2">
            <Logo surface="onDark" className="h-14 drop-shadow-xl" />
            <span className="text-white/60 text-[10px] tracking-[0.18em] font-medium uppercase">
              Canada in real time
            </span>
          </div>
        </div>

        {/* Nav items */}
        <nav className="flex-1 overflow-y-auto py-4">
          <div className="space-y-1 px-2">
            {navItems.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                onClick={onClose}
                className={clsx(
                  'flex items-center gap-3 px-3 py-3 rounded-lg bebas tracking-wider text-sm transition-colors',
                  pathname === href
                    ? 'bg-[#D52B1E] text-white'
                    : 'text-[#1A1A1A] dark:text-[#F5F5F5] hover:bg-gray-100 dark:hover:bg-[#2A2A2A]',
                )}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {label}
              </Link>
            ))}
          </div>

          <div className="my-3 h-px bg-gray-200 dark:bg-[#333]" />

          {/* Sections */}
          <div className="px-4 mb-1">
            <p className="text-[10px] font-bold tracking-[0.12em] text-[#999] uppercase mb-2">Categories</p>
            <div className="grid grid-cols-2 gap-x-2 gap-y-0">
              {sectionLinks.map(({ href, label, color }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={onClose}
                  className="py-1.5 text-[13px] font-semibold hover:underline transition-colors"
                  style={{ color }}
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>

          <div className="my-3 h-px bg-gray-200 dark:bg-[#333]" />

          <div className="space-y-1 px-2">
            {secondaryItems.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                onClick={onClose}
                className={clsx(
                  'flex items-center gap-3 px-3 py-3 rounded-lg bebas tracking-wider text-sm transition-colors',
                  pathname === href
                    ? 'bg-[#D52B1E] text-white'
                    : 'text-[#444] dark:text-[#CCC] hover:bg-gray-100 dark:hover:bg-[#2A2A2A]',
                )}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {label}
              </Link>
            ))}
          </div>
        </nav>

        {/* Footer: user */}
        <div className="p-4 border-t border-gray-200 dark:border-[#333]">
          {user ? (
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#D52B1E] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                {user.displayName?.[0]?.toUpperCase() ?? user.email[0].toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold truncate dark:text-white">{user.displayName || 'User'}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
              </div>
            </div>
          ) : (
            <AnimatedButton href="/auth/email" onClick={onClose} size="sm" block>
              Sign in
            </AnimatedButton>
          )}
        </div>
      </aside>
    </>
  );
}

function HomeIcon({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9,22 9,12 15,12 15,22"/></svg>;
}
function MapIcon({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>;
}
function PlayIcon({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5,3 19,12 5,21 5,3"/></svg>;
}
function BookmarkIcon({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>;
}
function GridIcon({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>;
}
function SettingsIcon({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>;
}
function BellIcon({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>;
}
