'use client';

import { useEffect, useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { ArticleCard } from '@/components/news/ArticleCard';
import { fetchLocalNews } from '@/services/newsService';
import type { Article } from '@/context/AppContext';
import { clsx } from 'clsx';

const CITIES = ['Calgary', 'Manitoba', 'Kitchener-Waterloo', 'Edmonton'];

export default function LocalNewsPage() {
  const [activeCity, setActiveCity] = useState(CITIES[0]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);
  const [sortByTime, setSortByTime] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetchLocalNews(activeCity)
      .then(setArticles)
      .finally(() => setLoading(false));
  }, [activeCity]);

  const sorted = sortByTime
    ? [...articles].sort((a, b) => (b.publishedAt ?? '').localeCompare(a.publishedAt ?? ''))
    : articles;

  return (
    <AppShell>
      {/* Page header */}
      <div className="border-b border-[#E8E8E8] dark:border-[#2A2A2A] bg-white dark:bg-[#1A1A1A]">
        <div className="max-w-[1180px] mx-auto px-4 sm:px-6 pt-5 pb-0">
          <h1 className="bebas tracking-widest text-[22px] dark:text-white mb-4">LOCAL NEWS</h1>

          {/* City tabs */}
          <div className="flex overflow-x-auto scrollbar-hide gap-0 -mb-px">
            {CITIES.map(city => (
              <button
                key={city}
                onClick={() => setActiveCity(city)}
                className={clsx(
                  'flex-shrink-0 px-4 py-2.5 bebas tracking-widest text-[13px] border-b-2 transition-colors whitespace-nowrap mr-1',
                  activeCity === city
                    ? 'border-[#D52B1E] text-[#D52B1E]'
                    : 'border-transparent text-[#999] dark:text-[#666] hover:text-[#1a1a1a] dark:hover:text-[#CCC]',
                )}
              >
                {city}
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
            onClick={() => setSortByTime(false)}
            className={clsx(
              'text-xs font-semibold px-3 py-1.5 border transition-colors',
              !sortByTime
                ? 'bg-[#D52B1E] text-white border-[#D52B1E]'
                : 'border-[#E8E8E8] dark:border-[#333] text-[#3a3a3a] dark:text-[#CCC] hover:border-[#D52B1E] hover:text-[#D52B1E]',
            )}
          >
            Editors' Picks
          </button>
          <button
            onClick={() => setSortByTime(true)}
            className={clsx(
              'text-xs font-semibold px-3 py-1.5 border transition-colors',
              sortByTime
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
            <p className="text-[#999] text-sm mt-1">No local news available for {activeCity} right now.</p>
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
