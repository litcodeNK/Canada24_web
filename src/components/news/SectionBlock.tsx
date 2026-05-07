'use client';

import Link from 'next/link';
import Image from 'next/image';
import { clsx } from 'clsx';
import type { Article } from '@/context/AppContext';
import { useApp } from '@/context/AppContext';

interface SectionBlockProps {
  title: string;
  color?: string;           // Section header color
  articles: Article[];      // Needs at least 5 for full layout; degrades gracefully
  layout?: 'standard' | 'reverse' | 'wide-left';
  className?: string;
}

/**
 * NBC News-style 3-column section block:
 *
 * standard / reverse:
 * ┌────────────────┬──────────────────────────┬────────────────┐
 * │ Text list      │   FEATURED (center)      │ Secondary      │
 * │ (2 text-only)  │   Large image + headline │ (2 with thumbs)│
 * └────────────────┴──────────────────────────┴────────────────┘
 *
 * wide-left (U.S. News style):
 * ┌──────────────────────────┬────────────────┬────────────────┐
 * │  FEATURED (large left)   │ 2 mid stories  │ 2 thumb stacks │
 * └──────────────────────────┴────────────────┴────────────────┘
 */
export function SectionBlock({
  title,
  color = '#D52B1E',
  articles,
  layout = 'standard',
  className,
}: SectionBlockProps) {
  if (articles.length === 0) return null;

  // Wide-left layout (screenshot 2 pattern)
  if (layout === 'wide-left') {
    const [featured, ...rest] = articles;
    const mid = rest.slice(0, 2);
    const thumbs = rest.slice(2, 4);
    return (
      <section className={clsx('py-6 border-b border-[#E8E8E8] dark:border-[#2A2A2A]', className)}>
        <SectionHeader title={title} color={color} />
        <div className="grid grid-cols-1 lg:grid-cols-[45fr_27.5fr_27.5fr] gap-0 lg:gap-6">
          {/* Left: large featured */}
          <div className="lg:border-r border-[#E8E8E8] dark:border-[#2A2A2A] lg:pr-6">
            <FeaturedCard article={featured} headlineSize="large" />
          </div>
          {/* Center: 2 mid stories */}
          {mid.length > 0 && (
            <div className="border-t lg:border-t-0 lg:border-r border-[#E8E8E8] dark:border-[#2A2A2A] pt-4 lg:pt-0 lg:pr-6">
              <div className="divide-y divide-[#E8E8E8] dark:divide-[#2A2A2A]">
                {mid.map(a => (
                  <div key={a.id} className="py-3 first:pt-0">
                    <MediumCard article={a} />
                  </div>
                ))}
              </div>
            </div>
          )}
          {/* Right: 2 thumbnail stories */}
          {thumbs.length > 0 && (
            <div className="border-t lg:border-t-0 border-[#E8E8E8] dark:border-[#2A2A2A] pt-4 lg:pt-0">
              <div className="divide-y divide-[#E8E8E8] dark:divide-[#2A2A2A]">
                {thumbs.map(a => (
                  <div key={a.id} className="py-3 first:pt-0">
                    <ThumbCard article={a} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    );
  }

  // Standard layout: text | featured | secondary (screenshot 1 Politics pattern)
  const textStories = articles.slice(0, 2);
  const featured = articles[2] ?? articles[0];
  const secondary = articles.slice(3, 5);

  // Fallback: if fewer than 3 stories, just show a vertical grid
  if (articles.length < 3) {
    return (
      <section className={clsx('py-6 border-b border-[#E8E8E8] dark:border-[#2A2A2A]', className)}>
        <SectionHeader title={title} color={color} />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map(a => (
            <ArticleVerticalCard key={a.id} article={a} />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className={clsx('py-6 border-b border-[#E8E8E8] dark:border-[#2A2A2A]', className)}>
      <SectionHeader title={title} color={color} />

      {/* 3-column grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[28fr_44fr_28fr] gap-0">

        {/* ── LEFT: text-only story list ── */}
        <div className="order-2 lg:order-1 lg:border-r border-[#E8E8E8] dark:border-[#2A2A2A] lg:pr-6 border-t lg:border-t-0 pt-4 lg:pt-0">
          <div className="divide-y divide-[#E8E8E8] dark:divide-[#2A2A2A]">
            {textStories.map(a => (
              <TextOnlyCard key={a.id} article={a} />
            ))}
          </div>
        </div>

        {/* ── CENTER: large featured story ── */}
        <div className="order-1 lg:order-2 lg:px-6">
          <FeaturedCard article={featured} headlineSize="medium" />
        </div>

        {/* ── RIGHT: secondary stories ── */}
        {secondary.length > 0 && (
          <div className="order-3 lg:border-l border-[#E8E8E8] dark:border-[#2A2A2A] lg:pl-6 border-t lg:border-t-0 pt-4 lg:pt-0">
            <div className="divide-y divide-[#E8E8E8] dark:divide-[#2A2A2A]">
              {secondary.map((a, idx) => (
                <div key={a.id} className="py-4 first:pt-0">
                  <SecondaryCard article={a} exclusive={idx === 1 && !a.imgUrl} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

/* ── Section Header ── */
function SectionHeader({ title, color }: { title: string; color: string }) {
  return (
    <div className="flex items-center justify-between mb-5 border-b border-[#E8E8E8] dark:border-[#2A2A2A] pb-3">
      <h2
        className="text-[1.2rem] sm:text-[1.35rem] font-extrabold leading-none tracking-tight"
        style={{ color }}
      >
        {title}
      </h2>
    </div>
  );
}

/* ── Featured card (center, large) ── */
function FeaturedCard({ article, headlineSize }: { article: Article; headlineSize: 'large' | 'medium' }) {
  const { isArticleSaved, toggleSaveArticle } = useApp();
  const saved = isArticleSaved(article.id);

  return (
    <div className="group">
      <Link href={`/article/${article.id}`} className="block">
        {/* Image with attribution */}
        {article.imgUrl ? (
          <figure className="relative w-full overflow-hidden mb-3">
            <div className="relative w-full aspect-[16/10] bg-gray-100 dark:bg-[#2A2A2A]">
              <Image
                src={article.imgUrl}
                alt={article.headline}
                fill
                className="object-cover group-hover:scale-[1.02] transition-transform duration-500"
                sizes="(max-width:1024px) 100vw, 520px"
                unoptimized
              />
              {article.isLive && (
                <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-[#D52B1E] text-white px-2.5 py-0.5 bebas tracking-widest text-xs">
                  <span className="pulse-dot w-1.5 h-1.5 rounded-full bg-white flex-shrink-0" />
                  LIVE
                </div>
              )}
              {/* Photo attribution */}
              {article.author && (
                <div className="absolute bottom-1 right-1.5">
                  <span className="text-[9px] text-white/75 drop-shadow-sm font-medium">
                    {article.author}
                  </span>
                </div>
              )}
            </div>
          </figure>
        ) : (
          <div className="w-full aspect-[16/10] bg-gradient-to-br from-[#1a1a1a] to-[#2a2a2a] flex items-center justify-center mb-3">
            <span className="bebas text-white/10 text-6xl">247</span>
          </div>
        )}

        {/* Category */}
        {article.category && (
          <span className="category-label block mb-1.5">{article.category}</span>
        )}

        {/* Headline */}
        <h3 className={clsx(
          'font-extrabold text-[#1a1a1a] dark:text-[#F5F5F5] leading-tight tracking-tight group-hover:text-[#D52B1E] transition-colors mb-2',
          headlineSize === 'large' ? 'text-[1.35rem] sm:text-[1.6rem]' : 'text-[1.1rem] sm:text-[1.25rem]',
        )}>
          {article.headline}
        </h3>

        {/* Excerpt */}
        {article.body && (
          <p className="text-[#3a3a3a] dark:text-[#BBB] text-[14px] leading-snug line-clamp-2 mb-2">
            {article.body.slice(0, 140)}{article.body.length > 140 ? '…' : ''}
          </p>
        )}

        <span className="timestamp">{article.time}</span>
      </Link>

      {/* Save */}
      <button
        onClick={() => toggleSaveArticle(article)}
        className={clsx('mt-2 text-[11px] flex items-center gap-1 transition-colors', saved ? 'text-[#D52B1E]' : 'text-[#999] hover:text-[#D52B1E]')}
      >
        <svg width="11" height="11" viewBox="0 0 24 24" fill={saved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
        </svg>
        {saved ? 'Saved' : 'Save'}
      </button>
    </div>
  );
}

/* ── Text-only card (left column) ── */
function TextOnlyCard({ article }: { article: Article }) {
  return (
    <div className="py-4 first:pt-0">
      <Link href={`/article/${article.id}`} className="group block">
        {article.category && (
          <span className="category-label block mb-1">{article.category}</span>
        )}
        <h3 className="font-bold text-[#1a1a1a] dark:text-[#F5F5F5] text-[15px] leading-snug group-hover:text-[#D52B1E] transition-colors mb-1.5">
          {article.headline}
        </h3>
        <span className="timestamp">{article.time}</span>
      </Link>
    </div>
  );
}

/* ── Secondary card (right column, image + headline) ── */
function SecondaryCard({ article, exclusive }: { article: Article; exclusive?: boolean }) {
  return (
    <div className="group">
      <Link href={`/article/${article.id}`} className="block">
        {article.imgUrl && (
          <div className="relative w-full aspect-[16/9] overflow-hidden mb-2 bg-gray-100 dark:bg-[#2A2A2A]">
            <Image
              src={article.imgUrl}
              alt={article.headline}
              fill
              className="object-cover group-hover:scale-[1.02] transition-transform duration-500"
              sizes="330px"
              unoptimized
            />
            {article.isLive && (
              <div className="absolute top-2 left-2 flex items-center gap-1 bg-[#D52B1E] text-white px-2 py-0.5 bebas tracking-widest text-[10px]">
                <span className="pulse-dot w-1.5 h-1.5 rounded-full bg-white flex-shrink-0" />
                LIVE
              </div>
            )}
          </div>
        )}

        {/* Exclusive badge */}
        {exclusive && (
          <div className="mb-1.5">
            <span className="inline-block bg-[#B8860B] text-white text-[9px] font-bold tracking-[0.1em] uppercase px-2 py-0.5">
              EXCLUSIVE
            </span>
          </div>
        )}

        {article.category && !exclusive && (
          <span className="category-label block mb-1">{article.category}</span>
        )}

        <h3 className="font-bold text-[#1a1a1a] dark:text-[#F5F5F5] text-[14px] leading-snug group-hover:text-[#D52B1E] transition-colors mb-1">
          {article.headline}
        </h3>
        <span className="timestamp">{article.time}</span>
      </Link>
    </div>
  );
}

/* ── Medium card (center column in wide-left) ── */
function MediumCard({ article }: { article: Article }) {
  return (
    <div className="group flex gap-3">
      {article.imgUrl && (
        <div className="relative flex-shrink-0 w-28 aspect-[4/3] overflow-hidden bg-gray-100 dark:bg-[#2A2A2A]">
          <Image src={article.imgUrl} alt={article.headline} fill className="object-cover" sizes="112px" unoptimized />
        </div>
      )}
      <div className="flex-1 min-w-0">
        {article.category && <span className="category-label block mb-0.5">{article.category}</span>}
        <Link href={`/article/${article.id}`}>
          <h3 className="font-bold text-[#1a1a1a] dark:text-[#F5F5F5] text-[14px] leading-snug group-hover:text-[#D52B1E] transition-colors line-clamp-3">
            {article.headline}
          </h3>
        </Link>
        <span className="timestamp block mt-1">{article.time}</span>
      </div>
    </div>
  );
}

/* ── Thumb card (right column in wide-left) ── */
function ThumbCard({ article }: { article: Article }) {
  return (
    <div className="group flex gap-3">
      {article.imgUrl && (
        <div className="relative flex-shrink-0 w-20 h-14 overflow-hidden bg-gray-100 dark:bg-[#2A2A2A]">
          <Image src={article.imgUrl} alt={article.headline} fill className="object-cover" sizes="80px" unoptimized />
        </div>
      )}
      <div className="flex-1 min-w-0">
        {article.category && <span className="category-label block mb-0.5">{article.category}</span>}
        <Link href={`/article/${article.id}`}>
          <h3 className="font-bold text-[#1a1a1a] dark:text-[#F5F5F5] text-[13px] leading-snug group-hover:text-[#D52B1E] transition-colors line-clamp-3">
            {article.headline}
          </h3>
        </Link>
      </div>
    </div>
  );
}

/* ── Simple vertical card fallback ── */
function ArticleVerticalCard({ article }: { article: Article }) {
  return (
    <Link href={`/article/${article.id}`} className="group block">
      {article.imgUrl && (
        <div className="relative w-full aspect-[16/9] overflow-hidden mb-2 bg-gray-100 dark:bg-[#2A2A2A]">
          <Image src={article.imgUrl} alt={article.headline} fill className="object-cover group-hover:scale-[1.02] transition-transform duration-500" sizes="33vw" unoptimized />
        </div>
      )}
      {article.category && <span className="category-label block mb-1">{article.category}</span>}
      <h3 className="font-bold text-[#1a1a1a] dark:text-[#F5F5F5] text-[15px] leading-snug group-hover:text-[#D52B1E] transition-colors">
        {article.headline}
      </h3>
      <span className="timestamp block mt-1">{article.time}</span>
    </Link>
  );
}
