'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import { useInteractions } from '@/context/InteractionsContext';
import type { Article } from '@/context/AppContext';
import { clsx } from 'clsx';

const FALLBACK_BODY = [
  "Canada continues to navigate complex domestic and international challenges as policymakers, communities, and institutions work toward resilient solutions.",
  "Industry experts and analysts emphasize the importance of evidence-based approaches while balancing the diverse needs of Canadians across all provinces and territories.",
  "Community leaders and advocacy groups have called for greater transparency and accountability in how decisions are made and implemented at both federal and provincial levels.",
  "The situation continues to evolve, with new developments expected in the coming days as stakeholders respond and further information becomes available.",
  "Canadians are encouraged to stay informed through trusted news sources and to engage with their elected representatives on issues affecting their daily lives.",
];

export default function ArticleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { topStories, communityStories, savedArticles, isArticleSaved, toggleSaveArticle } = useApp();
  const { user } = useAuth();
  const {
    hydrateArticleInteractions,
    getReaction,
    getLikeCount,
    getDislikeCount,
    getCommentCount,
    getRepostCount,
    isReposted,
    getComments,
    toggleLike,
    toggleDislike,
    toggleRepost,
    addComment,
  } = useInteractions();

  const [article, setArticle] = useState<Article | null>(null);
  const [commentText, setCommentText] = useState('');
  const [speaking, setSpeaking] = useState(false);
  const [shareTooltip, setShareTooltip] = useState(false);
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    const all = [...topStories, ...communityStories, ...savedArticles];
    const found = all.find(a => a.id === id);
    if (found) {
      setArticle(found);
      hydrateArticleInteractions(found);
    }
  }, [id, topStories, communityStories, savedArticles]);

  const toggleSpeech = () => {
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }
    if (!article) return;
    const text = [article.headline, ...(article.body ? [article.body] : FALLBACK_BODY)].join('. ');
    const utt = new SpeechSynthesisUtterance(text);
    utt.lang = 'en-CA';
    utt.onend = () => setSpeaking(false);
    utt.onerror = () => setSpeaking(false);
    speechRef.current = utt;
    window.speechSynthesis.speak(utt);
    setSpeaking(true);
  };

  useEffect(() => {
    return () => { window.speechSynthesis?.cancel(); };
  }, []);

  const handleShare = async () => {
    if (navigator.share && article) {
      try {
        await navigator.share({ title: article.headline, url: window.location.href });
      } catch {}
    } else {
      navigator.clipboard?.writeText(window.location.href);
      setShareTooltip(true);
      setTimeout(() => setShareTooltip(false), 2000);
    }
  };

  const handleAddComment = () => {
    if (!commentText.trim() || !user || !article) return;
    addComment(article.id, commentText, user);
    setCommentText('');
  };

  if (!article) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#0D0D0D]">
        <div className="w-8 h-8 border-2 border-[#D52B1E] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const saved = isArticleSaved(article.id);
  const reaction = getReaction(article.id);
  const likeCount = getLikeCount(article.id) ?? article.likesCount ?? 0;
  const dislikeCount = getDislikeCount(article.id) ?? article.dislikesCount ?? 0;
  const repostCount = getRepostCount(article.id) ?? article.repostsCount ?? 0;
  const commentCount = getCommentCount(article.id) ?? article.commentsCount ?? 0;
  const reposted = isReposted(article.id) ?? false;
  const comments = getComments(article.id);
  const bodyParagraphs = article.body ? [article.body] : FALLBACK_BODY;

  /* Related articles: same category, exclude current */
  const related = [...topStories, ...communityStories]
    .filter(a => a.id !== article.id && a.category === article.category)
    .slice(0, 4);

  return (
    <div className="min-h-screen bg-white dark:bg-[#0D0D0D]">

      {/* ── STICKY TOP BAR ── */}
      <div className="sticky top-0 z-50 bg-white dark:bg-[#1A1A1A] border-b border-[#E8E8E8] dark:border-[#2A2A2A] shadow-sm">
        <div className="max-w-[800px] mx-auto px-4 h-14 flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="text-[#1a1a1a] dark:text-white p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-[#2A2A2A] rounded transition-colors flex-shrink-0"
            aria-label="Go back"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <polyline points="15,18 9,12 15,6"/>
            </svg>
          </button>

          {article.category && (
            <Link
              href={`/sections/${encodeURIComponent(article.category.toLowerCase())}`}
              className="bebas text-[#D52B1E] tracking-widest text-sm hover:underline flex-shrink-0"
            >
              {article.category}
            </Link>
          )}

          <div className="flex-1 min-w-0" />

          {/* Audio listen */}
          <button
            onClick={toggleSpeech}
            className={clsx(
              'flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 transition-colors rounded border',
              speaking
                ? 'bg-[#D52B1E] text-white border-[#D52B1E]'
                : 'text-[#999] border-[#E8E8E8] dark:border-[#333] hover:border-[#D52B1E] hover:text-[#D52B1E]',
            )}
          >
            {speaking ? (
              <>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
                <span className="hidden sm:inline">Stop</span>
              </>
            ) : (
              <>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21 5,3"/></svg>
                <span className="hidden sm:inline">Listen</span>
              </>
            )}
          </button>

          {/* Share */}
          <div className="relative">
            <button
              onClick={handleShare}
              className="text-[#999] hover:text-[#1a1a1a] dark:hover:text-white p-2 transition-colors rounded hover:bg-gray-100 dark:hover:bg-[#2A2A2A]"
              aria-label="Share article"
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
              </svg>
            </button>
            {shareTooltip && (
              <div className="absolute right-0 top-10 bg-[#1a1a1a] text-white text-xs px-2.5 py-1.5 rounded whitespace-nowrap z-10">
                Link copied!
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── ARTICLE CONTENT ── */}
      <article className="max-w-[800px] mx-auto px-4 sm:px-6 pt-8 pb-12">

        {/* 1. Breadcrumb category */}
        {article.category && (
          <div className="mb-3">
            <Link
              href={`/sections/${encodeURIComponent(article.category.toLowerCase())}`}
              className="category-label hover:underline"
            >
              {article.category}
            </Link>
          </div>
        )}

        {/* 2. Headline — ABOVE the image */}
        <h1 className="font-extrabold text-[#1a1a1a] dark:text-[#F5F5F5] text-[1.75rem] sm:text-[2.25rem] leading-tight tracking-tight mb-4">
          {article.headline}
        </h1>

        {/* 3. Byline */}
        <div className="flex items-center gap-2 text-[13px] text-[#999] mb-5 flex-wrap">
          {article.author && (
            <span className="font-semibold text-[#3a3a3a] dark:text-[#CCC]">By {article.author}</span>
          )}
          {article.author && <span className="text-[#E8E8E8] dark:text-[#444]">·</span>}
          <time className="text-[#999]">{article.time}</time>
          {article.sourceUrl && (
            <>
              <span className="text-[#E8E8E8] dark:text-[#444]">·</span>
              <a
                href={article.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#D52B1E] hover:underline font-medium"
              >
                Source ↗
              </a>
            </>
          )}
          {article.isUpdated && (
            <span className="ml-1 text-[9px] bebas tracking-widest text-[#999] border border-[#E8E8E8] dark:border-[#444] px-1.5 py-0.5">UPDATED</span>
          )}
        </div>

        {/* 4. Share + Save action row */}
        <div className="flex items-center gap-2 mb-6 pb-5 border-b border-[#E8E8E8] dark:border-[#2A2A2A]">
          <button
            onClick={handleShare}
            className="flex items-center gap-2 text-xs font-medium text-[#3a3a3a] dark:text-[#CCC] border border-[#E8E8E8] dark:border-[#333] px-3 py-1.5 hover:border-[#D52B1E] hover:text-[#D52B1E] transition-colors"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
            </svg>
            Share
          </button>

          <button
            onClick={() => toggleSaveArticle(article)}
            className={clsx(
              'flex items-center gap-2 text-xs font-medium border px-3 py-1.5 transition-colors',
              saved
                ? 'border-[#D52B1E] text-[#D52B1E] bg-[#D52B1E]/5'
                : 'border-[#E8E8E8] dark:border-[#333] text-[#3a3a3a] dark:text-[#CCC] hover:border-[#D52B1E] hover:text-[#D52B1E]',
            )}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill={saved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
            </svg>
            {saved ? 'Saved' : 'Save'}
          </button>

          {/* Audio compact bar */}
          <button
            onClick={toggleSpeech}
            className={clsx(
              'flex items-center gap-2 text-xs font-medium border px-3 py-1.5 transition-colors ml-auto',
              speaking
                ? 'border-[#D52B1E] text-[#D52B1E] bg-[#D52B1E]/5'
                : 'border-[#E8E8E8] dark:border-[#333] text-[#3a3a3a] dark:text-[#CCC] hover:border-[#D52B1E] hover:text-[#D52B1E]',
            )}
          >
            {speaking ? (
              <>
                <div className="flex items-end gap-0.5 h-3">
                  {[1,2,3,4,5].map(i => (
                    <div key={i} className="w-0.5 bg-[#D52B1E] rounded-full wave-bar" style={{ height: 4 }} />
                  ))}
                </div>
                <span>Stop reading</span>
              </>
            ) : (
              <>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21 5,3"/></svg>
                <span>Listen</span>
              </>
            )}
          </button>
        </div>

        {/* 5. Hero image — constrained to article column width, NOT full viewport */}
        {article.imgUrl && (
          <figure className="mb-6 -mx-4 sm:-mx-6 lg:mx-0">
            <div className="relative w-full aspect-[16/9] bg-gray-100 dark:bg-[#1C1C1C] overflow-hidden">
              <Image
                src={article.imgUrl}
                alt={article.headline}
                fill
                className="object-cover"
                sizes="(max-width: 800px) 100vw, 800px"
                unoptimized
                priority
              />
              {article.isLive && (
                <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-[#D52B1E] text-white px-3 py-1 bebas tracking-widest text-sm">
                  <span className="pulse-dot w-2 h-2 rounded-full bg-white" />
                  LIVE
                </div>
              )}
            </div>
            {/* 6. Caption */}
            <figcaption className="px-4 sm:px-0 mt-2 text-[12px] text-[#999] italic leading-snug">
              {article.headline} — Canada 247
            </figcaption>
          </figure>
        )}

        {/* 7. Body text — slightly narrower for readability */}
        <div className="max-w-[680px] mx-auto">
          <div className="space-y-5 mb-8">
            {bodyParagraphs.map((para, i) => (
              <p
                key={i}
                className="text-[#3a3a3a] dark:text-[#DEDEDE] text-[1rem] leading-[1.75] font-normal"
              >
                {para}
              </p>
            ))}
          </div>

          {/* 8. Engagement bar */}
          <div className="flex items-center gap-2 py-4 border-t border-b border-[#E8E8E8] dark:border-[#2A2A2A] mb-8">
            <EngageButton
              active={reaction === 'like'}
              activeClass="bg-[#D52B1E]/8 text-[#D52B1E] border-[#D52B1E]/30"
              onClick={() => toggleLike(article.id)}
              count={likeCount}
              label="Like"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill={reaction === 'like' ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z"/>
                <path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/>
              </svg>
            </EngageButton>

            <EngageButton
              active={reaction === 'dislike'}
              activeClass="bg-gray-100 dark:bg-[#2A2A2A] text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600"
              onClick={() => toggleDislike(article.id)}
              count={dislikeCount}
              label="Dislike"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill={reaction === 'dislike' ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3H10z"/>
                <path d="M17 2h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17"/>
              </svg>
            </EngageButton>

            <EngageButton
              active={reposted}
              activeClass="bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border-green-300 dark:border-green-800"
              onClick={() => toggleRepost(article.id, reposted)}
              count={repostCount}
              label="Repost"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="17,1 21,5 17,9"/>
                <path d="M3 11V9a4 4 0 0 1 4-4h14"/>
                <polyline points="7,23 3,19 7,15"/>
                <path d="M21 13v2a4 4 0 0 1-4 4H3"/>
              </svg>
            </EngageButton>

            <div className="flex-1" />

            <button
              onClick={() => toggleSaveArticle(article)}
              className={clsx(
                'flex items-center gap-1.5 px-3 py-2 text-sm font-medium border transition-colors',
                saved
                  ? 'border-[#D52B1E] text-[#D52B1E] bg-[#D52B1E]/5'
                  : 'border-[#E8E8E8] dark:border-[#333] text-[#999] hover:border-[#D52B1E] hover:text-[#D52B1E]',
              )}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill={saved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
              </svg>
              <span>{saved ? 'Saved' : 'Save'}</span>
            </button>
          </div>

          {/* 9. Comments section */}
          <section>
            <h2 className="bebas tracking-widest text-[15px] dark:text-white mb-5 flex items-center gap-2">
              <span>COMMENTS</span>
              {commentCount > 0 && (
                <span className="text-xs font-normal text-[#999] normal-case bebas-reset" style={{ fontFamily: 'inherit' }}>
                  ({commentCount})
                </span>
              )}
            </h2>

            {user ? (
              <div className="flex gap-3 mb-6">
                <div className="w-8 h-8 rounded-full bg-[#D52B1E] flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                  {user.displayName?.[0]?.toUpperCase() ?? user.email[0].toUpperCase()}
                </div>
                <div className="flex-1 flex gap-2">
                  <input
                    type="text"
                    value={commentText}
                    onChange={e => setCommentText(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') handleAddComment(); }}
                    placeholder="Join the discussion…"
                    className="flex-1 px-3 py-2 bg-gray-50 dark:bg-[#1C1C1C] border border-[#E8E8E8] dark:border-[#2A2A2A] text-sm outline-none focus:border-[#D52B1E] dark:text-white placeholder:text-[#999] transition-colors"
                  />
                  <button
                    onClick={handleAddComment}
                    disabled={!commentText.trim()}
                    className="px-4 py-2 bg-[#D52B1E] text-white text-sm font-bold bebas tracking-wider disabled:opacity-40 hover:bg-[#B02010] transition-colors"
                  >
                    POST
                  </button>
                </div>
              </div>
            ) : (
              <div className="mb-5 p-4 bg-gray-50 dark:bg-[#1C1C1C] border border-[#E8E8E8] dark:border-[#2A2A2A] text-center">
                <a href="/auth/email" className="text-[#D52B1E] text-sm font-semibold hover:underline">
                  Sign in to join the discussion
                </a>
              </div>
            )}

            <div className="space-y-5">
              {comments.map(comment => (
                <div key={comment.id} className="flex gap-3 pb-5 border-b border-[#E8E8E8] dark:border-[#2A2A2A] last:border-0">
                  <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-[#2A2A2A] flex items-center justify-center text-[#3a3a3a] dark:text-[#CCC] text-sm font-bold flex-shrink-0">
                    {comment.authorName?.[0]?.toUpperCase() ?? '?'}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="text-[13px] font-semibold text-[#1a1a1a] dark:text-white">{comment.authorName}</span>
                      <span className="text-[11px] text-[#999]">{new Date(comment.createdAt).toLocaleDateString('en-CA')}</span>
                    </div>
                    <p className="text-[14px] text-[#3a3a3a] dark:text-[#CCC] leading-relaxed">{comment.text}</p>
                  </div>
                </div>
              ))}

              {comments.length === 0 && (
                <p className="text-[13px] text-[#999] text-center py-6">No comments yet. Be the first.</p>
              )}
            </div>
          </section>
        </div>

        {/* ── MORE IN [SECTION] ── */}
        {related.length > 0 && (
          <div className="mt-10 pt-6 border-t border-[#E8E8E8] dark:border-[#2A2A2A]">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-extrabold text-[1rem] tracking-tight">
                More in{' '}
                <Link
                  href={`/sections/${encodeURIComponent((article.category ?? '').toLowerCase())}`}
                  className="text-[#D52B1E] hover:underline"
                >
                  {article.category}
                </Link>
              </h2>
              <Link
                href={`/sections/${encodeURIComponent((article.category ?? '').toLowerCase())}`}
                className="text-[12px] font-semibold text-[#D52B1E] hover:underline uppercase tracking-wide"
              >
                See all →
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-0 divide-y sm:divide-y-0 divide-[#E8E8E8] dark:divide-[#2A2A2A]">
              {related.map(rel => (
                <RelatedArticleItem key={rel.id} article={rel} />
              ))}
            </div>
          </div>
        )}
      </article>
    </div>
  );
}

function RelatedArticleItem({ article }: { article: Article }) {
  return (
    <Link href={`/article/${article.id}`} className="group flex items-start gap-3 py-4 first:pt-0">
      {article.imgUrl && (
        <div className="flex-shrink-0 w-20 h-14 overflow-hidden bg-gray-100 dark:bg-[#2A2A2A] hidden sm:block">
          <img src={article.imgUrl} alt="" className="w-full h-full object-cover" loading="lazy" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        {article.category && (
          <span className="category-label block mb-0.5">{article.category}</span>
        )}
        <h3 className="font-bold text-[#1a1a1a] dark:text-[#F5F5F5] text-[14px] leading-snug group-hover:text-[#D52B1E] transition-colors line-clamp-3">
          {article.headline}
        </h3>
        <span className="text-[11px] text-[#999] block mt-1">{article.time}</span>
      </div>
    </Link>
  );
}

interface EngageButtonProps {
  active: boolean;
  activeClass: string;
  onClick: () => void;
  count: number;
  label: string;
  children: React.ReactNode;
}

function EngageButton({ active, activeClass, onClick, count, label, children }: EngageButtonProps) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className={clsx(
        'flex items-center gap-1.5 px-3 py-2 text-sm font-medium border transition-colors',
        active
          ? activeClass
          : 'border-[#E8E8E8] dark:border-[#333] text-[#999] hover:border-[#D52B1E] hover:text-[#D52B1E]',
      )}
    >
      {children}
      {count > 0 && <span>{count}</span>}
    </button>
  );
}
