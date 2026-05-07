'use client';

import Link from 'next/link';
import Image from 'next/image';
import type { Article } from '@/context/AppContext';
import { useApp } from '@/context/AppContext';
import { clsx } from 'clsx';

const CATEGORY_COLORS: Record<string, string> = {
  POLITICS: '#1565C0', WORLD: '#00695C', BUSINESS: '#E65100',
  HEALTH: '#1B5E20', SPORTS: '#D52B1E', TECHNOLOGY: '#01579B',
  ENTERTAINMENT: '#880E4F', IMMIGRATION: '#BF360C', INDIGENOUS: '#4A148C',
};

export function HeroCard({ article }: { article: Article }) {
  const { isArticleSaved, toggleSaveArticle } = useApp();
  const saved = isArticleSaved(article.id);
  const catColor = CATEGORY_COLORS[(article.category ?? '').toUpperCase()] ?? '#D52B1E';

  const excerpt = article.body
    ? article.body.slice(0, 180) + (article.body.length > 180 ? '…' : '')
    : null;

  return (
    <div className="group">

      {/* ── Large hero image — 16:9, NO text overlay, sharp corners ── */}
      {article.imgUrl ? (
        <Link href={`/article/${article.id}`} className="block mb-4">
          <figure className="relative w-full overflow-hidden">
            <div className="relative w-full aspect-[16/9] bg-gray-100 dark:bg-[#2A2A2A]">
              <Image
                src={article.imgUrl}
                alt={article.headline}
                fill
                className="object-cover group-hover:scale-[1.015] transition-transform duration-700"
                sizes="100vw"
                priority
                unoptimized
              />
              {/* LIVE badge */}
              {article.isLive && (
                <div className="absolute top-3 left-3 flex items-center gap-2 bg-[#D52B1E] text-white px-3 py-1 bebas tracking-widest text-sm">
                  <span className="pulse-dot w-2 h-2 rounded-full bg-white flex-shrink-0" />
                  LIVE
                </div>
              )}
              {/* Duration badge */}
              {article.duration && !article.isLive && (
                <div className="absolute bottom-3 right-3 bg-black/75 text-white text-xs font-medium px-2 py-0.5">
                  {article.duration}
                </div>
              )}
              {/* Photo attribution — NBC style bottom-right overlay */}
              {article.author && (
                <div className="absolute bottom-1.5 right-2">
                  <span className="text-[10px] text-white/70 font-medium drop-shadow">
                    {article.author}
                  </span>
                </div>
              )}
            </div>
          </figure>
        </Link>
      ) : (
        <div className="w-full aspect-[16/9] bg-gradient-to-br from-[#1a1a1a] to-[#333] mb-4 flex items-center justify-center">
          <span className="bebas text-white/10 text-8xl">247</span>
        </div>
      )}

      {/* ── Text below image ── */}
      <div className="lg:grid lg:grid-cols-[1fr_auto] lg:gap-8 lg:items-start">
        <div>
          {/* Category label — colored per section */}
          {article.category && (
            <span
              className="text-[11px] font-bold tracking-[0.1em] uppercase mb-2 block"
              style={{ color: catColor }}
            >
              {article.category}
            </span>
          )}

          {/* Headline */}
          <Link href={`/article/${article.id}`} className="group/link">
            <h2 className="font-extrabold text-[#1a1a1a] dark:text-[#F5F5F5] text-[1.6rem] sm:text-[2rem] leading-tight tracking-tight mb-3 group-hover/link:text-[#D52B1E] transition-colors">
              {article.headline}
            </h2>
          </Link>

          {/* Excerpt */}
          {excerpt && (
            <p className="text-[#3a3a3a] dark:text-[#BBB] text-[15px] leading-relaxed mb-3 line-clamp-2 max-w-[720px]">
              {excerpt}
            </p>
          )}

          {/* Byline */}
          <div className="flex items-center gap-2 flex-wrap">
            {article.isUpdated && (
              <span className="text-[9px] bebas tracking-widest text-[#999] border border-[#E8E8E8] dark:border-[#444] px-1.5 py-0.5">UPDATED</span>
            )}
            {article.author && (
              <span className="text-[13px] font-semibold text-[#3a3a3a] dark:text-[#CCC]">{article.author}</span>
            )}
            {article.author && <span className="text-[#CCC]">·</span>}
            <span className="text-[13px] text-[#999]">{article.time}</span>
          </div>
        </div>

        {/* Save button */}
        <button
          onClick={() => toggleSaveArticle(article)}
          className={clsx(
            'mt-3 lg:mt-1 flex items-center gap-1.5 text-[12px] font-medium border px-3 py-1.5 transition-colors whitespace-nowrap self-start',
            saved
              ? 'border-[#D52B1E] text-[#D52B1E] bg-[#D52B1E]/5'
              : 'border-[#E8E8E8] dark:border-[#333] text-[#999] hover:border-[#D52B1E] hover:text-[#D52B1E]',
          )}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill={saved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
          </svg>
          {saved ? 'Saved' : 'Save'}
        </button>
      </div>
    </div>
  );
}
