'use client';

import Link from 'next/link';
import type { Article } from '@/context/AppContext';

export function BreakingTicker({ articles }: { articles: Article[] }) {
  const breaking = articles.filter(a => a.isLive || a.category === 'BREAKING').slice(0, 5);
  const trending = articles.slice(0, 8);

  if (breaking.length === 0 && trending.length === 0) return null;

  return (
    <div className="border-b border-gray-300 dark:border-[#2A2A2A]" role="region" aria-label="Breaking news and trending">
      {/* Breaking news ticker */}
      {breaking.length > 0 && (
        <div className="bg-canadaRed flex items-center overflow-hidden h-9">
          <div className="flex-shrink-0 bg-black text-white px-3 sm:px-4 h-full flex items-center gap-2 z-10">
            <span className="pulse-dot w-2 h-2 rounded-full bg-canadaRed flex-shrink-0" />
            <span className="font-sans font-bold tracking-widest text-sm whitespace-nowrap">BREAKING</span>
          </div>
          <div className="flex-1 overflow-hidden" aria-live="polite" aria-label="Breaking news headlines">
            <div className="flex whitespace-nowrap ticker-animate">
              <span className="text-white text-xs font-semibold px-6 font-sans">
                {breaking.map(a => a.headline).join('  ·  ')}&nbsp;&nbsp;&nbsp;&nbsp;
                {breaking.map(a => a.headline).join('  ·  ')}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Trending strip */}
      {trending.length > 0 && (
        <div className="bg-white dark:bg-[#1A1A1A] flex items-center overflow-hidden h-10">
          <div className="flex-shrink-0 px-3 sm:px-4 h-full flex items-center border-r border-gray-300 dark:border-[#2A2A2A]">
            <span className="text-[10px] font-bold tracking-[0.12em] text-[#999] uppercase whitespace-nowrap font-sans">Trending</span>
          </div>
          <div className="flex items-center gap-2 px-3 overflow-x-auto scrollbar-hide flex-1">
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
