'use client';

import Link from 'next/link';
import Image from 'next/image';
import { clsx } from 'clsx';
import type { Article } from '@/context/AppContext';
import { useApp, DEFAULT_ARTICLE_IMAGE } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
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
  const { user } = useAuth();
  const { getLikeCount, getCommentCount, getRepostCount, promptSignIn } = useInteractions();
  const saved = isArticleSaved(article.id);

  const handleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) {
      promptSignIn('save articles');
      return;
    }
    toggleSaveArticle(article);
  };

  const likeCount = getLikeCount(article.id) ?? article.likesCount ?? 0;
  const commentCount = getCommentCount(article.id) ?? article.commentsCount ?? 0;
  const repostCount = getRepostCount(article.id) ?? article.repostsCount ?? 0;

  /* ── Vertical card: image top, text below (for grids) ── */
  if (vertical) {
    return (
      <article className={clsx('group cursor-pointer rounded-xl bg-oxfordBlue dark:bg-oxfordBlueDark p-3', className)}>
        <Link href={`/article/${article.id}`} className="block">
          {/* Image */}
          <div className="relative w-full aspect-[16/9] bg-black/10 overflow-hidden rounded-lg mb-3">
            <Image
              src={article.imgUrl || DEFAULT_ARTICLE_IMAGE}
              alt={article.headline}
              fill
              className="object-cover group-hover:scale-[1.02] transition-transform duration-500"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              loading="lazy"
              unoptimized
            />
            {(article.duration || article.isLive) && (
              <div className="absolute bottom-0 left-0 bg-black/70 text-white flex items-stretch max-w-[95%] rounded-tr-lg overflow-hidden">
                <PlayButton className="w-10 flex-shrink-0" />
                {article.duration && (
                  <p className="text-xs font-bold p-2 leading-tight font-sans">{article.duration}</p>
                )}
              </div>
            )}
            {article.isLive && (
              <div className="absolute top-2 left-2 flex items-center gap-1 bg-red-600 text-white px-1.5 py-0.5 text-[10px] font-bold tracking-wider uppercase font-sans rounded">
                <span className="pulse-dot w-1.5 h-1.5 rounded-full bg-white flex-shrink-0" />
                LIVE
              </div>
            )}
          </div>

          {/* Text */}
          <div className="pt-0.5 pb-1">
            {article.category && (
              <span className="text-[11px] font-bold tracking-[0.08em] uppercase text-white/80 block mb-1">{article.category}</span>
            )}
            <h3 className="font-serif font-bold text-[17px] leading-snug text-white mb-2 group-hover:text-white/85 transition-colors">
              {article.headline}
            </h3>
            <div className="flex items-center gap-1.5 flex-wrap font-sans">
              {article.isUpdated && (
                <span className="text-[9px] bebas tracking-widest text-white/70 border border-white/30 px-1.5 py-0.5 rounded">UPDATED</span>
              )}
              {article.author && (
                <span className="text-[12px] text-white/80 font-medium truncate max-w-[130px]">{article.author}</span>
              )}
              {article.author && <span className="text-white/50 text-[12px]">·</span>}
              <time className="text-[12px] text-white/60" dateTime={article.time}>{article.time}</time>
            </div>
          </div>
        </Link>

        {/* Engagement row */}
        {showEngagement && (
          <div className="flex items-center gap-3 pt-1 pb-1 border-t border-white/15 mt-2">
            <MiniEngagement icon="heart" count={likeCount} />
            <MiniEngagement icon="comment" count={commentCount} />
            <MiniEngagement icon="repost" count={repostCount} />
            <div className="flex-1" />
            <button
              onClick={handleSave}
              className={clsx('p-1.5 transition-colors', saved ? 'text-white' : 'text-white/60 hover:text-white')}
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
    <article className={clsx('group rounded-xl bg-oxfordBlue dark:bg-oxfordBlueDark p-3', className)}>
      <Link
        href={`/article/${article.id}`}
        className="flex gap-3 items-start"
      >
        {/* Left: text */}
        <div className="flex-1 min-w-0">
          {article.category && (
            <span className="text-[11px] font-bold tracking-[0.08em] uppercase text-white/80 block mb-1">{article.category}</span>
          )}
          <h3 className={clsx(
            'font-serif font-bold leading-tight text-white group-hover:text-white/85 transition-colors',
            compact ? 'text-sm line-clamp-2' : 'text-[15px] line-clamp-3',
          )}>
            {article.headline}
          </h3>
          <div className="flex items-center gap-1.5 mt-1.5 flex-wrap font-sans">
            {article.isUpdated && (
              <span className="text-[9px] bebas tracking-widest text-white/70 border border-white/30 px-1 py-0.5 rounded">UPDATED</span>
            )}
            {article.author && (
              <span className="text-[11px] text-white/80 font-medium truncate max-w-[120px]">{article.author}</span>
            )}
            {article.author && <span className="text-white/50 text-[11px]">·</span>}
            <time className="text-[11px] text-white/60" dateTime={article.time}>{article.time}</time>
          </div>
        </div>

        {/* Right: thumbnail */}
        <div className="relative flex-shrink-0 w-[140px] aspect-[1.5] overflow-hidden rounded-lg bg-black/10">
          <Image
            src={article.imgUrl || DEFAULT_ARTICLE_IMAGE}
            alt={article.headline}
            fill
            className="object-cover"
            sizes="140px"
            loading="lazy"
            unoptimized
          />
          {article.isLive && (
            <div className="absolute bottom-1 left-1 bg-red-600 text-white text-[7px] font-bold px-1 py-0.5 flex items-center gap-0.5 font-sans rounded">
              <span className="pulse-dot w-1 h-1 rounded-full bg-white inline-block" />
              LIVE
            </div>
          )}
        </div>
      </Link>

      {/* Engagement */}
      {showEngagement && (
        <div className="flex items-center gap-3 pt-2 mt-2 border-t border-white/15 font-sans">
          <MiniEngagement icon="heart" count={likeCount} />
          <MiniEngagement icon="comment" count={commentCount} />
          <MiniEngagement icon="repost" count={repostCount} />
          <div className="flex-1" />
          <button
            onClick={handleSave}
            className={clsx('p-1.5 transition-colors', saved ? 'text-white' : 'text-white/60 hover:text-white')}
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
    <div className="flex items-center gap-1 text-white/60">
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
