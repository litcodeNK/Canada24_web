'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';

const TRICKLE_CAP = 88;
const TRICKLE_INTERVAL_MS = 200;
const INITIAL_LOAD_MS = 500;
const FADE_DELAY_MS = 180;
const FADE_DURATION_MS = 220;

export function NavigationLoader() {
  const pathname = usePathname();
  const [progress, setProgress] = useState(0);
  const [active, setActive] = useState(true); // active on initial load
  const [fading, setFading] = useState(false);
  const trickleTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const fadeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isFirstPathname = useRef(true);

  const clearTimers = useCallback(() => {
    if (trickleTimer.current) clearInterval(trickleTimer.current);
    if (fadeTimer.current) clearTimeout(fadeTimer.current);
    if (resetTimer.current) clearTimeout(resetTimer.current);
  }, []);

  const start = useCallback(() => {
    clearTimers();
    setFading(false);
    setActive(true);
    setProgress(15);
    // Trickle toward a cap so the bar always looks alive while we wait,
    // without ever claiming to be finished before navigation actually is.
    trickleTimer.current = setInterval(() => {
      setProgress(p => (p >= TRICKLE_CAP ? p : p + (TRICKLE_CAP - p) * 0.12));
    }, TRICKLE_INTERVAL_MS);
  }, [clearTimers]);

  const finish = useCallback(() => {
    if (trickleTimer.current) clearInterval(trickleTimer.current);
    setProgress(100);
    fadeTimer.current = setTimeout(() => setFading(true), FADE_DELAY_MS);
    resetTimer.current = setTimeout(() => {
      setActive(false);
      setProgress(0);
      setFading(false);
    }, FADE_DELAY_MS + FADE_DURATION_MS);
  }, []);

  // Initial page load
  useEffect(() => {
    start();
    const t = setTimeout(finish, INITIAL_LOAD_MS);
    return () => { clearTimeout(t); clearTimers(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Pathname changed = new page has rendered → finish the bar
  useEffect(() => {
    if (isFirstPathname.current) {
      isFirstPathname.current = false;
      return;
    }
    finish();
  }, [pathname, finish]);

  // Click interceptor — start immediately on internal link clicks for snappy feedback
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const anchor = (e.target as Element).closest('a[href]') as HTMLAnchorElement | null;
      if (!anchor) return;
      const href = anchor.getAttribute('href') ?? '';
      if (
        !href ||
        href === pathname ||
        href.startsWith('http') ||
        href.startsWith('//') ||
        href.startsWith('mailto') ||
        href.startsWith('tel') ||
        href.startsWith('#') ||
        anchor.target === '_blank' ||
        anchor.hasAttribute('download')
      ) return;

      start();
    };
    document.addEventListener('click', handleClick, { capture: true });
    return () => document.removeEventListener('click', handleClick, { capture: true });
  }, [pathname, start]);

  useEffect(() => clearTimers, [clearTimers]);

  if (!active) return null;

  return (
    <div
      role="progressbar"
      aria-hidden="true"
      className="fixed top-0 left-0 right-0 z-[9999] h-[3px] pointer-events-none bg-black/5 dark:bg-white/5"
    >
      <div
        className="h-full bg-canadaRed"
        style={{
          width: `${progress}%`,
          opacity: fading ? 0 : 1,
          boxShadow: '0 0 8px 1px rgba(213,43,30,0.65)',
          animation: fading ? undefined : 'navProgressPulse 1.4s ease-in-out infinite',
          transition: fading
            ? `opacity ${FADE_DURATION_MS}ms ease-out`
            : 'width 200ms ease-out',
        }}
      />
    </div>
  );
}
