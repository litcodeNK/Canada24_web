'use client';

import Link from 'next/link';
import { clsx } from 'clsx';

type Variant = 'red' | 'light';
type Size = 'sm' | 'md';

interface AnimatedButtonProps {
  children: React.ReactNode;
  /** Renders a Next <Link> when set, otherwise a <button>. */
  href?: string;
  onClick?: () => void;
  variant?: Variant;
  size?: Size;
  /** Stretch to the container's width. */
  block?: boolean;
  type?: 'button' | 'submit';
  disabled?: boolean;
  className?: string;
  'aria-label'?: string;
}

/** Arrow glyph shared by the two sliding arrows. */
const ARROW =
  'M16.1716 10.9999L10.8076 5.63589L12.2218 4.22168L20 11.9999L12.2218 19.778L10.8076 18.3638L16.1716 12.9999H4V10.9999H16.1716Z';

/**
 * Outlined button whose arrow slides through and a circle floods the fill on
 * hover. Styles live in globals.css (`.animated-button`).
 */
export function AnimatedButton({
  children,
  href,
  onClick,
  variant = 'red',
  size = 'md',
  block = false,
  type = 'button',
  disabled,
  className,
  'aria-label': ariaLabel,
}: AnimatedButtonProps) {
  const classes = clsx(
    'animated-button',
    `animated-button--${variant}`,
    size === 'sm' && 'animated-button--sm',
    block && 'animated-button--block',
    className,
  );

  const inner = (
    <>
      <svg viewBox="0 0 24 24" className="arr-2" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d={ARROW} />
      </svg>
      <span className="text">{children}</span>
      <span className="circle" aria-hidden="true" />
      <svg viewBox="0 0 24 24" className="arr-1" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d={ARROW} />
      </svg>
    </>
  );

  if (href) {
    return (
      <Link href={href} onClick={onClick} className={classes} aria-label={ariaLabel}>
        {inner}
      </Link>
    );
  }

  return (
    <button type={type} onClick={onClick} disabled={disabled} className={classes} aria-label={ariaLabel}>
      {inner}
    </button>
  );
}
