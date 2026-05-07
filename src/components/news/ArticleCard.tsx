'use client';

import Link from 'next/link';
import Image from 'next/image';
import { clsx } from 'clsx';
import type { Article } from '@/context/AppContext';
import { useApp } from '@/context/AppContext';
import { useInteractions } from '@/context/InteractionsContext';

interface ArticleCardProps {
  article: Article;
  /** compact = horizontal thumbnail-right layout (list style) */
  compact?: boolean;
  /** vertical = full card with image on top (grid style) */
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
      <div className={clsx('group bg-white dark:bg-[#1C1C1C] card-hover', className)}>
        <Link href={`/article/${article.id}`} className="block">
          {/* Image */}
          <div className="relative w-full aspect-[16/9] bg-gray-100 dark:bg-[#2A2A2A] overflow-hidden">
            {article.imgUrl ? (
              <Image
                src={article.imgUrl}
                alt={article.headline}
                fill
                className="object-cover group-hover:scale-[1.02] transition-transform duration-500"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                unoptimized
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-[#D52B1E]/10 to-[#D52B1E]/5 flex items-center justify-center">
                <span className="bebas text-[#D52B1E]/30 text-4xl tracking-widest">247</span>
              </div>
            )}
            {article.isLive && (
              <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-[#D52B1E] text-white px-2 py-0.5 bebas tracking-widest text-xs">
                <span className="pulse-dot w-1.5 h-1.5 rounded-full bg-white inline-block" />
                LIVE
              </div>
            )}
            {article.duration && !article.isLive && (
              <div className="absolute bottom-2 right-2 bg-black/75 text-white text-[10px] font-medium px-1.5 py-0.5">
                {article.duration}
              </div>
            )}
          </div>

          {/* Text below image */}
          <div className="pt-2.5 pb-1">
            {article.category && (
              <span className="category-label block mb-1">{article.category}</span>
            )}
            <h3 className="headline-md text-[#1a1a1a] dark:text-[#F5F5F5] line-clamp-3 mb-2">
              {article.headline}
            </h3>
            <div className="flex items-center gap-1.5 flex-wrap">
              {article.isUpdated && (
                <span className="text-[9px] bebas tracking-widest text-[#999] border border-[#E8E8E8] dark:border-[#444] px-1.5 py-0.5">UPDATED</span>
              )}
              {article.author && (
                <span className="text-[12px] text-[#3a3a3a] dark:text-[#BBB] font-medium truncate max-w-[130px]">{article.author}</span>
              )}
              {article.author && <span className="text-[#999] text-[12px]">·</span>}
              <span className="timestamp">{article.time}</span>
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
              className={clsx('p-1.5 transition-colors', saved ? 'text-[#D52B1E]' : 'text-[#999] hover:text-[#D52B1E]')}
              aria-label={saved ? 'Unsave' : 'Save'}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill={saved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
              </svg>
            </button>
          </div>
        )}
      </div>
    );
  }

  /* ── Compact / default card: horizontal list style ── */
  return (
    <div className={clsx('group bg-white dark:bg-[#1C1C1C]', className)}>
      <Link
        href={`/article/${article.id}`}
        className={clsx(
          'flex gap-3 py-3 hover:bg-gray-50 dark:hover:bg-[#222] transition-colors',
          compact ? 'items-start' : 'items-start',
        )}
      >
        {/* Left: text */}
        <div className="flex-1 min-w-0">
          {article.category && (
            <span className="category-label block mb-1">{article.category}</span>
          )}
          <h3 className={clsx(
            'font-bold text-[#1a1a1a] dark:text-[#F5F5F5] leading-tight',
            compact ? 'text-sm line-clamp-2' : 'text-[15px] line-clamp-3',
          )}>
            {article.headline}
          </h3>
          <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
            {article.isUpdated && (
              <span className="text-[9px] bebas tracking-widest text-[#999] border border-[#E8E8E8] dark:border-[#444] px-1 py-0.5">UPDATED</span>
            )}
            {article.author && (
              <span className="text-[11px] text-[#3a3a3a] dark:text-[#BBB] font-medium truncate max-w-[120px]">{article.author}</span>
            )}
            {article.author && <span className="text-[#999] text-[11px]">·</span>}
            <span className="text-[11px] text-[#999]">{article.time}</span>
          </div>
        </div>

        {/* Right: thumbnail */}
        {article.imgUrl ? (
          <div className="relative flex-shrink-0 w-24 h-[64px] overflow-hidden bg-gray-100 dark:bg-[#2A2A2A]">
            <Image
              src={article.imgUrl}
              alt={article.headline}
              fill
              className="object-cover"
              sizes="96px"
              unoptimized
            />
            {article.isLive && (
              <div className="absolute bottom-1 left-1 bg-[#D52B1E] text-white text-[7px] bebas px-1 py-0.5 flex items-center gap-0.5">
                <span className="pulse-dot w-1 h-1 rounded-full bg-white inline-block" />
                LIVE
              </div>
            )}
            {article.duration && !article.isLive && (
              <div className="absolute bottom-1 right-1 bg-black/70 text-white text-[9px] px-1 py-0.5">
                {article.duration}
              </div>
            )}
          </div>
        ) : (
          /* No image: thin red left border accent */
          <div className="flex-shrink-0 w-1 self-stretch bg-[#D52B1E] rounded-r" />
        )}
      </Link>

      {/* Engagement */}
      {showEngagement && (
        <div className="flex items-center gap-3 pb-3 -mt-1">
          <MiniEngagement icon="heart" count={likeCount} />
          <MiniEngagement icon="comment" count={commentCount} />
          <MiniEngagement icon="repost" count={repostCount} />
          <div className="flex-1" />
          <button
            onClick={(e) => { e.preventDefault(); toggleSaveArticle(article); }}
            className={clsx('p-1.5 transition-colors', saved ? 'text-[#D52B1E]' : 'text-[#999] hover:text-[#D52B1E]')}
            aria-label={saved ? 'Unsave' : 'Save'}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill={saved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}

function MiniEngagement({ icon, count }: { icon: 'heart' | 'comment' | 'repost'; count: number }) {
  return (
    <div className="flex items-center gap-1 text-[#999]">
      {icon === 'heart' && (
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
        </svg>
      )}
      {icon === 'comment' && (
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
      )}
      {icon === 'repost' && (
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
