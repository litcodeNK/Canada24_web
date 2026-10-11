import { clsx } from 'clsx';

type Circle = {
  // CSS position of the circle's box, size in px, look, and drift speed
  pos: React.CSSProperties;
  size: number;
  look: 'red' | 'blue' | 'ring' | 'glass';
  dur: number;
};

// Large circles that bleed off the edges of the bar so they read as part of the
// layout itself, not as particles. Fixed positions keep SSR and client identical.
const LAYOUTS: Record<'header' | 'footer', Circle[]> = {
  header: [
    { pos: { left: '-60px', top: '-90px' }, size: 220, look: 'red', dur: 26 },
    { pos: { left: '26%', top: '-120px' }, size: 190, look: 'glass', dur: 32 },
    { pos: { left: '44%', bottom: '-110px' }, size: 170, look: 'ring', dur: 30 },
    { pos: { right: '18%', top: '-80px' }, size: 150, look: 'blue', dur: 28 },
    { pos: { right: '-70px', bottom: '-100px' }, size: 230, look: 'red', dur: 34 },
  ],
  footer: [
    { pos: { left: '-120px', top: '-80px' }, size: 380, look: 'red', dur: 36 },
    { pos: { left: '30%', bottom: '-200px' }, size: 420, look: 'glass', dur: 42 },
    { pos: { right: '8%', top: '-140px' }, size: 300, look: 'ring', dur: 38 },
    { pos: { right: '-110px', bottom: '-90px' }, size: 340, look: 'blue', dur: 40 },
  ],
};

/** Big decorative circles clipped by the parent. Parent must be `relative overflow-hidden`. */
export function FloatingBubbles({ variant, className }: { variant: 'header' | 'footer'; className?: string }) {
  return (
    <div className={clsx('pointer-events-none absolute inset-0 overflow-hidden', className)} aria-hidden="true">
      {LAYOUTS[variant].map((c, i) => (
        <span
          key={i}
          className={clsx('c247-circle', `c247-circle--${c.look}`)}
          style={{ ...c.pos, width: c.size, height: c.size, animationDuration: `${c.dur}s`, animationDelay: `-${i * 7}s` }}
        />
      ))}
    </div>
  );
}
