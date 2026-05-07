'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { ArticleCard } from '@/components/news/ArticleCard';
import { searchArticles } from '@/services/newsService';
import type { Article } from '@/context/AppContext';
import { useRouter } from 'next/navigation';

const TRENDING = ['Ukraine', 'Climate', 'Housing', 'Economy', 'Health', 'Federal Budget', 'Alberta', 'Ontario'];

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();

  useEffect(() => { inputRef.current?.focus(); }, []);

  const doSearch = useCallback(async (q: string) => {
    if (!q.trim()) { setResults([]); setSearched(false); return; }
    setLoading(true);
    const res = await searchArticles(q);
    setResults(res);
    setSearched(true);
    setLoading(false);
  }, []);

  const handleChange = (val: string) => {
    setQuery(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(val), 600);
  };

  return (
    <AppShell>
      {/* Search bar */}
      <div className="sticky top-14 z-30 bg-white dark:bg-[#0D0D0D] px-4 py-3 border-b border-gray-100 dark:border-[#2A2A2A]">
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={e => handleChange(e.target.value)}
            placeholder="Search Canada 247..."
            className="w-full pl-9 pr-10 py-2.5 bg-gray-100 dark:bg-[#1C1C1C] rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#D52B1E]/40 dark:text-white placeholder:text-gray-400"
          />
          {query && (
            <button
              onClick={() => { setQuery(''); setResults([]); setSearched(false); inputRef.current?.focus(); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      {!query ? (
        <div className="px-4 pt-5">
          <p className="bebas tracking-widest text-xs text-gray-400 dark:text-gray-500 mb-3">TRENDING TOPICS</p>
          <div className="flex flex-wrap gap-2">
            {TRENDING.map(topic => (
              <button
                key={topic}
                onClick={() => { setQuery(topic); doSearch(topic); }}
                className="px-3 py-1.5 rounded-full bg-gray-100 dark:bg-[#1C1C1C] text-sm font-medium text-[#1A1A1A] dark:text-[#F5F5F5] hover:bg-[#D52B1E] hover:text-white transition-colors"
              >
                {topic}
              </button>
            ))}
          </div>
        </div>
      ) : loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-[#D52B1E] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : searched && results.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center px-8">
          <p className="bebas tracking-widest text-gray-400 text-lg">NO RESULTS</p>
          <p className="text-gray-400 text-sm mt-1">No articles found for &quot;{query}&quot;</p>
        </div>
      ) : (
        <>
          {results.length > 0 && (
            <p className="px-4 py-2 text-xs text-gray-400 dark:text-gray-500">{results.length} result{results.length !== 1 ? 's' : ''} for &quot;{query}&quot;</p>
          )}
          <div>
            {results.map(article => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        </>
      )}
    </AppShell>
  );
}
