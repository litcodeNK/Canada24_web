'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Search, X } from 'lucide-react';
import { ArticleCard } from '@/components/news/ArticleCard';
import { searchArticles } from '@/services/newsService';
import type { Article } from '@/context/AppContext';

const TRENDING = ['Study Permit', 'Work Permit', 'Housing', 'Mortgage', 'Citizenship', 'Jobs', 'Auto Insurance', 'Express Entry'];

/** Search as an overlay rather than a page: opens over whatever the reader is
 * on, closes with X, backdrop click or Escape, and leaves them where they were. */
export function SearchModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const requestId = useRef(0);

  const doSearch = useCallback(async (q: string) => {
    const id = ++requestId.current;
    if (!q.trim()) {
      setResults([]);
      setSearched(false);
      setLoading(false);
      return;
    }
    setLoading(true);
    const res = await searchArticles(q);
    if (id !== requestId.current) return; // a newer search superseded this one
    setResults(res);
    setSearched(true);
    setLoading(false);
  }, []);

  const handleChange = (val: string) => {
    setQuery(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(val), 400);
  };

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-start justify-center bg-black/60 backdrop-blur-[2px] sm:px-4 sm:pt-[8vh]"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Search Canada247"
        onClick={e => e.stopPropagation()}
        className="flex flex-col w-full sm:max-w-2xl h-full sm:h-auto sm:max-h-[80vh] bg-white dark:bg-[#141414] sm:rounded-2xl shadow-2xl overflow-hidden"
      >
        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 dark:border-[#2A2A2A]">
          <Search className="w-5 h-5 text-gray-400 flex-shrink-0" />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={e => handleChange(e.target.value)}
            placeholder="Search Canada247..."
            className="flex-1 min-w-0 bg-transparent text-base outline-none text-[#1a1a1a] dark:text-white placeholder:text-gray-400"
          />
          <button
            onClick={onClose}
            aria-label="Close search"
            className="p-1.5 text-gray-400 hover:text-[#1a1a1a] dark:hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {!query.trim() ? (
            <div className="px-4 py-5">
              <p className="bebas tracking-widest text-xs text-gray-400 mb-3">TRENDING TOPICS</p>
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
            <div className="py-14 text-center px-8">
              <p className="bebas tracking-widest text-gray-400 text-lg">NO RESULTS</p>
              <p className="text-gray-400 text-sm mt-1">No articles found for &quot;{query}&quot;</p>
            </div>
          ) : (
            <>
              <p className="px-4 py-2 text-xs text-gray-400">
                {results.length} result{results.length !== 1 ? 's' : ''} for &quot;{query}&quot;
              </p>
              <div onClick={onClose}>
                {results.map(article => (
                  <ArticleCard key={article.id} article={article} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
