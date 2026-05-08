'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';

type Phase = 'idle' | 'start' | 'mid' | 'done' | 'fade';

export function TopLoadingBar() {
  const pathname = usePathname();
  const [phase, setPhase] = useState<Phase>('idle');
  const [width, setWidth] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isFirstRender = useRef(true);

  const clear = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  useEffect(() => {
    // skip the very first mount so we don't flash on initial page load
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    clear();

    // Phase 1: jump to 30% instantly
    setPhase('start');
    setWidth(30);

    // Phase 2: animate to 70% after 150ms
    timerRef.current = setTimeout(() => {
      setPhase('mid');
      setWidth(70);

      // Phase 3: animate to 100% after another 250ms
      timerRef.current = setTimeout(() => {
        setPhase('done');
        setWidth(100);

        // Phase 4: fade out after 200ms
        timerRef.current = setTimeout(() => {
          setPhase('fade');

          // Phase 5: reset to idle after fade transition (200ms)
          timerRef.current = setTimeout(() => {
            setPhase('idle');
            setWidth(0);
          }, 220);
        }, 200);
      }, 250);
    }, 150);

    return clear;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  if (phase === 'idle') return null;

  return (
    <div
      role="progressbar"
      aria-hidden="true"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        height: '3px',
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          height: '100%',
          width: `${width}%`,
          backgroundColor: '#22C55E',
          opacity: phase === 'fade' ? 0 : 1,
          transition:
            phase === 'start'
              ? 'width 150ms ease-out'
              : phase === 'mid'
              ? 'width 250ms ease-in-out'
              : phase === 'done'
              ? 'width 200ms ease-in-out'
              : 'opacity 200ms ease-out',
        }}
      />
    </div>
  );
}
