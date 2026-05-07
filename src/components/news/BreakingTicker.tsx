'use client';

import Link from 'next/link';
import type { Article } from '@/context/AppContext';

export function BreakingTicker({ articles }: { articles: Article[] }) {
  const breaking = articles.filter(a => a.isLive || a.category === 'BREAKING').slice(0, 5);
  const trending = articles.slice(0, 8);

  return (
    <div className="border-b border-[#E8E8E8] dark:border-[#2A2A2A]">
      {/* Breaking news bar — only shown when breaking stories exist */}
      {breaking.length > 0 && (
        <div className="bg-[#D52B1E] flex items-center overflow-hidden h-9">
          <div className="flex-shrink-0 bg-black text-white px-3 sm:px-4 h-full flex items-center gap-2 z-10">
            <span className="pulse-dot w-2 h-2 rounded-full bg-[#D52B1E] flex-shrink-0" />
            <span className="bebas tracking-widest text-sm whitespace-nowrap">BREAKING</span>
          </div>
          <div className="flex-1 overflow-hidden">
            <div className="flex whitespace-nowrap ticker-animate">
              <span className="text-white text-xs font-semibold px-6">
                {breaking.map(a => a.headline).join('  ·  ')}&nbsp;&nbsp;&nbsp;&nbsp;
                {breaking.map(a => a.headline).join('  ·  ')}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* NBC-style trending pill strip */}
      <div className="bg-white dark:bg-[#1A1A1A] flex items-center overflow-hidden h-10">
        <div className="flex-shrink-0 px-3 sm:px-4 h-full flex items-center border-r border-[#E8E8E8] dark:border-[#2A2A2A]">
          <span className="text-[10px] font-bold tracking-[0.12em] text-[#999] uppercase whitespace-nowrap">Trending</span>
        </div>
        <div className="flex items-center gap-2 px-3 overflow-x-auto scrollbar-hide flex-1">
          {trending.map(article => (
            <Link
              key={article.id}
              href={`/article/${article.id}`}
              className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1 bg-gray-100 dark:bg-[#2A2A2A] hover:bg-[#D52B1E]/10 hover:text-[#D52B1E] transition-colors text-[11px] font-medium text-[#3a3a3a] dark:text-[#CCC] whitespace-nowrap rounded-full"
            >
              {article.isLive && (
                <span className="pulse-dot w-1.5 h-1.5 rounded-full bg-[#D52B1E] flex-shrink-0" />
              )}
              <span className="max-w-[180px] truncate">{article.headline}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
