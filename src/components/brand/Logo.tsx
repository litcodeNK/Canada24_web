import Image from 'next/image';
import { clsx } from 'clsx';

// Intrinsic size of the cropped logo artwork (leaf stacked over the wordmark).
const W = 1061;
const H = 575;

interface LogoProps {
  /** Sizing, e.g. `h-12`. Width follows the artwork's aspect ratio. */
  className?: string;
  /**
   * `auto` swaps between the white-wordmark and navy-wordmark artwork with the
   * theme. `onDark` always uses the white wordmark — for surfaces that are dark
   * in both themes (header, welcome screen, sidebar banner).
   */
  surface?: 'auto' | 'onDark';
  priority?: boolean;
  alt?: string;
}

export function Logo({ className, surface = 'auto', priority, alt = 'Canada 247' }: LogoProps) {
  const base = clsx('w-auto object-contain', className);

  if (surface === 'onDark') {
    return <Image src="/canada247-logo.png" alt={alt} width={W} height={H} priority={priority} className={base} />;
  }

  return (
    <>
      <Image
        src="/canada247-logo-light.png"
        alt={alt}
        width={W}
        height={H}
        priority={priority}
        className={clsx(base, 'dark:hidden')}
      />
      <Image
        src="/canada247-logo.png"
        alt=""
        aria-hidden="true"
        width={W}
        height={H}
        priority={priority}
        className={clsx(base, 'hidden dark:block')}
      />
    </>
  );
}
