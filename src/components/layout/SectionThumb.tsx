'use client';

import { useState } from 'react';
import { clsx } from 'clsx';

export function SectionThumb({ src, className }: { src?: string; className?: string }) {
  const [failed, setFailed] = useState(false);

  if (src && !failed) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt=""
        loading="lazy"
        onError={() => setFailed(true)}
        className={clsx('object-cover', className)}
      />
    );
  }
  return <span className={clsx('block', className)} aria-hidden="true" />;
}
