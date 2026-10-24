'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { List, LayoutGrid } from 'lucide-react';
import { clsx } from 'clsx';
import { AppShell } from '@/components/layout/AppShell';
import { apiRequest, extractList } from '@/services/api';
import { SECTION_NAV } from '@/lib/nav';

// Same list as the header, sidebar and footer — see src/lib/nav.ts.
const SECTIONS = SECTION_NAV.map(({ label, href, color }) => ({
  name: label,
  href,
  color: color ?? '#D52B1E',
}));

const ALL_SECTION_NAMES = SECTIONS.map(s => s.name);

type ViewMode = 'list' | 'gallery';

function SectionThumb({ imgUrl, color, className }: { imgUrl?: string; color: string; className?: string }) {
  const [failed, setFailed] = useState(false);

  if (imgUrl && !failed) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={imgUrl} alt="" className={clsx('object-cover', className)} loading="lazy" onError={() => setFailed(true)} />;
  }
  return (
    <div
      className={clsx('flex items-center justify-center', className)}
      style={{ background: `linear-gradient(135deg, ${color}, ${color}99)` }}
    >
      <span className="font-display text-white/30 text-lg">CN</span>
    </div>
  );
}

export default function SectionsPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('gallery');
  const [thumbnails, setThumbnails] = useState<Record<string, string | undefined>>({});

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const sections = await apiRequest<{ slug: string; label: string }[]>('/news/sections/');
        if (cancelled) return;

        await Promise.all(ALL_SECTION_NAMES.map(async name => {
          const match = sections.find(s => s.label.toLowerCase() === name.toLowerCase());
          if (!match) return;
          try {
            const payload = await apiRequest<unknown>(`/news/sections/${match.slug}/`);
            const list = extractList(payload as never[]) as Array<{ img_url?: string }>;
            const imgUrl = list[0]?.img_url;
            if (!cancelled && imgUrl) {
              setThumbnails(prev => ({ ...prev, [name]: imgUrl }));
            }
          } catch {}
        }));
      } catch {}
    })();
    return () => { cancelled = true; };
  }, []);

  return (
    <AppShell>
      <div className="max-w-[1180px] mx-auto px-4 sm:px-6 pt-6 pb-10">

        {/* Page header */}
        <div className="flex items-center justify-between mb-6 pb-3 border-b border-[#E8E8E8] dark:border-[#2A2A2A]">
          <h1 className="bebas tracking-widest text-[18px] dark:text-white">EXPLORE CATEGORIES</h1>

          <div className="flex items-center gap-1 bg-gray-100 dark:bg-[#1C1C1C] rounded-full p-1">
            <button
              onClick={() => setViewMode('list')}
              aria-label="List view"
              aria-pressed={viewMode === 'list'}
              className={clsx(
                'flex items-center justify-center w-8 h-8 rounded-full transition-colors',
                viewMode === 'list' ? 'bg-canadaRed text-white' : 'text-gray-400 hover:text-canadaRed',
              )}
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('gallery')}
              aria-label="Gallery view"
              aria-pressed={viewMode === 'gallery'}
              className={clsx(
                'flex items-center justify-center w-8 h-8 rounded-full transition-colors',
                viewMode === 'gallery' ? 'bg-canadaRed text-white' : 'text-gray-400 hover:text-canadaRed',
              )}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="space-y-8">
          {[{ sections: SECTIONS }].map((group, i) => (
            <div key={i}>
              {viewMode === 'list' ? (
                /* ── LIST VIEW ── */
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {group.sections.map(section => (
                    <Link
                      key={section.name}
                      href={section.href}
                      className="group flex items-center gap-3 p-3 rounded-xl bg-oxfordBlue dark:bg-oxfordBlueDark hover:opacity-90 transition-opacity"
                    >
                      <SectionThumb
                        imgUrl={thumbnails[section.name]}
                        color={section.color}
                        className="w-14 h-14 rounded-lg flex-shrink-0"
                      />

                      <div className="min-w-0">
                        <span className="block text-[14px] font-bold text-white leading-tight">
                          {section.name}
                        </span>
                        <span className="block text-[11px] text-white/60 mt-0.5">View stories</span>
                      </div>

                      <svg
                        className="ml-auto flex-shrink-0 text-white/40 group-hover:text-white transition-colors"
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                      >
                        <polyline points="9,18 15,12 9,6"/>
                      </svg>
                    </Link>
                  ))}
                </div>
              ) : (
                /* ── GALLERY VIEW ── */
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {group.sections.map(section => (
                    <Link
                      key={section.name}
                      href={section.href}
                      className="group rounded-xl overflow-hidden bg-oxfordBlue dark:bg-oxfordBlueDark hover:opacity-90 transition-opacity"
                    >
                      <SectionThumb
                        imgUrl={thumbnails[section.name]}
                        color={section.color}
                        className="w-full aspect-[4/3]"
                      />
                      <div className="flex items-center justify-between px-3.5 py-3">
                        <div className="min-w-0">
                          <span className="block text-[13px] font-bold text-white leading-tight truncate">
                            {section.name}
                          </span>
                          <span className="block text-[10px] text-white/60 mt-0.5">View stories</span>
                        </div>
                        <svg
                          className="ml-2 flex-shrink-0 text-white/40 group-hover:text-white transition-colors"
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                        >
                          <polyline points="9,18 15,12 9,6"/>
                        </svg>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
