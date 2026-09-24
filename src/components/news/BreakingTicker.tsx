'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Zap } from 'lucide-react';
import type { Article } from '@/context/AppContext';
import { fetchBreakingNews } from '@/services/newsService';

export function BreakingTicker({ articles }: { articles: Article[] }) {
  /* The breaking bar is driven by the editorial is_breaking flag (set by hand
     in Django admin), NOT inferred from feed content — it used to guess from
     isLive/category, which surfaced whatever happened to mention "live".
     Null means nothing is flagged, and the bar hides entirely. */
  const [breaking, setBreaking] = useState<Article | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchBreakingNews().then(result => {
      if (!cancelled) setBreaking(result);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const trending = articles.slice(0, 8);

  if (!breaking && trending.length === 0) return null;

  return (
    <div className="border-b border-gray-300 dark:border-[#2A2A2A]" role="region" aria-label="Breaking news and trending">
      {/* Breaking bar — only when an editor has flagged a story */}
      {breaking && (
        <div className="flex items-center overflow-hidden h-11 bg-gradient-to-r from-canadaRedDark to-canadaRed shadow-sm">
          <div className="flex-shrink-0 flex items-center gap-2 px-4 sm:px-5 h-full bg-black/25 z-10">
            <Zap className="w-4 h-4 text-white fill-white flex-shrink-0" aria-hidden="true" />
            <span className="font-sans font-black tracking-[0.15em] text-[13px] text-white whitespace-nowrap">
              BREAKING
            </span>
          </div>

          <Link
            href={`/article/${breaking.id}`}
            className="min-w-0 flex-1 px-4 sm:px-5 text-white text-[13px] sm:text-[14px] font-semibold font-sans truncate hover:underline underline-offset-2"
          >
            {breaking.headline}
          </Link>

          <div className="hidden md:flex items-center gap-2 flex-shrink-0 px-4 sm:px-5 text-[11px] text-white/85 font-sans">
            <span>Updated {breaking.time}</span>
            <span className="text-white/40">•</span>
            <span className="flex items-center gap-1.5">
              <span className="pulse-dot w-1.5 h-1.5 rounded-full bg-white" aria-hidden="true" />
              Live
            </span>
          </div>
        </div>
      )}

      {/* Trending strip */}
      {trending.length > 0 && (
        <div className="bg-white dark:bg-[#1A1A1A] flex items-center overflow-hidden h-10">
          <div className="flex-shrink-0 px-3 sm:px-4 h-full flex items-center border-r border-gray-300 dark:border-[#2A2A2A]">
            <span className="text-[10px] font-bold tracking-[0.12em] text-[#999] uppercase whitespace-nowrap font-sans">Trending</span>
          </div>
          <div className="flex items-center gap-2 px-3 overflow-x-auto scrollbar-x-navy flex-1">
            {trending.map(article => (
              <Link
                key={article.id}
                href={`/article/${article.id}`}
                className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1 bg-gray-100 dark:bg-[#2A2A2A] hover:bg-canadaRed/10 hover:text-canadaRed transition-colors text-[11px] font-medium text-[#3a3a3a] dark:text-[#CCC] whitespace-nowrap rounded-full font-sans"
              >
                {article.isLive && (
                  <span className="pulse-dot w-1.5 h-1.5 rounded-full bg-canadaRed flex-shrink-0" aria-hidden="true" />
                )}
                <span className="max-w-[180px] truncate">{article.headline}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
