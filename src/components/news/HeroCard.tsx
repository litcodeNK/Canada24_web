'use client';

import Link from 'next/link';
import Image from 'next/image';
import type { Article } from '@/context/AppContext';
import { useApp } from '@/context/AppContext';
import { clsx } from 'clsx';
import { PlayButton } from './PlayButton';

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
    <article className="group mb-8">

      {/* Hero image — 16:9 with video overlay */}
      {article.imgUrl ? (
        <Link href={`/article/${article.id}`} className="block mb-4 relative" aria-label={`Read: ${article.headline}`}>
          <figure className="relative w-full overflow-hidden">
            <div className="relative w-full aspect-[16/9] bg-gray-100 dark:bg-[#2A2A2A]">
              <Image
                src={article.imgUrl}
                alt={article.headline}
                fill
                className="object-cover group-hover:scale-[1.015] transition-transform duration-700"
                sizes="(max-width: 1024px) 100vw, 800px"
                priority
                unoptimized
              />
              {/* LIVE badge */}
              {article.isLive && (
                <div className="absolute top-3 left-3 flex items-center gap-2 bg-red-600 text-white px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase">
                  <span className="pulse-dot w-1.5 h-1.5 rounded-full bg-white flex-shrink-0" />
                  LIVE
                </div>
              )}
              {/* Video overlay bar */}
              {(article.duration || article.isLive) && (
                <div className="absolute bottom-0 left-0 bg-black/70 text-white flex items-stretch max-w-[90%]">
                  <PlayButton className="w-12 flex-shrink-0" />
                  {article.duration && !article.isLive && (
                    <p className="text-sm font-bold p-3 leading-tight font-sans">
                      {article.duration}
                    </p>
                  )}
                </div>
              )}
              {/* Author attribution */}
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
          <span className="font-display text-white/10 text-8xl">CN</span>
        </div>
      )}

      {/* Text block */}
      <div className="lg:grid lg:grid-cols-[1fr_auto] lg:gap-8 lg:items-start">
        <div>
          {article.category && (
            <span
              className="text-[11px] font-bold tracking-[0.1em] uppercase mb-2 block font-sans"
              style={{ color: catColor }}
            >
              {article.category}
            </span>
          )}

          <Link href={`/article/${article.id}`}>
            <h1 className="font-serif font-black text-4xl leading-[1.1] mb-3 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors text-[#1a1a1a] dark:text-[#F5F5F5]">
              {article.headline}
            </h1>
          </Link>

          {excerpt && (
            <p className="font-serif text-[17px] text-gray-800 dark:text-[#BBB] leading-relaxed mb-3 max-w-[720px]">
              {excerpt}
            </p>
          )}

          {/* Byline */}
          <div className="flex items-center gap-2 flex-wrap font-sans">
            {article.isUpdated && (
              <span className="text-[9px] bebas tracking-widest text-[#999] border border-[#E8E8E8] dark:border-[#444] px-1.5 py-0.5">
                UPDATED
              </span>
            )}
            {article.author && (
              <span className="text-[13px] font-semibold text-[#3a3a3a] dark:text-[#CCC]">{article.author}</span>
            )}
            {article.author && <span className="text-gray-400">·</span>}
            <time className="text-[13px] text-[#999]" dateTime={article.time}>
              {article.time}
            </time>
          </div>
        </div>

        {/* Save button */}
        <button
          onClick={() => toggleSaveArticle(article)}
          className={clsx(
            'mt-3 lg:mt-1 flex items-center gap-1.5 text-[12px] font-medium border px-3 py-1.5 transition-colors whitespace-nowrap self-start font-sans',
            saved
              ? 'border-canadaRed text-canadaRed bg-canadaRed/5'
              : 'border-[#E8E8E8] dark:border-[#333] text-[#999] hover:border-canadaRed hover:text-canadaRed',
          )}
          aria-label={saved ? 'Unsave article' : 'Save article'}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill={saved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
          </svg>
          {saved ? 'Saved' : 'Save'}
        </button>
      </div>
    </article>
  );
}
