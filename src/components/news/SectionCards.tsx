'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { SECTION_NAV } from '@/lib/nav';

function CardImage({ src, color, label }: { src?: string; color: string; label: string }) {
  const [failed, setFailed] = useState(false);
  if (src && !failed) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt=""
        loading="lazy"
        onError={() => setFailed(true)}
        className="w-full aspect-[16/10] object-cover transition-transform duration-500 group-hover:scale-[1.03]"
      />
    );
  }
  return (
    <div
      className="w-full aspect-[16/10] flex items-center justify-center"
      style={{ background: `linear-gradient(135deg, ${color}, ${color}99)` }}
      aria-hidden="true"
    >
      <span className="font-display text-white/40 text-3xl tracking-widest">{label.slice(0, 2).toUpperCase()}</span>
    </div>
  );
}

/** Landing-page category cards: one card per nav category, in nav order, each
 * linking straight to that section. `thumbnails` is keyed by nav label. */
export function SectionCards({ thumbnails }: { thumbnails: Record<string, string | undefined> }) {
  return (
    <section aria-labelledby="explore-categories-heading" className="max-w-[1400px] mx-auto px-4 pt-6 pb-2">
      <div className="mb-5">
        <div className="w-12 h-1 bg-canadaRed mb-3" />
        <h2 id="explore-categories-heading" className="font-sans font-bold text-lg tracking-wide text-[#1a1a1a] dark:text-white">
          EXPLORE CATEGORIES
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {SECTION_NAV.map(item => {
          const color = item.color ?? '#D52B1E';
          return (
            <Link
              key={item.href}
              href={item.href}
              className="group flex flex-col bg-white dark:bg-[#1C1C1C] border border-[#E5E5E5] dark:border-[#2A2A2A] transition-all duration-200 hover:-translate-y-1 hover:shadow-xl focus-visible:-translate-y-1 focus-visible:shadow-xl outline-none"
            >
              <div className="overflow-hidden">
                <CardImage src={thumbnails[item.label]} color={color} label={item.label} />
              </div>
              <div className="flex flex-col flex-1 p-6">
                <h3 className="font-sans font-bold text-[22px] leading-tight text-[#0b1a3a] dark:text-white">
                  {item.label}
                </h3>
                <span className="block w-10 h-[3px] mt-3 mb-3" style={{ backgroundColor: color }} />
                <p className="text-[15px] leading-relaxed text-[#333] dark:text-[#BBB] mb-6">{item.description}</p>
                <span className="mt-auto inline-flex items-center justify-between gap-6 self-start bg-[#0b1a3a] group-hover:bg-canadaRed text-white text-[14px] font-semibold px-5 py-3 transition-colors">
                  View stories
                  <ChevronRight className="w-4 h-4" />
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
