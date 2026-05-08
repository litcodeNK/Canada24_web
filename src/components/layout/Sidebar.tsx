'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useApp } from '@/context/AppContext';
import { clsx } from 'clsx';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

const navItems = [
  { href: '/', label: 'TOP STORIES', icon: HomeIcon },
  { href: '/local', label: 'LOCAL NEWS', icon: MapIcon },
  { href: '/videos', label: 'VIDEO FEED', icon: PlayIcon },
  { href: '/saved', label: 'SAVED', icon: BookmarkIcon },
  { href: '/sections', label: 'EXPLORE', icon: GridIcon },
];

const secondaryItems = [
  { href: '/settings', label: 'SETTINGS', icon: SettingsIcon },
  { href: '/onboarding/alerts', label: 'ALERT PREFERENCES', icon: BellIcon },
];

const sectionLinks = [
  { href: '/sections/politics', label: 'Politics', color: '#1565C0' },
  { href: '/sections/world', label: 'World', color: '#00695C' },
  { href: '/sections/business', label: 'Business', color: '#E65100' },
  { href: '/sections/health', label: 'Health', color: '#1B5E20' },
  { href: '/sections/sports', label: 'Sports', color: '#D52B1E' },
  { href: '/sections/technology', label: 'Technology', color: '#01579B' },
  { href: '/sections/entertainment', label: 'Entertainment', color: '#880E4F' },
  { href: '/sections/immigration', label: 'Immigration', color: '#BF360C' },
];

export function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { user } = useAuth();
  const { darkMode } = useApp();

  return (
    <>
      {/* Backdrop */}
      <div
        className={clsx(
          'fixed inset-0 z-40 bg-black/50 transition-opacity duration-300',
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
        )}
        onClick={onClose}
      />

      {/* Drawer */}
      <aside
        className={clsx(
          'fixed top-0 left-0 z-50 h-full w-72 bg-white dark:bg-[#1A1A1A] shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        {/* Header */}
        <div className="bg-[#D52B1E] p-5 pt-12">
          <div className="flex items-center justify-between">
            <div>
              <span className="bebas text-white text-2xl tracking-widest block leading-none">CANADA 247</span>
              <span className="text-white/70 text-[10px] tracking-widest font-medium">CANADA IN REAL TIME</span>
            </div>
            <button onClick={onClose} className="text-white/80 hover:text-white p-1" aria-label="Close menu">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
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
            <p className="text-[10px] font-bold tracking-[0.12em] text-[#999] uppercase mb-2">Sections</p>
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
            <Link
              href="/auth/email"
              onClick={onClose}
              className="block w-full text-center bebas tracking-widest text-sm text-[#D52B1E] border border-[#D52B1E] rounded-lg py-2 hover:bg-[#D52B1E] hover:text-white transition-colors"
            >
              SIGN IN
            </Link>
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
