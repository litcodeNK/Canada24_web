'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { clsx } from 'clsx';

const tabs = [
  { href: '/', label: 'TOP', icon: HomeIcon },
  { href: '/local', label: 'LOCAL', icon: MapIcon },
  { href: '/videos', label: 'VIDEO', icon: PlayIcon },
  { href: '/saved', label: 'SAVED', icon: BookmarkIcon },
  { href: '/sections', label: 'EXPLORE', icon: GridIcon },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/98 dark:bg-[#141414]/98 backdrop-blur-sm border-t border-gray-200 dark:border-[#333] flex h-20 safe-bottom">
      {tabs.map(({ href, label, icon: Icon }) => {
        const active = href === '/' ? pathname === '/' : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={clsx(
              'flex-1 flex flex-col items-center justify-center gap-1 transition-colors pt-1',
              active ? 'text-[#D52B1E]' : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300',
            )}
          >
            <Icon className="w-6 h-6" />
            <span className="bebas text-[11px] tracking-[0.18em]">{label}</span>
          </Link>
        );
      })}
    </nav>
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
