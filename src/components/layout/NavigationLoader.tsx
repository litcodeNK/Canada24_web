'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { PencilLoader } from './PencilLoader';

const MIN_VISIBLE_MS = 700;

export function NavigationLoader() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(true); // visible on initial load
  const showedAt = useRef<number>(Date.now());
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isFirstPathname = useRef(true);

  const scheduleHide = useCallback(() => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    const elapsed = Date.now() - showedAt.current;
    const wait = Math.max(0, MIN_VISIBLE_MS - elapsed);
    hideTimer.current = setTimeout(() => setVisible(false), wait);
  }, []);

  // Initial load: hide after MIN_VISIBLE_MS
  useEffect(() => {
    showedAt.current = Date.now();
    scheduleHide();
    return () => { if (hideTimer.current) clearTimeout(hideTimer.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Pathname changed = new page is rendered → hide (respecting minimum display time)
  useEffect(() => {
    if (isFirstPathname.current) {
      isFirstPathname.current = false;
      return;
    }
    scheduleHide();
  }, [pathname, scheduleHide]);

  // Click interceptor — show loader when user clicks an internal link
  const handleClick = useCallback((e: MouseEvent) => {
    const anchor = (e.target as Element).closest('a[href]') as HTMLAnchorElement | null;
    if (!anchor) return;
    const href = anchor.getAttribute('href') ?? '';
    if (
      !href ||
      href.startsWith('http') ||
      href.startsWith('//') ||
      href.startsWith('mailto') ||
      href.startsWith('tel') ||
      href.startsWith('#') ||
      anchor.target === '_blank' ||
      anchor.hasAttribute('download')
    ) return;

    if (hideTimer.current) clearTimeout(hideTimer.current);
    showedAt.current = Date.now();
    setVisible(true);
  }, []);

  useEffect(() => {
    document.addEventListener('click', handleClick, { capture: true });
    return () => document.removeEventListener('click', handleClick, { capture: true });
  }, [handleClick]);

  if (!visible) return null;
  return <PencilLoader />;
}
