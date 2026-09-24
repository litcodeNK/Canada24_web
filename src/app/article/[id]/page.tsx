'use client';

import { useEffect, useState, useRef, type ReactNode } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useApp, DEFAULT_ARTICLE_IMAGE } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import { useInteractions } from '@/context/InteractionsContext';
import type { Article, RelatedCoverageItem } from '@/context/AppContext';
import { fetchArticleDetail } from '@/services/newsService';
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
    promptSignIn,
  } = useInteractions();

  const [article, setArticle] = useState<Article | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [speaking, setSpeaking] = useState(false);
  const [shareMenuOpen, setShareMenuOpen] = useState<'icon' | 'row' | null>(null);
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);
  const resumeIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const commentsSectionRef = useRef<HTMLElement | null>(null);
  const articleRef = useRef<Article | null>(null);
  // Once the network fetch below has won for the current id, the cache-lookup
  // effect must stop touching `article` — otherwise an unrelated later update
  // to topStories/communityStories/savedArticles (e.g. AppContext's periodic
  // refreshNews()) re-runs that effect, fails to find this id in the newly
  // fetched lists (it's often not a top story / not saved), and wipes out the
  // already-correct article back to null, hanging the page on the spinner
  // forever even though the real data loaded successfully.
  const detailLoadedRef = useRef(false);

  useEffect(() => {
    articleRef.current = article;
  }, [article]);

  // Reset display state whenever we navigate to a different article id, so
  // the previous article's content can't linger on screen under the new id.
  useEffect(() => {
    detailLoadedRef.current = false;
    setArticle(null);
    setNotFound(false);
  }, [id]);

  // Instant display from already-loaded state (top stories / community /
  // saved), if we have it — but this is never the source of truth, see below,
  // and it must defer once the network fetch has already resolved.
  useEffect(() => {
    if (detailLoadedRef.current) return;
    const all = [...topStories, ...communityStories, ...savedArticles];
    const found = all.find(a => a.id === id);
    if (found) {
      setArticle(found);
      hydrateArticleInteractions(found);
    }
  }, [id, topStories, communityStories, savedArticles]);

  // Always fetch the current article from the API and let it win over
  // whatever was shown from cache — a saved article's body can legitimately
  // change/lengthen after it was saved, and localStorage never re-validates.
  // This is also the ONLY path that loads an article that isn't in any
  // in-memory list at all (e.g. reached via Section/Local/Search).
  useEffect(() => {
    let cancelled = false;

    fetchArticleDetail(id)
      .then(fresh => {
        if (cancelled) return;
        detailLoadedRef.current = true;
        setArticle(fresh);
        setNotFound(false);
        hydrateArticleInteractions(fresh);
      })
      .catch(() => {
        if (cancelled) return;
        // Only show "not found" if we have nothing at all to display for
        // this id — a transient network failure shouldn't blow away a
        // perfectly good cached copy that's already on screen.
        if (!articleRef.current || articleRef.current.id !== id) {
          setNotFound(true);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  // related_coverage is enriched in the background by a Celery task kicked
  // off on first view — the initial fetch above can catch it mid-flight
  // (status "PENDING"). Poll the detail endpoint until it resolves so the
  // section appears without the user having to reload the page.
  useEffect(() => {
    if (article?.relatedCoverageStatus !== 'PENDING') return;

    let cancelled = false;
    const startedAt = Date.now();
    const POLL_INTERVAL_MS = 4000;
    const POLL_TIMEOUT_MS = 30000;

    const interval = setInterval(() => {
      if (Date.now() - startedAt > POLL_TIMEOUT_MS) {
        clearInterval(interval);
        return;
      }
      fetchArticleDetail(id)
        .then(fresh => {
          if (cancelled) return;
          setArticle(prev =>
            prev
              ? {
                  ...prev,
                  relatedCoverage: fresh.relatedCoverage,
                  relatedCoverageStatus: fresh.relatedCoverageStatus,
                }
              : fresh,
          );
          if (fresh.relatedCoverageStatus !== 'PENDING') {
            clearInterval(interval);
          }
        })
        .catch(() => {
          // Transient failure — let the next tick (or the timeout) handle it.
        });
    }, POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [id, article?.relatedCoverageStatus]);

  const stopSpeech = () => {
    window.speechSynthesis.cancel();
    if (resumeIntervalRef.current) {
      clearInterval(resumeIntervalRef.current);
      resumeIntervalRef.current = null;
    }
    setSpeaking(false);
  };

  const toggleSpeech = async () => {
    if (speaking) { stopSpeech(); return; }
    if (!article) return;

    window.speechSynthesis.cancel();

    // Android: getVoices() is empty until voiceschanged fires — wait for it
    const loadVoices = (): Promise<SpeechSynthesisVoice[]> =>
      new Promise(resolve => {
        const v = window.speechSynthesis.getVoices();
        if (v.length > 0) return resolve(v);
        window.speechSynthesis.onvoiceschanged = () =>
          resolve(window.speechSynthesis.getVoices());
      });

    const voices = await loadVoices();
    const voice = voices.find(v => v.lang.startsWith('en-CA'))
      ?? voices.find(v => v.lang.startsWith('en'));

    const text = [article.headline, ...(article.body ? [article.body] : FALLBACK_BODY)].join('. ');
    const utt = new SpeechSynthesisUtterance(text);
    if (voice) utt.voice = voice;
    utt.lang = voice?.lang ?? 'en-US';

    const cleanup = () => {
      if (resumeIntervalRef.current) {
        clearInterval(resumeIntervalRef.current);
        resumeIntervalRef.current = null;
      }
      setSpeaking(false);
    };
    utt.onend = cleanup;
    utt.onerror = cleanup;
    speechRef.current = utt;

    // iOS: wake up the synthesis engine
    window.speechSynthesis.resume();
    window.speechSynthesis.speak(utt);
    setSpeaking(true);

    // Android Chrome cuts synthesis off after ~15s — keep it alive with pause/resume
    resumeIntervalRef.current = setInterval(() => {
      if (!window.speechSynthesis.speaking) {
        clearInterval(resumeIntervalRef.current!);
        resumeIntervalRef.current = null;
        setSpeaking(false);
        return;
      }
      window.speechSynthesis.pause();
      window.speechSynthesis.resume();
    }, 14_000);
  };

  useEffect(() => {
    return () => {
      window.speechSynthesis?.cancel();
      if (resumeIntervalRef.current) clearInterval(resumeIntervalRef.current);
    };
  }, []);

  const toggleShareMenu = (which: 'icon' | 'row') => {
    setShareMenuOpen(prev => (prev === which ? null : which));
  };

  const handleAddComment = () => {
    if (!article || !commentText.trim()) return;
    if (!user) {
      promptSignIn('comment on stories');
      return;
    }
    addComment(article.id, commentText, user);
    setCommentText('');
  };

  const handleCommentIntent = () => {
    if (!user) {
      promptSignIn('comment on stories');
      return;
    }
    commentsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleSave = () => {
    if (!article) return;
    if (!user) {
      promptSignIn('save articles');
      return;
    }
    toggleSaveArticle(article);
  };

  if (notFound) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-white dark:bg-[#0D0D0D] px-4 text-center">
        <p className="font-serif font-black text-2xl text-[#1a1a1a] dark:text-[#F5F5F5]">
          Article not found
        </p>
        <p className="text-sm text-[#999] max-w-xs">
          This story may have been removed, or the link is incorrect.
        </p>
        <button
          onClick={() => router.push('/')}
          className="mt-2 px-5 py-2 rounded-full bg-canadaRed text-white text-sm font-bold tracking-wide hover:bg-canadaRedDark transition-colors"
        >
          Back to home
        </button>
      </div>
    );
  }

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
    .slice(0, 6);

  return (
    <div className="min-h-screen bg-white dark:bg-[#0D0D0D]">

      {/* ── STICKY TOP BAR ── */}
      <div className="sticky top-0 z-50 bg-white dark:bg-[#1A1A1A] border-b border-[#E8E8E8] dark:border-[#2A2A2A] shadow-sm">
        <div className="max-w-[1100px] mx-auto px-4 h-14 flex items-center gap-3">
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
              'flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 transition-colors rounded-full border',
              speaking
                ? 'bg-canadaRed text-white border-canadaRed'
                : 'text-[#999] border-[#E8E8E8] dark:border-[#333] hover:border-canadaRed hover:text-canadaRed',
            )}
          >
            {speaking ? (
              <>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
                <span>Stop</span>
              </>
            ) : (
              <>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21 5,3"/></svg>
                <span>Listen</span>
              </>
            )}
          </button>

          {/* Share */}
          <div className="relative">
            <button
              onClick={() => toggleShareMenu('icon')}
              className="text-[#999] hover:text-[#1a1a1a] dark:hover:text-white p-2 transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-[#2A2A2A]"
              aria-label="Share article"
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
              </svg>
            </button>
            {shareMenuOpen === 'icon' && article && (
              <ShareMenu url={typeof window !== 'undefined' ? window.location.href : ''} title={article.headline} onClose={() => setShareMenuOpen(null)} />
            )}
          </div>
        </div>
      </div>

      {/* ── ARTICLE CONTENT + SIDEBAR ── */}
      <div className="max-w-[1100px] mx-auto px-4 sm:px-6 pt-8 pb-12 lg:grid lg:grid-cols-[1fr_320px] lg:gap-10 lg:items-start">
      <article className="min-w-0">

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
        <h1 className="font-serif font-black text-[#1a1a1a] dark:text-[#F5F5F5] text-[1.75rem] sm:text-[2.25rem] leading-[1.15] tracking-tight mb-4">
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
          <div className="relative">
            <button
              onClick={() => toggleShareMenu('row')}
              className="flex items-center gap-2 text-xs font-medium text-[#3a3a3a] dark:text-[#CCC] border border-[#E8E8E8] dark:border-[#333] rounded-full px-3.5 py-1.5 hover:border-canadaRed hover:text-canadaRed transition-colors"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
              </svg>
              Share
            </button>
            {shareMenuOpen === 'row' && article && (
              <ShareMenu url={typeof window !== 'undefined' ? window.location.href : ''} title={article.headline} onClose={() => setShareMenuOpen(null)} align="left" />
            )}
          </div>

          <button
            onClick={handleSave}
            className={clsx(
              'flex items-center gap-2 text-xs font-medium border rounded-full px-3.5 py-1.5 transition-colors',
              saved
                ? 'border-canadaRed text-canadaRed bg-canadaRed/5'
                : 'border-[#E8E8E8] dark:border-[#333] text-[#3a3a3a] dark:text-[#CCC] hover:border-canadaRed hover:text-canadaRed',
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
              'flex items-center gap-2 text-xs font-medium border rounded-full px-3.5 py-1.5 transition-colors ml-auto',
              speaking
                ? 'border-canadaRed text-canadaRed bg-canadaRed/5'
                : 'border-[#E8E8E8] dark:border-[#333] text-[#3a3a3a] dark:text-[#CCC] hover:border-canadaRed hover:text-canadaRed',
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

        {/* 5. Hero image */}
        <figure className="mb-6">
          <div className="relative w-full aspect-[16/9] rounded-2xl bg-gray-100 dark:bg-[#1C1C1C] overflow-hidden shadow-sm">
            <Image
              src={article.imgUrl || DEFAULT_ARTICLE_IMAGE}
              alt={article.headline}
              fill
              className="object-cover"
              sizes="(max-width: 800px) 100vw, 800px"
              unoptimized
              priority
            />
            {article.isLive && (
              <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-canadaRed text-white px-3 py-1 rounded-full font-bold tracking-widest text-xs">
                <span className="pulse-dot w-2 h-2 rounded-full bg-white" />
                LIVE
              </div>
            )}
          </div>
          {/* 6. Caption */}
          {article.imgUrl && (
            <figcaption className="mt-2 text-[12px] text-[#999] italic leading-snug">
              {article.headline} — Canada 247
            </figcaption>
          )}
        </figure>

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

          {/* 7b. Related coverage (Brave Search enrichment) — only rendered
              once the backend has actually populated it. On the very first
              view of an article the status comes back PENDING (the fetch was
              just triggered), so the section stays hidden until a later load. */}
          <RelatedCoverage items={article.relatedCoverage} />

          {/* 8. Engagement bar */}
          <div className="flex items-center gap-2 py-4 border-t border-b border-[#E8E8E8] dark:border-[#2A2A2A] mb-8">
            <EngageButton
              active={reaction === 'like'}
              activeClass="bg-canadaRed/8 text-canadaRed border-canadaRed/30"
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

            <EngageButton
              active={false}
              activeClass=""
              onClick={handleCommentIntent}
              count={commentCount}
              label="Comment"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
            </EngageButton>

            <div className="flex-1" />

            <button
              onClick={handleSave}
              className={clsx(
                'flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-medium border transition-colors',
                saved
                  ? 'border-canadaRed text-canadaRed bg-canadaRed/5'
                  : 'border-[#E8E8E8] dark:border-[#333] text-[#999] hover:border-canadaRed hover:text-canadaRed',
              )}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill={saved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
              </svg>
              <span>{saved ? 'Saved' : 'Save'}</span>
            </button>
          </div>

          {/* 9. Comments section */}
          <section ref={commentsSectionRef}>
            <h2 className="font-sans font-bold text-lg tracking-wide text-[#1a1a1a] dark:text-white mb-5 flex items-center gap-2">
              <span>Comments</span>
              {commentCount > 0 && (
                <span className="text-sm font-normal text-[#999]">
                  ({commentCount})
                </span>
              )}
            </h2>

            {user ? (
              <div className="flex gap-3 mb-6">
                <div className="w-8 h-8 rounded-full bg-canadaRed flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                  {user.displayName?.[0]?.toUpperCase() ?? user.email[0].toUpperCase()}
                </div>
                <div className="flex-1 flex flex-col gap-2">
                  <textarea
                    value={commentText}
                    onChange={e => setCommentText(e.target.value)}
                    placeholder="Join the discussion…"
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-[#1C1C1C] border border-[#E8E8E8] dark:border-[#2A2A2A] text-sm outline-none focus:border-canadaRed dark:text-white placeholder:text-[#999] transition-colors resize-none"
                  />
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-[#999]">{commentText.length}/500 characters</span>
                    <button
                      onClick={handleAddComment}
                      disabled={!commentText.trim()}
                      className="px-5 py-2 rounded-full bg-canadaRed text-white text-sm font-bold tracking-wide disabled:opacity-40 hover:bg-canadaRedDark transition-colors"
                    >
                      Post comment
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mb-5 p-4 rounded-xl bg-gray-50 dark:bg-[#1C1C1C] border border-[#E8E8E8] dark:border-[#2A2A2A] text-center">
                <a href="/auth/email" className="text-canadaRed text-sm font-semibold hover:underline">
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
      </article>

      {/* ── MORE IN [SECTION] — sidebar list, beside the article ── */}
      {related.length > 0 && (
        <aside className="mt-10 lg:mt-0 lg:sticky lg:top-20">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-sans font-bold text-base tracking-wide text-[#1a1a1a] dark:text-white">
              More in <span className="text-canadaRed">{article.category}</span>
            </h2>
            <Link
              href={`/sections/${encodeURIComponent((article.category ?? '').toLowerCase())}`}
              className="text-[11px] font-semibold text-canadaRed hover:underline uppercase tracking-wide flex-shrink-0"
            >
              See all →
            </Link>
          </div>
          <div className="flex flex-col gap-3">
            {related.map(rel => (
              <RelatedArticleItem key={rel.id} article={rel} />
            ))}
          </div>
        </aside>
      )}
      </div>
    </div>
  );
}

function buildShareUrl(platform: 'facebook' | 'x' | 'whatsapp' | 'linkedin', url: string, title: string): string {
  const u = encodeURIComponent(url);
  const t = encodeURIComponent(title);
  switch (platform) {
    case 'facebook':
      return `https://www.facebook.com/sharer/sharer.php?u=${u}`;
    case 'x':
      return `https://twitter.com/intent/tweet?url=${u}&text=${t}`;
    case 'whatsapp':
      return `https://wa.me/?text=${t}%20${u}`;
    case 'linkedin':
      return `https://www.linkedin.com/sharing/share-offsite/?url=${u}`;
  }
}

function ShareMenuItem({ label, icon, onClick }: { label: string; icon: ReactNode; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-3.5 py-2.5 text-sm text-[#3a3a3a] dark:text-[#DDD] hover:bg-gray-50 dark:hover:bg-[#2A2A2A] transition-colors text-left"
    >
      <span className="flex-shrink-0 w-4 h-4 flex items-center justify-center">{icon}</span>
      {label}
    </button>
  );
}

/** Instagram has no public share-intent URL (unlike Facebook/X/WhatsApp/LinkedIn) —
 * Meta's own developer docs only cover native-app deep links that require an
 * image asset and a registered Facebook App ID, not a plain web hyperlink.
 * The standard workaround is copy-link + prompt the user to paste it into
 * their own Story/post/DM, which is what this does. */
function ShareMenu({
  url,
  title,
  onClose,
  align = 'right',
}: {
  url: string;
  title: string;
  onClose: () => void;
  /** Which edge the menu hangs from — 'right' for a trigger near the right
   * edge of its row, 'left' for one near the left (right-0 alone pushes a
   * 240px-wide menu off-screen when the trigger sits far left on the page). */
  align?: 'left' | 'right';
}) {
  const [message, setMessage] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const openShareWindow = (href: string) => {
    window.open(href, '_blank', 'noopener,noreferrer,width=600,height=500');
    onClose();
  };

  const copyLink = async (successMessage: string, closeDelayMs: number) => {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // clipboard not available — still show the message so the user knows something happened
    }
    setMessage(successMessage);
    setTimeout(onClose, closeDelayMs);
  };

  return (
    <div
      ref={menuRef}
      className={clsx(
        'absolute top-10 z-20 w-60 rounded-xl border border-[#E8E8E8] dark:border-[#2A2A2A] bg-white dark:bg-[#1a1a1a] shadow-lg overflow-hidden',
        align === 'right' ? 'right-0' : 'left-0',
      )}
    >
      {message ? (
        <div className="px-3.5 py-3 text-xs text-[#3a3a3a] dark:text-[#CCC]">{message}</div>
      ) : (
        <div className="py-1.5">
          <ShareMenuItem
            label="Facebook"
            onClick={() => openShareWindow(buildShareUrl('facebook', url, title))}
            icon={
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.78-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.77l-.44 2.89h-2.33v6.99A10 10 0 0 0 22 12z"/></svg>
            }
          />
          <ShareMenuItem
            label="X (Twitter)"
            onClick={() => openShareWindow(buildShareUrl('x', url, title))}
            icon={
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.9 2H22l-7.6 8.68L23.3 22H16.9l-5-6.53L6.1 22H3l8.13-9.29L2.7 2h6.6l4.5 5.97L18.9 2zm-1.2 18h1.7L7.4 4h-1.8l12.1 16z"/></svg>
            }
          />
          <ShareMenuItem
            label="WhatsApp"
            onClick={() => openShareWindow(buildShareUrl('whatsapp', url, title))}
            icon={
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12.04 2c-5.5 0-9.96 4.46-9.96 9.96 0 1.76.46 3.48 1.34 5L2 22l5.2-1.36a9.95 9.95 0 0 0 4.84 1.24h.01c5.5 0 9.96-4.46 9.96-9.96S17.54 2 12.04 2zm0 18.2c-1.5 0-2.98-.4-4.28-1.16l-.31-.18-3.09.81.82-3-.2-.31a8.2 8.2 0 0 1-1.26-4.4c0-4.54 3.7-8.24 8.24-8.24s8.24 3.7 8.24 8.24-3.7 8.24-8.24 8.24zm4.52-6.17c-.25-.12-1.47-.72-1.7-.81-.23-.08-.4-.12-.56.13-.17.25-.65.81-.8.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-2-1.23-.74-.66-1.24-1.47-1.39-1.72-.14-.25-.02-.38.11-.5.11-.11.25-.29.37-.44.12-.14.16-.25.25-.41.08-.17.04-.31-.02-.44-.06-.12-.56-1.36-.77-1.86-.2-.48-.41-.42-.56-.43-.14-.01-.31-.01-.48-.01-.17 0-.44.06-.67.31-.23.25-.87.85-.87 2.08 0 1.22.89 2.4 1.02 2.57.12.17 1.76 2.68 4.26 3.76.6.26 1.06.41 1.43.53.6.19 1.14.16 1.57.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.14-1.18-.06-.1-.23-.16-.48-.28z"/></svg>
            }
          />
          <ShareMenuItem
            label="LinkedIn"
            onClick={() => openShareWindow(buildShareUrl('linkedin', url, title))}
            icon={
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.34V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.38-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.07 2.07 0 1 1 0-4.14 2.07 2.07 0 0 1 0 4.14zM7.12 20.45H3.56V9h3.56v11.45z"/></svg>
            }
          />
          <ShareMenuItem
            label="Instagram"
            onClick={() => copyLink('Link copied! Instagram doesn’t support pasting a link directly — open the app and paste it into your Story, post, or a DM.', 3500)}
            icon={
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg>
            }
          />
          <div className="my-1 border-t border-[#E8E8E8] dark:border-[#2A2A2A]" />
          <ShareMenuItem
            label="Copy link"
            onClick={() => copyLink('Link copied!', 1500)}
            icon={
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
            }
          />
        </div>
      )}
    </div>
  );
}

function RelatedCoverage({ items }: { items?: RelatedCoverageItem[] }) {
  if (!items || items.length === 0) return null;

  return (
    <section className="mb-8 pt-6 border-t border-[#E8E8E8] dark:border-[#2A2A2A]">
      <h2 className="font-sans font-bold text-lg tracking-wide text-[#1a1a1a] dark:text-white mb-1">
        Related coverage
      </h2>
      <p className="text-[12px] text-[#999] mb-4">From other news sources</p>

      <div className="space-y-3">
        {items.map(item => (
          <a
            key={item.url}
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group block p-3.5 rounded-xl border border-[#E8E8E8] dark:border-[#2A2A2A] hover:border-canadaRed dark:hover:border-canadaRed transition-colors"
          >
            <div className="flex items-center gap-2 mb-1.5">
              {item.sourceFavicon && (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={item.sourceFavicon}
                  alt=""
                  width={14}
                  height={14}
                  className="rounded-sm flex-shrink-0"
                  loading="lazy"
                />
              )}
              <span className="text-[11px] font-semibold text-[#666] dark:text-[#AAA] truncate">
                {item.sourceHostname}
              </span>
              {item.age && (
                <>
                  <span className="text-[#E8E8E8] dark:text-[#444]">·</span>
                  <span className="text-[11px] text-[#999] flex-shrink-0">{item.age}</span>
                </>
              )}
            </div>

            <h3 className="font-serif font-bold text-[15px] leading-snug text-[#1a1a1a] dark:text-[#F5F5F5] group-hover:text-canadaRed transition-colors line-clamp-2">
              {item.title}
            </h3>

            {item.snippet && (
              <p className="mt-1 text-[13px] text-[#666] dark:text-[#AAA] leading-relaxed line-clamp-2">
                {item.snippet}
              </p>
            )}
          </a>
        ))}
      </div>
    </section>
  );
}

function RelatedArticleItem({ article }: { article: Article }) {
  return (
    <Link
      href={`/article/${article.id}`}
      className="group flex items-center gap-3 p-3 rounded-xl bg-oxfordBlue dark:bg-oxfordBlueDark hover:opacity-90 transition-opacity"
    >
      <div className="relative flex-shrink-0 w-20 h-14 rounded-lg overflow-hidden bg-black/10">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={article.imgUrl || DEFAULT_ARTICLE_IMAGE} alt="" className="w-full h-full object-cover" loading="lazy" />
      </div>
      <div className="flex-1 min-w-0">
        {article.category && (
          <span className="text-[10px] font-bold tracking-[0.08em] uppercase text-white/80 block mb-0.5">{article.category}</span>
        )}
        <h3 className="font-serif font-bold text-white text-[13px] leading-snug line-clamp-3 group-hover:text-white/85 transition-colors">
          {article.headline}
        </h3>
        <span className="text-[10px] text-white/60 block mt-1">{article.time}</span>
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
        'flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-medium border transition-colors',
        active
          ? activeClass
          : 'border-[#E8E8E8] dark:border-[#333] text-[#999] hover:border-canadaRed hover:text-canadaRed',
      )}
    >
      {children}
      {count > 0 && <span>{count}</span>}
    </button>
  );
}
