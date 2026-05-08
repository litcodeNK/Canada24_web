'use client';

import Link from 'next/link';
import Image from 'next/image';
import { clsx } from 'clsx';
import type { Article } from '@/context/AppContext';
import { useApp } from '@/context/AppContext';
import { PlayButton } from './PlayButton';

interface SectionBlockProps {
  title: string;
  color?: string;
  articles: Article[];
  layout?: 'standard' | 'reverse' | 'wide-left';
  className?: string;
}

export function SectionBlock({
  title,
  color = '#D52B1E',
  articles,
  layout = 'standard',
  className,
}: SectionBlockProps) {
  if (articles.length === 0) return null;

  if (layout === 'wide-left') {
    const [featured, ...rest] = articles;
    const mid = rest.slice(0, 2);
    const thumbs = rest.slice(2, 4);
    return (
      <section className={clsx('py-6 border-b border-dashed border-gray-300 dark:border-[#2A2A2A]', className)}>
        <SectionHeader title={title} color={color} />
        <div className="grid grid-cols-1 lg:grid-cols-[45fr_27.5fr_27.5fr] gap-0 lg:gap-6">
          <div className="lg:border-r border-gray-300 dark:border-[#2A2A2A] lg:pr-6">
            <FeaturedCard article={featured} headlineSize="large" />
          </div>
          {mid.length > 0 && (
            <div className="border-t lg:border-t-0 lg:border-r border-gray-300 dark:border-[#2A2A2A] pt-4 lg:pt-0 lg:pr-6">
              <div className="divide-y divide-dashed divide-gray-300 dark:divide-[#2A2A2A]">
                {mid.map(a => (
                  <div key={a.id} className="py-3 first:pt-0">
                    <MediumCard article={a} />
                  </div>
                ))}
              </div>
            </div>
          )}
          {thumbs.length > 0 && (
            <div className="border-t lg:border-t-0 border-gray-300 dark:border-[#2A2A2A] pt-4 lg:pt-0">
              <div className="divide-y divide-dashed divide-gray-300 dark:divide-[#2A2A2A]">
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

  const textStories = articles.slice(0, 2);
  const featured = articles[2] ?? articles[0];
  const secondary = articles.slice(3, 5);

  if (articles.length < 3) {
    return (
      <section className={clsx('py-6 border-b border-dashed border-gray-300 dark:border-[#2A2A2A]', className)}>
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
    <section className={clsx('py-6 border-b border-dashed border-gray-300 dark:border-[#2A2A2A]', className)}>
      <SectionHeader title={title} color={color} />

      <div className="grid grid-cols-1 lg:grid-cols-[28fr_44fr_28fr] gap-0">
        {/* Left: text-only */}
        <div className="order-2 lg:order-1 lg:border-r border-gray-300 dark:border-[#2A2A2A] lg:pr-6 border-t lg:border-t-0 pt-4 lg:pt-0">
          <div className="divide-y divide-dashed divide-gray-300 dark:divide-[#2A2A2A]">
            {textStories.map(a => (
              <TextOnlyCard key={a.id} article={a} />
            ))}
          </div>
        </div>

        {/* Center: featured */}
        <div className="order-1 lg:order-2 lg:px-6">
          <FeaturedCard article={featured} headlineSize="medium" />
        </div>

        {/* Right: secondary */}
        {secondary.length > 0 && (
          <div className="order-3 lg:border-l border-gray-300 dark:border-[#2A2A2A] lg:pl-6 border-t lg:border-t-0 pt-4 lg:pt-0">
            <div className="divide-y divide-dashed divide-gray-300 dark:divide-[#2A2A2A]">
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
    <div className="mb-5">
      <div className="w-12 h-1 bg-blue-500 mb-3" />
      <div className="flex items-center justify-between pb-3 border-b border-gray-300 dark:border-[#2A2A2A]">
        <h2
          className="font-sans font-bold text-lg tracking-wide"
          style={{ color }}
        >
          {title}
        </h2>
      </div>
    </div>
  );
}

/* ── Featured card ── */
function FeaturedCard({ article, headlineSize }: { article: Article; headlineSize: 'large' | 'medium' }) {
  const { isArticleSaved, toggleSaveArticle } = useApp();
  const saved = isArticleSaved(article.id);

  return (
    <div className="group cursor-pointer">
      <Link href={`/article/${article.id}`} className="block">
        {article.imgUrl ? (
          <figure className="relative w-full overflow-hidden mb-3">
            <div className="relative w-full aspect-[16/10] bg-gray-100 dark:bg-[#2A2A2A]">
              <Image
                src={article.imgUrl}
                alt={article.headline}
                fill
                className="object-cover group-hover:scale-[1.02] transition-transform duration-500"
                sizes="(max-width:1024px) 100vw, 520px"
                loading="lazy"
                unoptimized
              />
              {(article.duration || article.isLive) && (
                <div className="absolute bottom-0 left-0 bg-black/70 text-white flex items-stretch max-w-[95%]">
                  <PlayButton className="w-10 flex-shrink-0" />
                  {article.duration && !article.isLive && (
                    <p className="text-xs font-bold p-2 leading-tight font-sans">{article.duration}</p>
                  )}
                </div>
              )}
              {article.isLive && (
                <div className="absolute top-2 left-2 flex items-center gap-1 bg-red-600 text-white px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase font-sans">
                  <span className="pulse-dot w-1.5 h-1.5 rounded-full bg-white flex-shrink-0" />
                  LIVE
                </div>
              )}
            </div>
          </figure>
        ) : (
          <div className="w-full aspect-[16/10] bg-gradient-to-br from-[#1a1a1a] to-[#2a2a2a] flex items-center justify-center mb-3">
            <span className="font-display text-white/10 text-6xl">CN</span>
          </div>
        )}

        {article.category && (
          <span className="category-label block mb-1.5">{article.category}</span>
        )}

        <h3 className={clsx(
          'font-serif font-black leading-tight text-[#1a1a1a] dark:text-[#F5F5F5] group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors mb-2',
          headlineSize === 'large' ? 'text-2xl' : 'text-xl',
        )}>
          {article.headline}
        </h3>

        {article.body && (
          <p className="font-serif text-[16px] text-gray-800 dark:text-[#BBB] leading-relaxed line-clamp-2 mb-2">
            {article.body.slice(0, 140)}{article.body.length > 140 ? '…' : ''}
          </p>
        )}

        <time className="text-[12px] text-[#999] font-sans" dateTime={article.time}>
          {article.time}
        </time>
      </Link>

      <button
        onClick={() => toggleSaveArticle(article)}
        className={clsx('mt-2 text-[11px] flex items-center gap-1 transition-colors font-sans', saved ? 'text-canadaRed' : 'text-[#999] hover:text-canadaRed')}
        aria-label={saved ? 'Unsave article' : 'Save article'}
      >
        <svg width="11" height="11" viewBox="0 0 24 24" fill={saved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
        </svg>
        {saved ? 'Saved' : 'Save'}
      </button>
    </div>
  );
}

/* ── Text-only card ── */
function TextOnlyCard({ article }: { article: Article }) {
  return (
    <div className="py-4 first:pt-0">
      <Link href={`/article/${article.id}`} className="group block">
        {article.category && (
          <span className="category-label block mb-1">{article.category}</span>
        )}
        <h3 className="font-serif font-bold text-[17px] leading-snug text-[#1a1a1a] dark:text-[#F5F5F5] group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors mb-1.5">
          {article.headline}
        </h3>
        <time className="text-[12px] text-[#999] font-sans" dateTime={article.time}>{article.time}</time>
      </Link>
    </div>
  );
}

/* ── Secondary card ── */
function SecondaryCard({ article, exclusive }: { article: Article; exclusive?: boolean }) {
  return (
    <div className="group cursor-pointer">
      <Link href={`/article/${article.id}`} className="block">
        {article.imgUrl && (
          <div className="relative w-full aspect-[16/9] overflow-hidden mb-2 bg-gray-100 dark:bg-[#2A2A2A]">
            <Image
              src={article.imgUrl}
              alt={article.headline}
              fill
              className="object-cover group-hover:scale-[1.02] transition-transform duration-500"
              sizes="330px"
              loading="lazy"
              unoptimized
            />
            {article.isLive && (
              <div className="absolute top-2 left-2 flex items-center gap-1 bg-red-600 text-white px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase font-sans">
                <span className="pulse-dot w-1.5 h-1.5 rounded-full bg-white flex-shrink-0" />
                LIVE
              </div>
            )}
          </div>
        )}
        {exclusive && (
          <div className="mb-1.5">
            <span className="inline-block bg-yellow-400 text-black text-[9px] font-bold tracking-[0.1em] uppercase px-2 py-0.5">
              EXCLUSIVE
            </span>
          </div>
        )}
        {article.category && !exclusive && (
          <span className="category-label block mb-1">{article.category}</span>
        )}
        <h3 className="font-serif font-bold text-[17px] leading-snug text-[#1a1a1a] dark:text-[#F5F5F5] group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors mb-1">
          {article.headline}
        </h3>
        <time className="text-[12px] text-[#999] font-sans" dateTime={article.time}>{article.time}</time>
      </Link>
    </div>
  );
}

/* ── Medium card (wide-left center column) ── */
function MediumCard({ article }: { article: Article }) {
  return (
    <div className="group flex gap-3 cursor-pointer">
      {article.imgUrl && (
        <div className="relative flex-shrink-0 w-28 aspect-[4/3] overflow-hidden bg-gray-100 dark:bg-[#2A2A2A]">
          <Image src={article.imgUrl} alt={article.headline} fill className="object-cover" sizes="112px" loading="lazy" unoptimized />
        </div>
      )}
      <div className="flex-1 min-w-0">
        {article.category && <span className="category-label block mb-0.5">{article.category}</span>}
        <Link href={`/article/${article.id}`}>
          <h3 className="font-serif font-bold text-[15px] leading-snug text-[#1a1a1a] dark:text-[#F5F5F5] group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors line-clamp-3">
            {article.headline}
          </h3>
        </Link>
        <time className="text-[11px] text-[#999] block mt-1 font-sans" dateTime={article.time}>{article.time}</time>
      </div>
    </div>
  );
}

/* ── Thumb card (wide-left right column) ── */
function ThumbCard({ article }: { article: Article }) {
  return (
    <div className="group flex gap-3 cursor-pointer">
      {article.imgUrl && (
        <div className="relative flex-shrink-0 w-20 h-14 overflow-hidden bg-gray-100 dark:bg-[#2A2A2A]">
          <Image src={article.imgUrl} alt={article.headline} fill className="object-cover" sizes="80px" loading="lazy" unoptimized />
        </div>
      )}
      <div className="flex-1 min-w-0">
        {article.category && <span className="category-label block mb-0.5">{article.category}</span>}
        <Link href={`/article/${article.id}`}>
          <h3 className="font-serif font-bold text-[13px] leading-snug text-[#1a1a1a] dark:text-[#F5F5F5] group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors line-clamp-3">
            {article.headline}
          </h3>
        </Link>
      </div>
    </div>
  );
}

/* ── Vertical fallback card ── */
function ArticleVerticalCard({ article }: { article: Article }) {
  return (
    <Link href={`/article/${article.id}`} className="group block cursor-pointer">
      {article.imgUrl && (
        <div className="relative w-full aspect-[16/9] overflow-hidden mb-2 bg-gray-100 dark:bg-[#2A2A2A]">
          <Image src={article.imgUrl} alt={article.headline} fill className="object-cover group-hover:scale-[1.02] transition-transform duration-500" sizes="33vw" loading="lazy" unoptimized />
        </div>
      )}
      {article.category && <span className="category-label block mb-1">{article.category}</span>}
      <h3 className="font-serif font-bold text-[17px] leading-snug text-[#1a1a1a] dark:text-[#F5F5F5] group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors">
        {article.headline}
      </h3>
      <time className="text-[12px] text-[#999] block mt-1 font-sans" dateTime={article.time}>{article.time}</time>
    </Link>
  );
}
