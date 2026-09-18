'use client';

import Link from 'next/link';
import Image from 'next/image';
import { clsx } from 'clsx';
import type { Article } from '@/context/AppContext';
import { useApp } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import { useInteractions } from '@/context/InteractionsContext';
import { PlayButton } from './PlayButton';

interface SectionBlockProps {
  title: string;
  color?: string;
  articles: Article[];
  layout?: 'standard' | 'reverse' | 'wide-left';
  className?: string;
}

const CARD = 'bg-oxfordBlue dark:bg-oxfordBlueDark rounded-xl p-4';

export function SectionBlock({
  title,
  color = '#D52B1E',
  articles,
  layout = 'standard',
  className,
}: SectionBlockProps) {
  if (articles.length === 0) return null;

  if (layout === 'wide-left') {
    const [featured, ...rest] = articles.slice(0, 5);
    return (
      <section className={clsx('py-6', className)}>
        <SectionHeader title={title} color={color} />
        <div className={clsx(CARD, 'min-w-0 overflow-hidden mb-4')}>
          <FeaturedCard article={featured} headlineSize="large" />
        </div>
        {rest.length > 0 && (
          <div className="flex flex-col gap-4 min-w-0">
            {rest.map(a => (
              <div key={a.id} className={clsx(CARD, 'min-w-0 overflow-hidden')}>
                <MediumCard article={a} />
              </div>
            ))}
          </div>
        )}
      </section>
    );
  }

  const featured = articles[2] ?? articles[0];
  const rest = articles.filter(a => a.id !== featured.id).slice(0, 4);

  if (articles.length < 3) {
    return (
      <section className={clsx('py-6', className)}>
        <SectionHeader title={title} color={color} />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {articles.map(a => (
            <div key={a.id} className={clsx(CARD, 'min-w-0 overflow-hidden')}>
              <ArticleVerticalCard article={a} />
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className={clsx('py-6', className)}>
      <SectionHeader title={title} color={color} />

      <div className={clsx(CARD, 'min-w-0 overflow-hidden mb-4')}>
        <FeaturedCard article={featured} headlineSize="medium" />
      </div>

      {rest.length > 0 && (
        <div className="flex flex-col gap-4 min-w-0">
          {rest.map(a => (
            <div key={a.id} className={clsx(CARD, 'min-w-0 overflow-hidden')}>
              <MediumCard article={a} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

/* ── Section Header ── */
function SectionHeader({ title, color }: { title: string; color: string }) {
  return (
    <div className="mb-5">
      <div className="w-12 h-1 bg-blue-500 mb-3 rounded-full" />
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
  const { user } = useAuth();
  const { promptSignIn } = useInteractions();
  const saved = isArticleSaved(article.id);

  const handleSave = () => {
    if (!user) {
      promptSignIn('save articles');
      return;
    }
    toggleSaveArticle(article);
  };

  return (
    <div className="group cursor-pointer">
      <Link href={`/article/${article.id}`} className="flex flex-col sm:flex-row sm:items-start gap-4">
        <div className="relative w-full sm:w-2/5 flex-shrink-0 aspect-[16/10] sm:aspect-[4/3] overflow-hidden rounded-lg bg-black/10">
          {article.imgUrl ? (
            <Image
              src={article.imgUrl}
              alt={article.headline}
              fill
              className="object-cover group-hover:scale-[1.02] transition-transform duration-500"
              sizes="(max-width:640px) 100vw, 260px"
              loading="lazy"
              unoptimized
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-black/30 to-black/10 flex items-center justify-center">
              <span className="font-display text-white/20 text-4xl">CN</span>
            </div>
          )}
          {(article.duration || article.isLive) && (
            <div className="absolute bottom-0 left-0 bg-black/70 text-white flex items-stretch max-w-[95%] rounded-tr-lg overflow-hidden">
              <PlayButton className="w-10 flex-shrink-0" />
              {article.duration && !article.isLive && (
                <p className="text-xs font-bold p-2 leading-tight font-sans">{article.duration}</p>
              )}
            </div>
          )}
          {article.isLive && (
            <div className="absolute top-2 left-2 flex items-center gap-1 bg-red-600 text-white px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase font-sans rounded">
              <span className="pulse-dot w-1.5 h-1.5 rounded-full bg-white flex-shrink-0" />
              LIVE
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0 flex flex-col">
          {article.category && (
            <span className="text-[11px] font-bold tracking-[0.08em] uppercase text-white/80 block mb-1.5">{article.category}</span>
          )}

          <h3 className={clsx(
            'font-serif font-black leading-tight text-white group-hover:text-white/85 transition-colors mb-2 line-clamp-3',
            headlineSize === 'large' ? 'text-lg sm:text-xl lg:text-2xl' : 'text-base sm:text-lg lg:text-xl',
          )}>
            {article.headline}
          </h3>

          {article.body && (
            <p className="font-serif text-[13px] sm:text-[15px] text-white/75 leading-relaxed line-clamp-2 mb-2">
              {article.body.slice(0, 200)}{article.body.length > 200 ? '…' : ''}
            </p>
          )}

          <time className="text-[12px] text-white/60 font-sans mt-auto pt-1" dateTime={article.time}>
            {article.time}
          </time>
        </div>
      </Link>

      <button
        onClick={handleSave}
        className={clsx('mt-2 text-[11px] flex items-center gap-1 transition-colors font-sans', saved ? 'text-white' : 'text-white/60 hover:text-white')}
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

/* ── Row card: thumbnail + headline, the single style used for every non-featured article ── */
function MediumCard({ article }: { article: Article }) {
  return (
    <Link href={`/article/${article.id}`} className="group flex gap-3">
      <div className="relative flex-shrink-0 w-28 aspect-[4/3] overflow-hidden rounded-lg bg-black/10">
        {article.imgUrl ? (
          <Image
            src={article.imgUrl}
            alt={article.headline}
            fill
            className="object-cover group-hover:scale-[1.02] transition-transform duration-500"
            sizes="112px"
            loading="lazy"
            unoptimized
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-black/30 to-black/10 flex items-center justify-center">
            <span className="font-display text-white/20 text-lg">CN</span>
          </div>
        )}
        {article.isLive && (
          <div className="absolute bottom-1 left-1 flex items-center gap-1 bg-red-600 text-white px-1.5 py-0.5 text-[8px] font-bold tracking-wider uppercase font-sans rounded">
            <span className="pulse-dot w-1 h-1 rounded-full bg-white flex-shrink-0" />
            LIVE
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        {article.category && <span className="text-[10px] font-bold tracking-[0.08em] uppercase text-white/80 block mb-0.5">{article.category}</span>}
        <h3 className="font-serif font-bold text-[15px] leading-snug text-white group-hover:text-white/85 transition-colors line-clamp-2">
          {article.headline}
        </h3>
        {article.body && (
          <p className="font-serif text-[12px] text-white/70 leading-snug line-clamp-2 mt-1">
            {article.body.slice(0, 100)}{article.body.length > 100 ? '…' : ''}
          </p>
        )}
        <time className="text-[11px] text-white/60 block mt-1 font-sans" dateTime={article.time}>{article.time}</time>
      </div>
    </Link>
  );
}

/* ── Vertical fallback card ── */
function ArticleVerticalCard({ article }: { article: Article }) {
  return (
    <Link href={`/article/${article.id}`} className="group block cursor-pointer">
      <div className="relative w-full aspect-[16/9] overflow-hidden rounded-lg mb-2 bg-black/10">
        {article.imgUrl ? (
          <Image src={article.imgUrl} alt={article.headline} fill className="object-cover group-hover:scale-[1.02] transition-transform duration-500" sizes="33vw" loading="lazy" unoptimized />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-black/30 to-black/10 flex items-center justify-center">
            <span className="font-display text-white/20 text-3xl">CN</span>
          </div>
        )}
      </div>
      {article.category && <span className="text-[11px] font-bold tracking-[0.08em] uppercase text-white/80 block mb-1">{article.category}</span>}
      <h3 className="font-serif font-bold text-[17px] leading-snug text-white group-hover:text-white/85 transition-colors">
        {article.headline}
      </h3>
      <time className="text-[12px] text-white/60 block mt-1 font-sans" dateTime={article.time}>{article.time}</time>
    </Link>
  );
}
