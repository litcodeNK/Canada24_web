'use client';

import { useEffect, useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { ArticleCard } from '@/components/news/ArticleCard';
import { fetchTopStories, fetchRegions, fetchRegionArticles } from '@/services/newsService';
import type { Article } from '@/context/AppContext';
import { clsx } from 'clsx';

type SortMode = 'recent' | 'popular';
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
  const sorted = [...articles].sort((a, b) =>
    sortMode === 'popular' ? engagement(b) - engagement(a) || byRecent(a, b) : byRecent(a, b),
  );

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

        {/* Sort controls */}
        <div className="flex items-center gap-2 mb-5">
          <span className="text-[11px] text-[#999] uppercase tracking-wider font-semibold mr-2">Sort:</span>
          <button
            onClick={() => setSortMode('popular')}
            className={clsx(
              'text-xs font-semibold px-3 py-1.5 border transition-colors',
              sortMode === 'popular'
                ? 'bg-[#D52B1E] text-white border-[#D52B1E]'
                : 'border-[#E8E8E8] dark:border-[#333] text-[#3a3a3a] dark:text-[#CCC] hover:border-[#D52B1E] hover:text-[#D52B1E]',
            )}
          >
            Most Popular
          </button>
          <button
            onClick={() => setSortMode('recent')}
            className={clsx(
              'text-xs font-semibold px-3 py-1.5 border transition-colors',
              sortMode === 'recent'
                ? 'bg-[#D52B1E] text-white border-[#D52B1E]'
                : 'border-[#E8E8E8] dark:border-[#333] text-[#3a3a3a] dark:text-[#CCC] hover:border-[#D52B1E] hover:text-[#D52B1E]',
            )}
          >
            Most Recent
          </button>
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
