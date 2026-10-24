'use client';

import { useEffect, useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { ArticleCard } from '@/components/news/ArticleCard';
import { fetchTopStories, fetchRegions, fetchRegionArticles } from '@/services/newsService';
import type { Article } from '@/context/AppContext';
import { clsx } from 'clsx';
import { ListFilter, Check } from 'lucide-react';

type SortMode = 'recent' | 'oldest' | 'popular';

const SORT_OPTIONS: { mode: SortMode; label: string }[] = [
  { mode: 'recent', label: 'Most Recent' },
  { mode: 'oldest', label: 'Oldest First' },
  { mode: 'popular', label: 'Most Popular' },
];
type Tab = { slug: string; name: string };

const ALL_CANADA: Tab = { slug: 'all', name: 'All Canada' };

function engagement(a: Article): number {
  return (a.likesCount ?? 0) + (a.commentsCount ?? 0) + (a.repostsCount ?? 0) + (a.savesCount ?? 0);
}

function byRecent(a: Article, b: Article): number {
  return new Date(b.publishedAt ?? 0).getTime() - new Date(a.publishedAt ?? 0).getTime();
}

export default function LocalNewsPage() {
  const [tabs, setTabs] = useState<Tab[]>([ALL_CANADA]);
  const [byTab, setByTab] = useState<Record<string, Article[]>>({});
  const [activeSlug, setActiveSlug] = useState(ALL_CANADA.slug);
  const [loading, setLoading] = useState(true);
  const [sortMode, setSortMode] = useState<SortMode>('recent');
  const [filterOpen, setFilterOpen] = useState(false);

  // Load national news plus every region's own news, then only show region
  // tabs that actually have stories. A region appears as soon as news tagged
  // to it exists — nothing is hard-coded.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [national, regions] = await Promise.all([fetchTopStories(), fetchRegions()]);
      const regionResults = await Promise.all(
        regions.map(async region => [region, await fetchRegionArticles(region.slug)] as const),
      );
      if (cancelled) return;
      const withNews = regionResults.filter(([, list]) => list.length > 0);
      setTabs([ALL_CANADA, ...withNews.map(([r]) => ({ slug: r.slug, name: r.name }))]);
      setByTab({
        [ALL_CANADA.slug]: national,
        ...Object.fromEntries(withNews.map(([r, list]) => [r.slug, list])),
      });
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const articles = byTab[activeSlug] ?? [];
  const activeName = tabs.find(t => t.slug === activeSlug)?.name ?? ALL_CANADA.name;
  const sorted = [...articles].sort((a, b) => {
    if (sortMode === 'oldest') return byRecent(b, a);
    if (sortMode === 'popular') return engagement(b) - engagement(a) || byRecent(a, b);
    return byRecent(a, b);
  });

  return (
    <AppShell>
      {/* Page header */}
      <div className="border-b border-[#E8E8E8] dark:border-[#2A2A2A] bg-white dark:bg-[#1A1A1A]">
        <div className="max-w-[1180px] mx-auto px-4 sm:px-6 pt-5 pb-0">
          <h1 className="bebas tracking-widest text-[22px] dark:text-white mb-4">ACROSS CANADA</h1>

          {/* Region tabs — only regions that currently have news */}
          <div className="flex overflow-x-auto scrollbar-x-navy gap-0 -mb-px">
            {tabs.map(tab => (
              <button
                key={tab.slug}
                onClick={() => setActiveSlug(tab.slug)}
                className={clsx(
                  'flex-shrink-0 px-4 py-2.5 bebas tracking-widest text-[13px] border-b-2 transition-colors whitespace-nowrap mr-1',
                  activeSlug === tab.slug
                    ? 'border-[#D52B1E] text-[#D52B1E]'
                    : 'border-transparent text-[#999] dark:text-[#666] hover:text-[#1a1a1a] dark:hover:text-[#CCC]',
                )}
              >
                {tab.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-[1180px] mx-auto px-4 sm:px-6 py-5">

        {/* Filter menu */}
        <div className="relative mb-5 inline-block">
          <button
            onClick={() => setFilterOpen(o => !o)}
            aria-haspopup="menu"
            aria-expanded={filterOpen}
            aria-label="Filter stories"
            className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-2 border border-[#E8E8E8] dark:border-[#333] text-[#3a3a3a] dark:text-[#CCC] hover:border-[#D52B1E] hover:text-[#D52B1E] transition-colors"
          >
            <ListFilter className="w-4 h-4" />
            {SORT_OPTIONS.find(o => o.mode === sortMode)?.label}
          </button>
          {filterOpen && (
            <>
              <div className="fixed inset-0 z-20" onClick={() => setFilterOpen(false)} aria-hidden="true" />
              <ul role="menu" className="absolute left-0 top-full mt-1 z-30 min-w-[180px] bg-white dark:bg-[#1C1C1C] border border-[#E8E8E8] dark:border-[#333] shadow-lg py-1">
                {SORT_OPTIONS.map(option => (
                  <li key={option.mode} role="none">
                    <button
                      role="menuitemradio"
                      aria-checked={sortMode === option.mode}
                      onClick={() => { setSortMode(option.mode); setFilterOpen(false); }}
                      className={clsx(
                        'flex w-full items-center justify-between px-4 py-2.5 text-[13px] font-semibold text-left hover:bg-[#F5F5F5] dark:hover:bg-[#2A2A2A]',
                        sortMode === option.mode ? 'text-[#D52B1E]' : 'text-[#3a3a3a] dark:text-[#CCC]',
                      )}
                    >
                      {option.label}
                      {sortMode === option.mode && <Check className="w-4 h-4" />}
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-2 border-[#D52B1E] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : sorted.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center px-4">
            <div className="w-12 h-12 border border-[#E8E8E8] dark:border-[#333] flex items-center justify-center mb-4">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="1.5" strokeLinecap="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
            </div>
            <p className="bebas tracking-widest text-[#999] text-lg">NO ARTICLES FOUND</p>
            <p className="text-[#999] text-sm mt-1">No news available for {activeName} right now.</p>
          </div>
        ) : (
          <>
            {/* Mobile: single column, all articles */}
            <div className="lg:hidden divide-y divide-[#E8E8E8] dark:divide-[#2A2A2A]">
              {sorted.map(article => (
                <div key={article.id} className="py-3">
                  <ArticleCard article={article} showEngagement={false} />
                </div>
              ))}
            </div>

            {/* Desktop: 2-column grid */}
            <div className="hidden lg:grid grid-cols-2 gap-8">
              {/* Left column: even-indexed articles */}
              <div className="divide-y divide-[#E8E8E8] dark:divide-[#2A2A2A]">
                {sorted
                  .filter((_, i) => i % 2 === 0)
                  .map(article => (
                    <div key={article.id} className="py-3">
                      <ArticleCard article={article} showEngagement={false} />
                    </div>
                  ))}
              </div>
              {/* Right column: odd-indexed articles */}
              <div className="divide-y divide-[#E8E8E8] dark:divide-[#2A2A2A] border-l border-[#E8E8E8] dark:border-[#2A2A2A] pl-8">
                {sorted
                  .filter((_, i) => i % 2 === 1)
                  .map(article => (
                    <div key={article.id} className="py-3">
                      <ArticleCard article={article} showEngagement={false} />
                    </div>
                  ))}
              </div>
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
}
