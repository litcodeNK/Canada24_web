'use client';

import Link from 'next/link';
import Image from 'next/image';
import { clsx } from 'clsx';
import type { Article } from '@/context/AppContext';
import { useApp } from '@/context/AppContext';
import { useInteractions } from '@/context/InteractionsContext';
import { PlayButton } from './PlayButton';

interface ArticleCardProps {
  article: Article;
  compact?: boolean;
  vertical?: boolean;
  showEngagement?: boolean;
  className?: string;
}

export function ArticleCard({
  article,
  compact,
  vertical,
  showEngagement = true,
  className,
}: ArticleCardProps) {
  const { isArticleSaved, toggleSaveArticle } = useApp();
  const { getLikeCount, getCommentCount, getRepostCount } = useInteractions();
  const saved = isArticleSaved(article.id);

  const likeCount = getLikeCount(article.id) ?? article.likesCount ?? 0;
  const commentCount = getCommentCount(article.id) ?? article.commentsCount ?? 0;
  const repostCount = getRepostCount(article.id) ?? article.repostsCount ?? 0;

  /* ── Vertical card: image top, text below (for grids) ── */
  if (vertical) {
    return (
      <article className={clsx('group cursor-pointer', className)}>
        <Link href={`/article/${article.id}`} className="block">
          {/* Image */}
          <div className="relative w-full aspect-[16/9] bg-gray-100 dark:bg-[#2A2A2A] overflow-hidden mb-3">
            {article.imgUrl ? (
              <>
                <Image
                  src={article.imgUrl}
                  alt={article.headline}
                  fill
                  className="object-cover group-hover:scale-[1.02] transition-transform duration-500"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  loading="lazy"
                  unoptimized
                />
                {(article.duration || article.isLive) && (
                  <div className="absolute bottom-0 left-0 bg-black/70 text-white flex items-stretch max-w-[95%]">
                    <PlayButton className="w-10 flex-shrink-0" />
                    {article.duration && (
                      <p className="text-xs font-bold p-2 leading-tight font-sans">{article.duration}</p>
                    )}
                  </div>
                )}
              </>
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-canadaRed/10 to-canadaRed/5 flex items-center justify-center">
                <span className="font-display text-canadaRed/30 text-4xl">CN</span>
              </div>
            )}
            {article.isLive && (
              <div className="absolute top-2 left-2 flex items-center gap-1 bg-red-600 text-white px-1.5 py-0.5 text-[10px] font-bold tracking-wider uppercase font-sans">
                <span className="pulse-dot w-1.5 h-1.5 rounded-full bg-white flex-shrink-0" />
                LIVE
              </div>
            )}
          </div>

          {/* Text */}
          <div className="pt-0.5 pb-1">
            {article.category && (
              <span className="category-label block mb-1">{article.category}</span>
            )}
            <h3 className="font-serif font-bold text-[17px] leading-snug text-[#1a1a1a] dark:text-[#F5F5F5] mb-2 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors">
              {article.headline}
            </h3>
            <div className="flex items-center gap-1.5 flex-wrap font-sans">
              {article.isUpdated && (
                <span className="text-[9px] bebas tracking-widest text-[#999] border border-[#E8E8E8] dark:border-[#444] px-1.5 py-0.5">UPDATED</span>
              )}
              {article.author && (
                <span className="text-[12px] text-[#3a3a3a] dark:text-[#BBB] font-medium truncate max-w-[130px]">{article.author}</span>
              )}
              {article.author && <span className="text-gray-400 text-[12px]">·</span>}
              <time className="text-[12px] text-[#999]" dateTime={article.time}>{article.time}</time>
            </div>
          </div>
        </Link>

        {/* Engagement row */}
        {showEngagement && (
          <div className="flex items-center gap-3 pt-1 pb-1 border-t border-[#E8E8E8] dark:border-[#2A2A2A] mt-2">
            <MiniEngagement icon="heart" count={likeCount} />
            <MiniEngagement icon="comment" count={commentCount} />
            <MiniEngagement icon="repost" count={repostCount} />
            <div className="flex-1" />
            <button
              onClick={(e) => { e.preventDefault(); toggleSaveArticle(article); }}
              className={clsx('p-1.5 transition-colors', saved ? 'text-canadaRed' : 'text-[#999] hover:text-canadaRed')}
              aria-label={saved ? 'Unsave article' : 'Save article'}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill={saved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
              </svg>
            </button>
          </div>
        )}
      </article>
    );
  }

  /* ── Compact / default card: horizontal list style ── */
  return (
    <article className={clsx('group', className)}>
      <Link
        href={`/article/${article.id}`}
        className="flex gap-3 py-3 hover:bg-gray-50 dark:hover:bg-[#222] transition-colors items-start"
      >
        {/* Left: text */}
        <div className="flex-1 min-w-0">
          {article.category && (
            <span className="category-label block mb-1">{article.category}</span>
          )}
          <h3 className={clsx(
            'font-serif font-bold leading-tight text-[#1a1a1a] dark:text-[#F5F5F5] group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors',
            compact ? 'text-sm line-clamp-2' : 'text-[15px] line-clamp-3',
          )}>
            {article.headline}
          </h3>
          <div className="flex items-center gap-1.5 mt-1.5 flex-wrap font-sans">
            {article.isUpdated && (
              <span className="text-[9px] bebas tracking-widest text-[#999] border border-[#E8E8E8] dark:border-[#444] px-1 py-0.5">UPDATED</span>
            )}
            {article.author && (
              <span className="text-[11px] text-[#3a3a3a] dark:text-[#BBB] font-medium truncate max-w-[120px]">{article.author}</span>
            )}
            {article.author && <span className="text-gray-400 text-[11px]">·</span>}
            <time className="text-[11px] text-[#999]" dateTime={article.time}>{article.time}</time>
          </div>
        </div>

        {/* Right: thumbnail */}
        {article.imgUrl ? (
          <div className="relative flex-shrink-0 w-[140px] aspect-[1.5] overflow-hidden bg-gray-100 dark:bg-[#2A2A2A]">
            <Image
              src={article.imgUrl}
              alt={article.headline}
              fill
              className="object-cover"
              sizes="140px"
              loading="lazy"
              unoptimized
            />
            {article.isLive && (
              <div className="absolute bottom-1 left-1 bg-red-600 text-white text-[7px] font-bold px-1 py-0.5 flex items-center gap-0.5 font-sans">
                <span className="pulse-dot w-1 h-1 rounded-full bg-white inline-block" />
                LIVE
              </div>
            )}
          </div>
        ) : (
          <div className="flex-shrink-0 w-1 self-stretch bg-canadaRed rounded-r" />
        )}
      </Link>

      {/* Engagement */}
      {showEngagement && (
        <div className="flex items-center gap-3 pb-3 -mt-1 font-sans">
          <MiniEngagement icon="heart" count={likeCount} />
          <MiniEngagement icon="comment" count={commentCount} />
          <MiniEngagement icon="repost" count={repostCount} />
          <div className="flex-1" />
          <button
            onClick={(e) => { e.preventDefault(); toggleSaveArticle(article); }}
            className={clsx('p-1.5 transition-colors', saved ? 'text-canadaRed' : 'text-[#999] hover:text-canadaRed')}
            aria-label={saved ? 'Unsave article' : 'Save article'}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill={saved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
            </svg>
          </button>
        </div>
      )}
    </article>
  );
}

function MiniEngagement({ icon, count }: { icon: 'heart' | 'comment' | 'repost'; count: number }) {
  return (
    <div className="flex items-center gap-1 text-[#999]">
      {icon === 'heart' && (
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
        </svg>
      )}
      {icon === 'comment' && (
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
      )}
      {icon === 'repost' && (
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <polyline points="17,1 21,5 17,9"/>
          <path d="M3 11V9a4 4 0 0 1 4-4h14"/>
          <polyline points="7,23 3,19 7,15"/>
          <path d="M21 13v2a4 4 0 0 1-4 4H3"/>
        </svg>
      )}
      {count > 0 && <span className="text-[10px]">{count}</span>}
    </div>
  );
}
